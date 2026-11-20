/**
 * Real in-browser face recognition (face detection + 128-d face descriptors).
 * Browser-only: the library is imported lazily so it never runs during SSR.
 */
const MODEL_URL = '/models/face';

type FaceApi = typeof import('@vladmandic/face-api');
let apiPromise: Promise<FaceApi> | null = null;

export function loadFaceApi(): Promise<FaceApi> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Face recognition runs in the browser only'));
  if (!apiPromise) {
    apiPromise = (async () => {
      const faceapi = (await import('@vladmandic/face-api/dist/face-api.esm.js')) as unknown as FaceApi;
      const tf = faceapi.tf as unknown as { setBackend: (b: string) => Promise<boolean>; ready: () => Promise<void> };
      try {
        const ok = await tf.setBackend('webgl');
        if (!ok) await tf.setBackend('cpu');
      } catch {
        await tf.setBackend('cpu');
      }
      await tf.ready();
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      return faceapi;
    })().catch(err => {
      apiPromise = null;
      throw err;
    });
  }
  return apiPromise;
}

export type FaceInput = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

/** Returns the descriptor of the single most prominent face, or null when no face is found. */
export async function computeDescriptor(input: FaceInput): Promise<number[] | null> {
  const faceapi = await loadFaceApi();
  const result = await faceapi
    .detectSingleFace(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  return result ? Array.from(result.descriptor) : null;
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
}

export interface Point {
  x: number;
  y: number;
}

export interface DetectedFace {
  box: { x: number; y: number; width: number; height: number };
  descriptor: Float32Array;
  /** Eye openness (eye aspect ratio, averaged over both eyes). ~0.3 open, under 0.2 closed. */
  ear: number;
  /** Head turn: nose position across the face, -0.5 (turned one way) … 0 (straight) … 0.5 (other way). */
  yaw: number;
}

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Eye aspect ratio from the six landmarks of one eye (68-point model order). */
export function eyeAspectRatio(eye: Point[]): number {
  const [p1, p2, p3, p4, p5, p6] = eye;
  const w = dist(p1, p4);
  if (!w) return 0;
  return (dist(p2, p6) + dist(p3, p5)) / (2 * w);
}

/** Eye openness and head turn from the 68 face landmarks. */
export function poseFromLandmarks(pts: Point[]): { ear: number; yaw: number } {
  const ear = (eyeAspectRatio(pts.slice(36, 42)) + eyeAspectRatio(pts.slice(42, 48))) / 2;
  const left = pts[0];
  const right = pts[16];
  const nose = pts[30];
  const width = right.x - left.x;
  const yaw = width ? (nose.x - left.x) / width - 0.5 : 0;
  return { ear, yaw };
}

export async function detectAllFaces(input: FaceInput): Promise<DetectedFace[]> {
  const faceapi = await loadFaceApi();
  const results = await faceapi
    .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
  return results.map(r => ({
    box: { x: r.detection.box.x, y: r.detection.box.y, width: r.detection.box.width, height: r.detection.box.height },
    descriptor: r.descriptor,
    ...poseFromLandmarks(r.landmarks.positions.map(p => ({ x: p.x, y: p.y }))),
  }));
}

export const euclidean = (a: ArrayLike<number>, b: ArrayLike<number>) => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] as number) - (b[i] as number);
    sum += d * d;
  }
  return Math.sqrt(sum);
};

/** Distance under which two descriptors are treated as the same person. */
export const MATCH_THRESHOLD = 0.5;
/** Most face samples kept per student. */
export const MAX_FACE_SAMPLES = 5;
/** A new enrollment sample further than this from the first one is probably a different person. */
export const SAMPLE_CONSISTENCY_THRESHOLD = 0.6;

const isDescriptor = (v: unknown): v is number[] =>
  Array.isArray(v) && v.length === 128 && v.every(n => typeof n === 'number');

/** Stored face data may be one signature (older records) or a list of samples. Returns the list. */
export function normalizeFaceSamples(value: unknown): number[][] {
  if (isDescriptor(value)) return [value];
  if (Array.isArray(value)) return value.filter(isDescriptor).slice(0, MAX_FACE_SAMPLES);
  return [];
}

/** Closest distance between a face and any of a student's samples. */
export function sampleDistance(descriptor: ArrayLike<number>, samples: number[][]): number {
  let best = Infinity;
  for (const s of samples) best = Math.min(best, euclidean(descriptor, s));
  return best;
}

export function bestMatch<T extends { id: string; descriptors: number[][] }>(
  descriptor: ArrayLike<number>,
  candidates: T[]
): { candidate: T; distance: number } | null {
  let best: { candidate: T; distance: number } | null = null;
  for (const c of candidates) {
    const d = sampleDistance(descriptor, c.descriptors);
    if (!best || d < best.distance) best = { candidate: c, distance: d };
  }
  return best && best.distance < MATCH_THRESHOLD ? best : null;
}

/**
 * Matches every face in a group photo, giving each student to at most one face
 * (the closest one). Returns one entry per face, with null when nobody matched.
 */
export function matchGroup<T extends { id: string; descriptors: number[][] }>(
  faces: ArrayLike<number>[],
  candidates: T[]
): ({ candidate: T; distance: number } | null)[] {
  const pairs: { face: number; cand: number; distance: number }[] = [];
  faces.forEach((f, fi) =>
    candidates.forEach((c, ci) => {
      const d = sampleDistance(f, c.descriptors);
      if (d < MATCH_THRESHOLD) pairs.push({ face: fi, cand: ci, distance: d });
    })
  );
  pairs.sort((a, b) => a.distance - b.distance);
  const out: ({ candidate: T; distance: number } | null)[] = faces.map(() => null);
  const usedCand = new Set<number>();
  for (const p of pairs) {
    if (out[p.face] || usedCand.has(p.cand)) continue;
    out[p.face] = { candidate: candidates[p.cand], distance: p.distance };
    usedCand.add(p.cand);
  }
  return out;
}

/* ---------- Liveness (anti photo-cheating) ---------- */

/** A blink needs one frame with eyes closed and one with eyes open; a head turn needs this much nose movement. */
export const LIVENESS = { closedEar: 0.2, openEar: 0.25, yawRange: 0.15 };

export interface LivenessState {
  frames: number;
  minEar: number;
  maxEar: number;
  minYaw: number;
  maxYaw: number;
}

export function updateLiveness(prev: LivenessState | undefined, sample: { ear: number; yaw: number }): LivenessState {
  if (!prev) return { frames: 1, minEar: sample.ear, maxEar: sample.ear, minYaw: sample.yaw, maxYaw: sample.yaw };
  return {
    frames: prev.frames + 1,
    minEar: Math.min(prev.minEar, sample.ear),
    maxEar: Math.max(prev.maxEar, sample.ear),
    minYaw: Math.min(prev.minYaw, sample.yaw),
    maxYaw: Math.max(prev.maxYaw, sample.yaw),
  };
}

/** True once the face has blinked or turned its head — something a printed or on-screen photo can't do. */
export function livenessPassed(st: LivenessState | undefined): 'blink' | 'turn' | null {
  if (!st) return null;
  if (st.minEar < LIVENESS.closedEar && st.maxEar > LIVENESS.openEar) return 'blink';
  if (st.maxYaw - st.minYaw > LIVENESS.yawRange) return 'turn';
  return null;
}
