import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Layers,
  Grid3X3,
  Plus,
  CheckCircle2,
  Archive,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  BookOpen,
} from 'lucide-react';

export const AcademicStructurePage: React.FC<{ initialTab?: string }> = ({ initialTab = 'years' }) => {
  const {
    academicYears,
    addAcademicYear,
    setCurrentAcademicYear,
    courses,
    addCourse,
    classes,
    addClassItem,
    sections,
    addSection,
    toggleSectionStatus,
    departments,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'years' | 'courses' | 'classes' | 'sections'>(
    initialTab as any
  );

  // New Academic Year State
  const [newYearName, setNewYearName] = useState('');
  const [newYearStart, setNewYearStart] = useState('');
  const [newYearEnd, setNewYearEnd] = useState('');

  // New Course State
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('');
  const [newCourseYears, setNewCourseYears] = useState(4);
  const [newCourseSems, setNewCourseSems] = useState(8);

  // New Class State
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassCourse, setNewClassCourse] = useState('');
  const [newClassSem, setNewClassSem] = useState(1);

  // New Section State (Dynamic!)
  const [newSectionName, setNewSectionName] = useState('Section A');
  const [newSectionClass, setNewSectionClass] = useState('');
  const [newSectionCapacity, setNewSectionCapacity] = useState(60);

  const effectiveCourseDept = newCourseDept || departments[0]?.id || '';
  const effectiveClassCourse = newClassCourse || courses[0]?.id || '';
  const effectiveSectionClass = newSectionClass || classes[0]?.id || '';

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim()) return;
    addAcademicYear({
      name: newYearName,
      isCurrent: false,
      status: 'active',
      startDate: newYearStart,
      endDate: newYearEnd,
    });
    setNewYearName('');
    setNewYearStart('');
    setNewYearEnd('');
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName || !newCourseCode) return;
    addCourse({
      name: newCourseName,
      code: newCourseCode,
      departmentId: effectiveCourseDept,
      durationYears: newCourseYears,
      totalSemesters: newCourseSems,
    });
    setNewCourseName('');
    setNewCourseCode('');
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !newClassCode) return;
    if (!effectiveClassCourse) {
      showToast('Create a course program first', 'error');
      return;
    }
    addClassItem({
      name: newClassName,
      code: newClassCode,
      courseId: effectiveClassCourse,
      semesterNumber: newClassSem,
      academicYearId: academicYears.find(y => y.isCurrent)?.id || academicYears[0]?.id || '',
    });
    setNewClassName('');
    setNewClassCode('');
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    if (!effectiveSectionClass) {
      showToast('Create a class cohort first', 'error');
      return;
    }
    addSection({
      name: newSectionName,
      classId: effectiveSectionClass,
      maxCapacity: newSectionCapacity,
      studentCount: 0,
      status: 'active',
    });
    setNewSectionName(`Section ${String.fromCharCode(newSectionName.charCodeAt(newSectionName.length - 1) + 1)}`);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#151C2B] border border-slate-800 rounded-xl">
        <button
          onClick={() => setActiveTab('years')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'years'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Academic Years</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'courses'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Courses & Semesters</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'classes'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span>Classes Management</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'sections'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Dynamic Sections</span>
        </button>
      </div>

      {/* Tab 1: Academic Years */}
      {activeTab === 'years' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1">Academic Years Registry</h3>
            <p className="text-xs text-slate-400 mb-6">
              Designate the active instructional year. Attendance monitoring cycles and biometric rosters align with the active year.
            </p>

            <div className="space-y-3">
              {academicYears.map(year => (
                <div
                  key={year.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    year.isCurrent
                      ? 'bg-blue-950/30 border-blue-600/50'
                      : 'bg-[#101624] border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                        year.isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{year.name}</span>
                        {year.isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                            CURRENT ACTIVE
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 capitalize">
                          {year.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {year.startDate} to {year.endDate}
                      </div>
                    </div>
                  </div>

                  {!year.isCurrent && (
                    <button
                      onClick={() => setCurrentAcademicYear(year.id)}
                      className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      Set as Current
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Add Academic Year</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Register an upcoming or past institutional cycle.</p>

            <form onSubmit={handleAddYear} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Year Label (e.g. 2028–2029)</label>
                <input
                  type="text"
                  required
                  value={newYearName}
                  onChange={e => setNewYearName(e.target.value)}
                  placeholder="2028–2029"
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={newYearStart}
                  onChange={e => setNewYearStart(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={newYearEnd}
                  onChange={e => setNewYearEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-all mt-2"
              >
                Register Year
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Courses & Semesters */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1">Degree Programs & Courses</h3>
            <p className="text-xs text-slate-400 mb-6">
              Configure curriculum course duration, semester breakdowns, and parent engineering departments.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map(course => (
                <div key={course.id} className="p-4 bg-[#101624] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded font-mono">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {course.durationYears} Years ({course.totalSemesters} Semesters)
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{course.name}</h4>
                  <div className="text-[11px] text-slate-400">
                    Dept: {departments.find(d => d.id === course.departmentId)?.name || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Add New Course</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Create a new academic degree or diploma program.</p>

            <form onSubmit={handleAddCourse} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  value={newCourseCode}
                  onChange={e => setNewCourseCode(e.target.value)}
                  placeholder="BBA / MCA / M.Tech"
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Course Full Name</label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={e => setNewCourseName(e.target.value)}
                  placeholder="Master of Science in Cybersecurity"
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Parent Department</label>
                <select
                  value={effectiveCourseDept}
                  onChange={e => setNewCourseDept(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                >
                  <option value="">— None —</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    value={newCourseYears}
                    onChange={e => setNewCourseYears(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total Semesters</label>
                  <input
                    type="number"
                    value={newCourseSems}
                    onChange={e => setNewCourseSems(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-all mt-2"
              >
                Create Course Program
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Classes Management */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1">Class Cohorts</h3>
            <p className="text-xs text-slate-400 mb-6">
              Classes connect courses with specific semester years and dynamic student sections.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.map(cls => (
                <div key={cls.id} className="p-4 bg-[#101624] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded font-mono">
                      {cls.code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Semester {cls.semesterNumber}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{cls.name}</h4>
                  <div className="text-[11px] text-slate-400">
                    Sections active:{' '}
                    {sections
                      .filter(s => s.classId === cls.id)
                      .map(s => s.name)
                      .join(', ') || 'No sections'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Add New Class</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Create a class cohort for current academic cycle.</p>

            <form onSubmit={handleAddClass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Class Code</label>
                <input
                  type="text"
                  required
                  value={newClassCode}
                  onChange={e => setNewClassCode(e.target.value)}
                  placeholder="CSE-7 / IT-5 / BCA-1"
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="Computer Science 7th Semester"
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Course</label>
                <select
                  value={effectiveClassCourse}
                  onChange={e => setNewClassCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Semester Number</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={newClassSem}
                  onChange={e => setNewClassSem(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-all mt-2"
              >
                Create Class Cohort
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Dynamic Sections */}
      {activeTab === 'sections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Dynamic Section Manager</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Sections are completely flexible (Section A, B, C, D, E, F, G, or custom). Not hardcoded.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sections.map(section => {
                const parentClass = classes.find(c => c.id === section.classId);
                return (
                  <div
                    key={section.id}
                    className="p-4 bg-[#101624] border border-slate-800 rounded-xl flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{section.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            section.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {section.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Class: <span className="text-slate-200">{parentClass?.name || '—'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        Capacity: {section.studentCount} / {section.maxCapacity} students
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Toggle Active</span>
                      <button
                        onClick={() => toggleSectionStatus(section.id)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {section.status === 'active' ? (
                          <ToggleRight className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Create Dynamic Section</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add Section F, Section G, or any custom naming required by enrollment surge.
            </p>

            <form onSubmit={handleAddSection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Section Name</label>
                <input
                  type="text"
                  required
                  value={newSectionName}
                  onChange={e => setNewSectionName(e.target.value)}
                  placeholder="Section F (or Evening Batch A)"
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Parent Class Cohort</label>
                <select
                  value={effectiveSectionClass}
                  onChange={e => setNewSectionClass(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Maximum Student Capacity</label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={newSectionCapacity}
                  onChange={e => setNewSectionCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-md transition-all mt-2"
              >
                Create Dynamic Section
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
