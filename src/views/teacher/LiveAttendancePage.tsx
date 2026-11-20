import React, { useState, useRef, useEffect } from 'react';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { downloadCsvFile } from '../../services/api';
import { todayISO } from '../../lib/attendanceStats';
import {
  loadFaceApi,
  detectAllFaces,
  bestMatch,
  matchGroup,
  loadImage,
  updateLiveness,
  livenessPassed,
  type LivenessState,
} from '../../lib/face';
import {
  Camera,
  CameraOff,
  Play,
  Square,
  Download,
  Users,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Scan,
  RefreshCw,
  Info,
  Sliders,
  ShieldCheck,
  ImageUp,
  X,
  Eye,
} from 'lucide-react';

export const LiveAttendancePage: React.FC = () => {
  const {
    currentUser,
    teachers,
    classes,
    sections,
    subjects,
    students,
    attendanceRecords,
    academicYears,
    settings,
    markLiveAttendance,
    showToast,
  } = useApp();

  // Find teacher's assigned subjects & classes
  const currentTeacher =
    teachers.find(t => t.id === currentUser?.id || t.email === currentUser?.email);

  const teacherAssignments = currentTeacher?.assignments || [];

  // Only the teacher's real assignments can be selected
  const classOptions = classes.filter(c => teacherAssignments.some(a => a.classId === c.id));

  // Selection states ('' = first available option)
  const [pickedClassId, setSelectedClassId] = useState('');
  const [pickedSectionId, setSelectedSectionId] = useState('');
  const [pickedSubjectId, setSelectedSubjectId] = useState('');
  const selectedClassId = pickedClassId || classOptions[0]?.id || '';
  const sectionOptions = sections.filter(
    sec => sec.classId === selectedClassId && teacherAssignments.some(a => a.sectionId === sec.id)
  );
  const selectedSectionId =
    (sectionOptions.some(s => s.id === pickedSectionId) ? pickedSectionId : '') || sectionOptions[0]?.id || '';
  const subjectOptions = subjects.filter(sub =>
    teacherAssignments.some(a => a.sectionId === selectedSectionId && a.subjectId === sub.id)
  );
  const selectedSubjectId =
    (subjectOptions.some(s => s.id === pickedSubjectId) ? pickedSubjectId : '') || subjectOptions[0]?.id || '';
  const [attendanceDate, setAttendanceDate] = useState(todayISO());

  // Camera & Session states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [scanningTarget, setScanningTarget] = useState<{ name: string; confidence: number; waiting: boolean } | null>(null);
  const [requireLiveness, setRequireLiveness] = useState(true);
  const [waitingLive, setWaitingLive] = useState<Record<string, boolean>>({});
  const livenessRef = useRef(new Map<string, LivenessState>());
  const requireLivenessRef = useRef(requireLiveness);
  requireLivenessRef.current = requireLiveness;
  const [photoResult, setPhotoResult] = useState<{
    src: string;
    width: number;
    height: number;
    faces: { box: { x: number; y: number; width: number; height: number }; name: string | null; confidence: number }[];
  } | null>(null);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [engineStatus, setEngineStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [unknownFaces, setUnknownFaces] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionStartRef = useRef<number>(0);

  // Live session records
  const [sessionRecords, setSessionRecords] = useState<AttendanceRecord[]>([]);

  // Filter students belonging to this class & section
  const targetStudents = students.filter(
    s => s.classId === selectedClassId && s.sectionId === selectedSectionId && s.status === 'active'
  );
  const enrolledTargets = targetStudents
    .filter(s => s.faceStatus === 'Enrolled' && s.faceDescriptors.length > 0)
    .map(s => ({ id: s.id, name: s.name, descriptors: s.faceDescriptors }));
  const rosterKey = targetStudents.map(s => s.id).join(',');

  // Initialize session records with target students (pre-filled with already saved attendance for that day)
  useEffect(() => {
    if (isSessionActive) return;
    const subjectName = subjects.find(s => s.id === selectedSubjectId)?.name || '';
    const className = classes.find(c => c.id === selectedClassId)?.name || '';
    const sectionName = sections.find(s => s.id === selectedSectionId)?.name || '';
    const yearName = academicYears.find(y => y.isCurrent)?.name || '';
    const initialRecords: AttendanceRecord[] = targetStudents.map(student => {
      const existing = attendanceRecords.find(
        r => r.studentId === student.id && r.subjectId === selectedSubjectId && r.date === attendanceDate
      );
      return {
        id: existing?.id || `live-${student.id}`,
        studentId: student.id,
        studentName: student.name,
        studentEnrollment: student.enrollmentNo,
        studentPhoto: student.avatar,
        teacherId: currentTeacher?.id || '',
        teacherName: currentTeacher?.name || currentUser?.name || '',
        subjectId: selectedSubjectId,
        subjectName,
        classId: selectedClassId,
        className,
        sectionId: selectedSectionId,
        sectionName,
        academicYear: existing?.academicYear || yearName,
        date: attendanceDate,
        status: existing?.status || 'Absent',
        timeDetected: existing?.timeDetected || '—',
        confidenceScore: existing?.confidenceScore || 0,
        verified: existing?.verified || false,
      };
    });
    setSessionRecords(initialRecords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, selectedSectionId, selectedSubjectId, attendanceDate, rosterKey, attendanceRecords.length]);

  // Camera activation via WebRTC
  const startCamera = async (): Promise<boolean> => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Webcam access is not supported in this browser. You can still mark attendance manually below.');
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Camera stream play interrupted:', e));
      }
      setIsCameraActive(true);
      showToast('Camera feed connected successfully');
      return true;
    } catch (err) {
      console.warn('Camera access issue:', err);
      setCameraError('Camera permission was not granted. Allow camera access, or mark attendance manually below.');
      setIsCameraActive(false);
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsSessionActive(false);
    setScanningTarget(null);
    showToast('Camera session stopped', 'info');
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Real face recognition loop: compares live faces with the enrolled face signatures of this section
  const enrolledRef = useRef(enrolledTargets);
  enrolledRef.current = enrolledTargets;
  useEffect(() => {
    if (!isSessionActive || !isCameraActive) {
      setScanningTarget(null);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      const video = videoRef.current;
      if (cancelled) return;
      if (video && video.readyState >= 2 && video.videoWidth) {
        try {
          const faces = await detectAllFaces(video);
          if (cancelled) return;
          let unknown = 0;
          let shown: { name: string; confidence: number; waiting: boolean } | null = null;
          const waitingNow: Record<string, boolean> = {};
          const graceMs = (settings.attendanceWindowMinutes || 15) * 60 * 1000;
          for (const f of faces) {
            const match = bestMatch(f.descriptor, enrolledRef.current);
            if (!match) {
              unknown++;
              continue;
            }
            const confidence = Math.max(0, Math.min(1, 1 - match.distance));
            const live = updateLiveness(livenessRef.current.get(match.candidate.id), f);
            livenessRef.current.set(match.candidate.id, live);
            if (requireLivenessRef.current && !livenessPassed(live)) {
              waitingNow[match.candidate.id] = true;
              if (!shown) shown = { name: match.candidate.name, confidence, waiting: true };
              continue;
            }
            shown = { name: match.candidate.name, confidence, waiting: false };
            const late = Date.now() - sessionStartRef.current > graceMs;
            const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setSessionRecords(prev =>
              prev.map(r =>
                r.studentId === match.candidate.id && (r.status === 'Absent' || r.status === 'Pending Verification')
                  ? { ...r, status: late ? 'Late' : 'Present', timeDetected: time, confidenceScore: confidence, verified: true }
                  : r
              )
            );
          }
          setUnknownFaces(unknown);
          setScanningTarget(shown);
          setWaitingLive(waitingNow);
        } catch (err) {
          console.warn('Recognition frame failed', err);
        }
      }
      if (!cancelled) timer = setTimeout(tick, 250);
    };
    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isSessionActive, isCameraActive, settings.attendanceWindowMinutes]);

  const handleStartAttendance = async () => {
    if (!selectedSubjectId || targetStudents.length === 0) {
      showToast('Select an assigned class, section and subject that has students', 'error');
      return;
    }
    if (enrolledTargets.length === 0) {
      showToast('No students in this section have an enrolled face yet. Mark attendance manually or enroll faces first.', 'info');
    }
    setEngineStatus('loading');
    try {
      await loadFaceApi();
      setEngineStatus('ready');
    } catch (err) {
      console.error(err);
      setEngineStatus('error');
      showToast('Face recognition engine failed to load. You can still mark attendance manually.', 'error');
      return;
    }
    const camOk = isCameraActive || (await startCamera());
    if (!camOk) return;
    sessionStartRef.current = Date.now();
    livenessRef.current = new Map();
    setWaitingLive({});
    setIsSessionActive(true);
    showToast('Live attendance recognition session started');
  };

  // Group photo attendance: recognise every enrolled face in one uploaded class photo
  const handleClassPhoto = async (file: File) => {
    if (!selectedSubjectId || targetStudents.length === 0) {
      showToast('Select an assigned class, section and subject that has students', 'error');
      return;
    }
    if (enrolledTargets.length === 0) {
      showToast('No students in this section have an enrolled face yet', 'error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast('Photo is too large (max 15 MB)', 'error');
      return;
    }
    setIsPhotoProcessing(true);
    const src = URL.createObjectURL(file);
    try {
      await loadFaceApi();
      const img = await loadImage(src);
      const faces = await detectAllFaces(img);
      const matches = matchGroup(
        faces.map(f => f.descriptor),
        enrolledTargets
      );
      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const found = new Map<string, number>();
      matches.forEach(m => {
        if (m) found.set(m.candidate.id, Math.max(0, Math.min(1, 1 - m.distance)));
      });
      setSessionRecords(prev =>
        prev.map(r =>
          found.has(r.studentId) && r.status === 'Absent'
            ? { ...r, status: 'Present', timeDetected: time, confidenceScore: found.get(r.studentId) || 0, verified: true }
            : r
        )
      );
      setPhotoResult(prev => {
        if (prev) URL.revokeObjectURL(prev.src);
        return {
          src,
          width: img.naturalWidth,
          height: img.naturalHeight,
          faces: faces.map((f, i) => ({
            box: f.box,
            name: matches[i]?.candidate.name || null,
            confidence: matches[i] ? Math.max(0, Math.min(1, 1 - (matches[i]?.distance || 0))) : 0,
          })),
        };
      });
      if (faces.length === 0) showToast('No faces were found in this photo. Try a clearer, brighter photo.', 'error');
      else showToast(`Found ${faces.length} face${faces.length === 1 ? '' : 's'}, recognised ${found.size} student${found.size === 1 ? '' : 's'}. Review, then save.`);
    } catch (err) {
      console.error(err);
      URL.revokeObjectURL(src);
      showToast('Could not read this photo', 'error');
    } finally {
      setIsPhotoProcessing(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleEndSession = async () => {
    setIsSessionActive(false);
    setScanningTarget(null);
    await handleSaveAttendance();
  };

  const handleSaveAttendance = async () => {
    if (sessionRecords.length === 0 || !selectedSubjectId) {
      showToast('Nothing to save for this selection', 'error');
      return;
    }
    setIsSaving(true);
    await markLiveAttendance(sessionRecords);
    setIsSaving(false);
  };

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setSessionRecords(prev =>
      prev.map(r =>
        r.studentId === studentId
          ? {
              ...r,
              status: newStatus,
              timeDetected: newStatus === 'Absent' ? '—' : time,
              verified: true,
            }
          : r
      )
    );
  };

  const handleDownloadCsv = () => {
    const headers = [
      'Enrollment No',
      'Student Name',
      'Subject',
      'Class',
      'Section',
      'Date',
      'Attendance Status',
      'Detection Time',
      'Confidence Score',
    ];
    const rows = sessionRecords.map(r => [
      r.studentEnrollment,
      r.studentName,
      r.subjectName,
      r.className,
      r.sectionName,
      r.date,
      r.status,
      r.timeDetected,
      r.confidenceScore ? `${(r.confidenceScore * 100).toFixed(1)}%` : 'N/A',
    ]);
    downloadCsvFile(`Attendance_${r_className(selectedClassId)}_${selectedSectionId}_${attendanceDate}`, headers, rows);
    showToast('Attendance report CSV downloaded');
  };

  const r_className = (id: string) => classes.find(c => c.id === id)?.name || id;

  // Real-time counter metrics
  const totalInRoster = sessionRecords.length;
  const presentCount = sessionRecords.filter(r => r.status === 'Present').length;
  const lateCount = sessionRecords.filter(r => r.status === 'Late').length;
  const absentCount = sessionRecords.filter(r => r.status === 'Absent').length;
  const attendanceRate = totalInRoster > 0 ? (((presentCount + lateCount) / totalInRoster) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Session Configuration Card */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Attendance Session Parameters</span>
            </h2>
            <p className="text-xs text-slate-400">Select assigned class, section, and subject prior to scanning</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Teacher:</span>
            <span className="text-xs font-semibold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded">
              {currentTeacher?.name}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Class Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Class / Semester</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              disabled={isSessionActive}
              className="w-full px-3 py-2 bg-[#101624] text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {classOptions.length === 0 && <option value="">No assigned classes</option>}
              {classOptions.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Section Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Section</label>
            <select
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(e.target.value)}
              disabled={isSessionActive}
              className="w-full px-3 py-2 bg-[#101624] text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {sectionOptions.map(sec => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.studentCount} students)
                  </option>
                ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              disabled={isSessionActive}
              className="w-full px-3 py-2 bg-[#101624] text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {subjectOptions.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} · {sub.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Session Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              disabled={isSessionActive}
              className="w-full px-3 py-2 bg-[#101624] text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Central AI Face Recognition Camera & Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Scanning Frame (Col 7) */}
        <div className="lg:col-span-7 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
          {/* Header Controls */}
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scan className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white tracking-wide">Live AI Biometric Scanner</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSessionActive ? 'bg-emerald-400 animate-ping' : isCameraActive ? 'bg-cyan-400' : 'bg-slate-600'
                }`}
              />
              <span className="text-xs text-slate-400 font-medium">
                {isSessionActive ? 'Scanning Active' : isCameraActive ? 'Camera Standby' : 'Camera Idle'}
              </span>
            </div>
          </div>

          {/* Square Scanner Viewport */}
          <div className="relative w-full max-w-[480px] aspect-square rounded-2xl overflow-hidden bg-[#0A0E17] border border-slate-800 flex items-center justify-center shadow-inner group">
            {/* Real HTML5 Video element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isCameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Shown when the camera is off */}
            {!isCameraActive && (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-400">
                  <CameraOff className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300">Camera Feed Inactive</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Click "Start Camera" to enable browser webcam and initialize face detection frame.
                  </p>
                </div>
              </div>
            )}

            {/* Four Animated Corner Brackets */}
            {isCameraActive && (
              <>
                {/* Top-Left */}
                <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-corner-pulse pointer-events-none" />
                {/* Top-Right */}
                <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-corner-pulse pointer-events-none" />
                {/* Bottom-Left */}
                <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-corner-pulse pointer-events-none" />
                {/* Bottom-Right */}
                <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-cyan-400 rounded-br-lg shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-corner-pulse pointer-events-none" />

                {/* Laser Scanning Line Animation */}
                {isSessionActive && (
                  <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-scan-laser pointer-events-none z-10" />
                )}

                {/* Recognized face label */}
                {isSessionActive && scanningTarget && (
                  <div className="absolute z-20 w-44 h-52 border border-emerald-400/80 bg-emerald-500/10 rounded-xl flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all">
                    <div
                      className={`flex items-center justify-between text-[10px] font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded ${
                        scanningTarget.waiting ? 'text-amber-300' : 'text-emerald-300'
                      }`}
                    >
                      <span>{scanningTarget.waiting ? 'BLINK OR TURN HEAD' : 'CONFIRMED'}</span>
                      <span>{Math.round(scanningTarget.confidence * 100)}%</span>
                    </div>
                    <div className="text-[11px] font-semibold text-white bg-black/80 px-2 py-1 rounded text-center truncate shadow">
                      {scanningTarget.name}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Central Disclaimer Overlay */}
            <div className="absolute bottom-3 left-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[11px] text-cyan-300 font-medium">
                {isSessionActive
                  ? `Recognizing against ${enrolledTargets.length} enrolled face${enrolledTargets.length === 1 ? '' : 's'}${
                      requireLiveness ? ' · students must blink or turn their head' : ''
                    }`
                  : cameraError || 'Start attendance to recognize enrolled students automatically.'}
              </span>
            </div>
          </div>

          {/* Camera Action Buttons */}
          <div className="w-full flex flex-wrap items-center justify-center gap-3 mt-6">
            {!isCameraActive ? (
              <button
                onClick={() => void startCamera()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera</span>
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                <CameraOff className="w-4 h-4" />
                <span>Stop Camera</span>
              </button>
            )}

            {!isSessionActive ? (
              <button
                onClick={() => void handleStartAttendance()}
                disabled={engineStatus === 'loading'}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{engineStatus === 'loading' ? 'Loading Face Engine…' : 'Start Attendance'}</span>
              </button>
            ) : (
              <button
                onClick={() => void handleEndSession()}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/30 transition-all"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>End Session</span>
              </button>
            )}

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#101624] hover:bg-[#1E273A] border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download Report</span>
            </button>

            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={isPhotoProcessing || isSessionActive}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#101624] hover:bg-[#1E273A] disabled:opacity-50 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
            >
              <ImageUp className="w-4 h-4 text-cyan-400" />
              <span>{isPhotoProcessing ? 'Reading Photo…' : 'Mark from Class Photo'}</span>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              aria-label="Upload class photo"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) void handleClassPhoto(f);
              }}
            />

            {!isSessionActive && (
              <button
                onClick={() => void handleSaveAttendance()}
                disabled={isSaving || sessionRecords.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving…' : 'Save Attendance'}</span>
              </button>
            )}
          </div>

          <label className="mt-4 flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={requireLiveness}
              disabled={isSessionActive}
              onChange={e => setRequireLiveness(e.target.checked)}
              className="rounded border-slate-700 bg-[#101624] text-blue-500 focus:ring-0"
            />
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Anti-cheating check: student must blink or turn their head (stops printed or phone photos)</span>
          </label>

          {photoResult && (
            <div className="w-full mt-5 p-3 bg-[#101624] border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-semibold text-slate-200">
                  Class photo: {photoResult.faces.filter(f => f.name).length} of {photoResult.faces.length} faces recognised
                </span>
                <button
                  type="button"
                  aria-label="Close class photo"
                  onClick={() => {
                    URL.revokeObjectURL(photoResult.src);
                    setPhotoResult(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative w-full rounded-lg overflow-hidden">
                <img src={photoResult.src} alt="Uploaded class photo" className="w-full h-auto block" />
                {photoResult.faces.map((f, i) => (
                  <div
                    key={i}
                    className={`absolute border-2 rounded ${f.name ? 'border-emerald-400' : 'border-rose-400'}`}
                    style={{
                      left: `${(f.box.x / photoResult.width) * 100}%`,
                      top: `${(f.box.y / photoResult.height) * 100}%`,
                      width: `${(f.box.width / photoResult.width) * 100}%`,
                      height: `${(f.box.height / photoResult.height) * 100}%`,
                    }}
                  >
                    <span
                      className={`absolute left-0 -top-5 whitespace-nowrap text-[10px] font-semibold px-1 rounded ${
                        f.name ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {f.name ? `${f.name} ${Math.round(f.confidence * 100)}%` : 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Recognised students were marked Present in the roster below. Photos can't be checked for blinking, so review the list, then press Save Attendance.
              </p>
            </div>
          )}
        </div>

        {/* Live Metrics Column (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span>Session Telemetry</span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">{attendanceRate}% Rate</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Total Roster */}
              <div className="bg-[#101624] p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Total Students</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">{totalInRoster}</div>
              </div>

              {/* Present Count */}
              <div className="bg-[#101624] p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Present</span>
                </div>
                <div className="text-xl font-bold text-emerald-400 font-mono">{presentCount}</div>
              </div>

              {/* Late Arrivals */}
              <div className="bg-[#101624] p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Late</span>
                </div>
                <div className="text-xl font-bold text-amber-400 font-mono">{lateCount}</div>
              </div>

              {/* Absent */}
              <div className="bg-[#101624] p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-rose-400 text-xs mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Absent</span>
                </div>
                <div className="text-xl font-bold text-rose-400 font-mono">{absentCount}</div>
              </div>
            </div>

            {/* Unknown Faces / Pending verification */}
            <div className="mt-3 p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-300">
                <HelpCircle className="w-4 h-4 shrink-0 text-blue-400" />
                <span>Unrecognized faces in frame:</span>
              </div>
              <span className="font-mono font-bold text-blue-300">{unknownFaces}</span>
            </div>
            <div className="mt-2 p-3 bg-[#101624] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-400">Face-enrolled students in roster:</span>
              <span className="font-mono font-bold text-slate-200">
                {enrolledTargets.length} / {targetStudents.length}
              </span>
            </div>
          </div>

          {/* Privacy & Protocol Guidelines */}
          <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h4 className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Biometric Ethics & Protocol</span>
            </h4>
            <ul className="text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
              <li>· Facial embeddings are compared strictly against registered enrollment vectors.</li>
              <li>· Real-time frames are processed in memory and not archived without student consent.</li>
              <li>· Faculty can manually override status in the live table below if lighting is low.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Live Attendance Table */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Live Student Verification Roster</h3>
            <p className="text-xs text-slate-400">
              Real-time recognition feedback. You can manually adjust status or verify students.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Re-mark all as absent
                setSessionRecords(prev =>
                  prev.map(r => ({ ...r, status: 'Absent', timeDetected: '—' }))
                );
                showToast('Reset all roster attendance to Absent', 'info');
              }}
              className="px-3 py-1.5 bg-[#101624] hover:bg-slate-800 text-xs text-slate-300 rounded-lg border border-slate-700/80 transition-colors"
            >
              Reset Session
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#101624] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Enrollment ID</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Biometric Confidence</th>
                <th className="py-3 px-4">Time Detected</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sessionRecords.map(record => (
                <tr key={record.studentId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <NeutralAvatar src={record.studentPhoto} name={record.studentName} size="sm" rounded="rounded-full" className="shrink-0" />
                      <span className="font-semibold text-slate-100">{record.studentName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{record.studentEnrollment}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {record.className} · {record.sectionName}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {record.confidenceScore ? (
                      <span className="text-emerald-400 font-medium">
                        {(record.confidenceScore * 100).toFixed(1)}%
                      </span>
                    ) : waitingLive[record.studentId] ? (
                      <span className="text-amber-400 font-medium">Waiting for blink…</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{record.timeDetected}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium ${
                        record.status === 'Present'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : record.status === 'Late'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          : record.status === 'Pending Verification'
                          ? 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleStatusChange(record.studentId, 'Present')}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                          record.status === 'Present'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#101624] text-slate-400 hover:text-emerald-300'
                        }`}
                      >
                        P
                      </button>
                      <button
                        onClick={() => handleStatusChange(record.studentId, 'Late')}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                          record.status === 'Late'
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#101624] text-slate-400 hover:text-amber-300'
                        }`}
                      >
                        L
                      </button>
                      <button
                        onClick={() => handleStatusChange(record.studentId, 'Absent')}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                          record.status === 'Absent'
                            ? 'bg-rose-600 text-white'
                            : 'bg-[#101624] text-slate-400 hover:text-rose-300'
                        }`}
                      >
                        A
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
