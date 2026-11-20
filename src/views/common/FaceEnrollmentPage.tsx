import React, { useState, useRef } from 'react';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';
import { useApp } from '../../context/AppContext';
import { Student, FaceEnrollmentStatus } from '../../types';
import {
  loadFaceApi,
  computeDescriptor,
  loadImage,
  euclidean,
  MAX_FACE_SAMPLES,
  SAMPLE_CONSISTENCY_THRESHOLD,
} from '../../lib/face';
import {
  ScanFace,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Check,
  Shield,
  Search,
  Filter,
  UserCheck,
  AlertTriangle,
  Plus,
  X,
} from 'lucide-react';

export const FaceEnrollmentPage: React.FC = () => {
  const { students, updateFaceEnrollment, showToast, currentRole } = useApp();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Camera capture modal state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [descriptor, setDescriptor] = useState<number[] | null>(null);
  const [samples, setSamples] = useState<{ descriptor: number[]; image: string }[]>([]);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [captureError, setCaptureError] = useState('');
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sectionName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.faceStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const ensureModels = async () => {
    if (modelStatus === 'ready') return true;
    setModelStatus('loading');
    try {
      await loadFaceApi();
      setModelStatus('ready');
      return true;
    } catch (err) {
      console.error('Face model load failed', err);
      setModelStatus('error');
      setCaptureError('Face recognition engine could not be loaded. Check your connection and try again.');
      return false;
    }
  };

  const openEnrollmentModal = (student: Student) => {
    setSelectedStudent(student);
    setCapturedImage(null);
    setCapturedBlob(null);
    setDescriptor(null);
    setSamples([]);
    setCaptureError('');
    setConsentChecked(!!student.consentGiven);
    setCameraOpen(true);
    void ensureModels();
    void startWebcam();
  };

  const startWebcam = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCaptureError('This browser does not support camera access. Use “Use Student Photo” instead.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Enrollment webcam play interrupted:', e));
      }
    } catch (err) {
      console.warn('Webcam initialization notice:', err);
      setCaptureError('Camera permission was not granted. Allow camera access or use the student’s uploaded photo.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const analyze = async (canvas: HTMLCanvasElement, preview: string) => {
    setIsAnalyzing(true);
    setCaptureError('');
    try {
      if (!(await ensureModels())) return;
      const d = await computeDescriptor(canvas);
      if (!d) {
        setDescriptor(null);
        setCaptureError('No clear face was detected. Face the camera in good light and try again.');
        return;
      }
      if (samples.length >= MAX_FACE_SAMPLES) {
        setDescriptor(null);
        setCaptureError(`You already have ${MAX_FACE_SAMPLES} samples. Remove one to add another.`);
        return;
      }
      if (samples.length > 0 && euclidean(d, samples[0].descriptor) > SAMPLE_CONSISTENCY_THRESHOLD) {
        setDescriptor(null);
        setCaptureError('This face does not look like the earlier samples. Make sure only this student is in front of the camera.');
        return;
      }
      setDescriptor(d);
      setSamples(prev => [...prev, { descriptor: d, image: preview }].slice(0, MAX_FACE_SAMPLES));
      if (!capturedBlob) {
        const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.9));
        setCapturedBlob(blob);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCaptureSnapshot = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setCaptureError('Camera is not ready yet.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const preview = canvas.toDataURL('image/jpeg', 0.7);
    setCapturedImage(preview);
    stopWebcam();
    await analyze(canvas, preview);
  };

  const handleUseStudentPhoto = async () => {
    if (!selectedStudent?.avatar) return;
    try {
      const img = await loadImage(selectedStudent.avatar);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')?.drawImage(img, 0, 0);
      setCapturedImage(selectedStudent.avatar);
      stopWebcam();
      await analyze(canvas, selectedStudent.avatar);
    } catch {
      setCaptureError('Could not read the student’s uploaded photo.');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setDescriptor(null);
    setCaptureError('');
    void startWebcam();
  };

  const handleSubmitEnrollment = async () => {
    if (!selectedStudent) return;
    if (!consentChecked) {
      showToast('Consent acknowledgment is required to enroll biometric identity', 'error');
      return;
    }
    if (samples.length === 0) {
      showToast('No face sample captured yet', 'error');
      return;
    }

    setIsSubmitting(true);
    const ok = await updateFaceEnrollment(selectedStudent.id, 'Enrolled', true, {
      descriptors: samples.map(x => x.descriptor),
      snapshot: capturedBlob,
    });
    setIsSubmitting(false);
    if (ok) {
      setCameraOpen(false);
      stopWebcam();
      setSelectedStudent(null);
    }
  };

  const handleStatusOverride = (studentId: string, status: FaceEnrollmentStatus) => {
    updateFaceEnrollment(studentId, status, true);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScanFace className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Biometric Face Enrollment Roster</h2>
          </div>
          <p className="text-xs text-slate-400">
            Secure biometric enrollment registry. Capture reference vectors and enforce privacy consent compliance.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 bg-[#101624] border border-slate-800 rounded-lg text-emerald-400">
            {students.filter(s => s.faceStatus === 'Enrolled').length} Enrolled
          </div>
          <div className="px-3 py-1.5 bg-[#101624] border border-slate-800 rounded-lg text-amber-400">
            {students.filter(s => s.faceStatus === 'Pending' || s.faceStatus === 'Needs Review').length} Pending
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, enrollment ID or section..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#151C2B] text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-[#151C2B] text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Biometric Statuses</option>
            <option value="Enrolled">Enrolled Only</option>
            <option value="Pending">Pending Only</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Not Enrolled">Not Enrolled</option>
            <option value="Revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#101624] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Enrollment ID</th>
                <th className="py-3 px-4">Course & Class</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Enrollment Status</th>
                <th className="py-3 px-4">Enrollment Date</th>
                <th className="py-3 px-4">Consent</th>
                <th className="py-3 px-4 text-right">Biometric Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <NeutralAvatar src={student.avatar} name={student.name} size="sm" rounded="rounded-full" className="shrink-0" />
                      <span className="font-semibold text-slate-100">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{student.enrollmentNo}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {student.course} · {student.className}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{student.sectionName}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium ${
                        student.faceStatus === 'Enrolled'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : student.faceStatus === 'Needs Review'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          : student.faceStatus === 'Pending'
                          ? 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {student.faceStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{student.enrollmentDate || '—'}</td>
                  <td className="py-3 px-4">
                    {student.consentGiven ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Granted
                      </span>
                    ) : (
                      <span className="text-slate-500">Unsigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEnrollmentModal(student)}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-700/50 rounded-lg text-xs font-medium transition-colors"
                      >
                        {student.faceStatus === 'Enrolled' ? 'Re-enroll' : 'Enroll Face'}
                      </button>
                      {currentRole === 'admin' && (
                        <select
                          aria-label={`Change status for ${student.name}`}
                          value={student.faceStatus}
                          onChange={e =>
                            handleStatusOverride(student.id, e.target.value as FaceEnrollmentStatus)
                          }
                          className="bg-[#101624] text-[11px] text-slate-400 border border-slate-700 rounded px-1.5 py-1 focus:outline-none"
                        >
                          <option value="Enrolled">Enrolled</option>
                          <option value="Pending">Pending</option>
                          <option value="Needs Review">Needs Review</option>
                          <option value="Not Enrolled">Not Enrolled</option>
                          <option value="Revoked">Revoked</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capture Modal */}
      {cameraOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#151C2B] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Biometric Face Capture</h3>
                <p className="text-xs text-slate-400">
                  Enrolling: {selectedStudent.name} ({selectedStudent.enrollmentNo})
                </p>
              </div>
              <button
                onClick={() => {
                  stopWebcam();
                  setCameraOpen(false);
                }}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            {/* Video / Snapshot Viewport */}
            <div className="relative w-full aspect-video bg-[#0A0E17] rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center mb-4">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Face Guide Oval */}
                  <div className="absolute w-44 h-56 border-2 border-dashed border-cyan-400/70 rounded-full pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
                  <div className="absolute bottom-2 text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                    Position face within oval guideline
                  </div>
                </>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={capturedImage}
                    alt="Captured snapshot"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded ${
                      isAnalyzing ? 'bg-blue-500/90' : descriptor ? 'bg-emerald-500/90' : 'bg-rose-500/90'
                    }`}
                  >
                    {isAnalyzing ? 'ANALYZING FACE…' : descriptor ? `SAMPLE ${samples.length} ADDED` : 'NO FACE FOUND'}
                  </div>
                </div>
              )}
            </div>

            {(captureError || modelStatus === 'loading') && (
              <div
                className={`mb-4 p-2.5 rounded-lg text-[11px] border ${
                  captureError ? 'bg-rose-950/50 border-rose-800/60 text-rose-300' : 'bg-blue-950/40 border-blue-900/50 text-blue-300'
                }`}
              >
                {captureError || 'Loading face recognition engine…'}
              </div>
            )}

            {/* Face samples */}
            <div className="mb-4 p-3 bg-[#101624] border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="font-semibold text-slate-200">
                  Face samples: {samples.length} / {MAX_FACE_SAMPLES}
                </span>
                <span className="text-slate-500">3–5 samples work best</span>
              </div>
              {samples.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {samples.map((smp, i) => (
                    <div key={i} className="relative">
                      <img src={smp.image} alt={`Face sample ${i + 1}`} className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                      <button
                        type="button"
                        aria-label={`Remove sample ${i + 1}`}
                        onClick={() => setSamples(prev => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Capture the face looking straight, then slightly left, slightly right, and in different light. More samples make recognition more accurate.
                </p>
              )}
            </div>

            {/* Consent Box */}
            <div className="mb-4 p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl text-xs text-blue-200 space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-[#101624] text-blue-500 focus:ring-0"
                />
                <span className="text-[11px] leading-relaxed">
                  I confirm that biometric face vectors will be stored strictly for institutional attendance
                  verification in compliance with educational privacy protocols.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              {!capturedImage ? (
                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => void handleCaptureSnapshot()}
                    disabled={!!captureError && !streamRef.current}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Biometric Photo</span>
                  </button>
                  {selectedStudent.avatar && (
                    <button
                      type="button"
                      onClick={() => void handleUseStudentPhoto()}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Use Student Photo</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {samples.length < MAX_FACE_SAMPLES ? <Plus className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                    <span>{descriptor && samples.length < MAX_FACE_SAMPLES ? 'Add Another Sample' : 'Retake'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || isAnalyzing || samples.length === 0}
                    onClick={() => void handleSubmitEnrollment()}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Enrollment ({samples.length})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
