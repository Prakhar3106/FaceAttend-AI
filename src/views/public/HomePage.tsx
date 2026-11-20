import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { attendanceRate, todayISO } from '../../lib/attendanceStats';
import { useNavigate } from '@/lib/router-compat';
import { ASSETS } from '../../assets';
import {
  ScanFace,
  ShieldCheck,
  GraduationCap,
  Users,
  Camera,
  Calendar,
  Layers,
  Grid3X3,
  BookOpen,
  FileBarChart2,
  BrainCircuit,
  PieChart,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Clock,
  Sparkles,
  Lock,
  Download,
  AlertCircle,
  HelpCircle,
  Building2,
  ChevronRight,
  Menu,
  X,
  Activity,
  Award,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { students, teachers, departments, attendanceRecords, academicYears, settings } = useApp();
  const currentAY = academicYears.find(y => y.isCurrent);
  const todayRate = attendanceRate(attendanceRecords.filter(r => r.date === todayISO()));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activePreviewTab, setActivePreviewTab] = useState<'admin' | 'teacher' | 'student'>('admin');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 14 Key Features
  const featuresList = [
    {
      title: 'AI Face Recognition',
      desc: 'Contactless biometric face verification mapping registered student facial landmarks in milliseconds.',
      icon: ScanFace,
      color: 'text-cyan-400',
    },
    {
      title: 'Automated Attendance',
      desc: 'Replaces pen-and-paper rolls with automated digital session logs tagged with exact verification timestamps.',
      icon: Activity,
      color: 'text-blue-400',
    },
    {
      title: 'Real-Time Monitoring',
      desc: 'Live attendance telemetry displaying present, late, absent, and pending verification counts in real time.',
      icon: Clock,
      color: 'text-emerald-400',
    },
    {
      title: 'Student Management',
      desc: 'Complete student directory with enrollment IDs, class cohorts, dynamic section assignments, and profiles.',
      icon: GraduationCap,
      color: 'text-amber-400',
    },
    {
      title: 'Teacher Management',
      desc: 'Admin-exclusive faculty provisioning, employee credential allocation, and course-to-teacher mappings.',
      icon: Users,
      color: 'text-indigo-400',
    },
    {
      title: 'Academic Year Management',
      desc: 'Seamlessly switch active instructional years, archive previous terms, and maintain continuous cohorts.',
      icon: Calendar,
      color: 'text-purple-400',
    },
    {
      title: 'Dynamic Class & Section Management',
      desc: 'Create Section A, B, C, D, E, or add custom sections like Section F or G with adaptive student capacities.',
      icon: Layers,
      color: 'text-sky-400',
    },
    {
      title: 'Subject Curriculum Mapping',
      desc: 'Associate course modules, credit ratings, and laboratory lectures directly to designated faculty members.',
      icon: BookOpen,
      color: 'text-rose-400',
    },
    {
      title: 'Attendance History',
      desc: 'Comprehensive historical audit logs filterable by date range, department, class cohort, and status.',
      icon: Clock,
      color: 'text-teal-400',
    },
    {
      title: 'Excel / CSV Reports',
      desc: 'Download one-click CSV spreadsheets for faculty rosters, section rolls, and semester compliance audits.',
      icon: Download,
      color: 'text-emerald-400',
    },
    {
      title: 'Smart Analytics',
      desc: 'Department-wise comparisons, punctuality curves, and lecture attendance flow tracking.',
      icon: PieChart,
      color: 'text-blue-400',
    },
    {
      title: 'AI Insights',
      desc: 'Early warning alerts for students slipping below the mandatory 75% examination eligibility threshold.',
      icon: BrainCircuit,
      color: 'text-amber-400',
    },
    {
      title: 'Attendance Calendar',
      desc: 'Interactive monthly student calendar with color-coded daily verification tiles (Green, Yellow, Red).',
      icon: Calendar,
      color: 'text-cyan-400',
    },
    {
      title: 'Secure Role-Based Portals',
      desc: 'Strict isolation among Admin/HOD, Faculty, and Student portals ensuring privacy and tamper-proof records.',
      icon: ShieldCheck,
      color: 'text-blue-400',
    },
  ];

  // FAQ Items
  const faqItems = [
    {
      q: 'What is FaceAttend AI?',
      a: 'FaceAttend AI is an attendance management platform for schools, colleges, universities and training institutes that leverages AI facial recognition technology to automate student attendance, eliminate proxy marking, and provide live analytics across departments.',
    },
    {
      q: 'Who can use the platform?',
      a: 'The platform is architected for three distinct roles within the institution: one central Admin/HOD with full institutional control, Teachers who manage their assigned classes and sections, and Students who monitor their personal attendance compliance.',
    },
    {
      q: 'How does face recognition attendance work?',
      a: 'During a lecture session, the teacher starts the live camera terminal. The browser video feed captures faces within the frame, compares them against enrolled student reference vectors, and automatically marks them Present or Late with high confidence scores.',
    },
    {
      q: 'Who creates teacher accounts?',
      a: 'Only the Institute Admin (HOD) has the authority to provision faculty accounts, assign employee IDs, and allocate teachers to specific courses, semesters, subjects, and dynamic sections.',
    },
    {
      q: 'Can students mark their own attendance?',
      a: 'No. Students cannot mark, edit, or override attendance. Their portal is strictly read-only for transparency, allowing them to view daily calendar statuses, subject percentages, and download personal reports.',
    },
    {
      q: 'Can teachers see other teachers\' students?',
      a: 'No. Teachers have scoped permissions restricted strictly to their assigned course modules, classes, and sections. Cross-faculty rosters and unrelated student records remain inaccessible to maintain departmental isolation.',
    },
    {
      q: 'Can attendance reports be downloaded?',
      a: 'Yes! Authorized users can download standard CSV and Excel-compatible attendance transcripts, section rosters, and departmental analytics at any time with custom date and cohort filters.',
    },
    {
      q: 'Does the platform support multiple academic years?',
      a: 'Yes. The system features a complete Academic Year management interface where Admins can configure the current active year (e.g. 2026–2027), archive previous terms, and plan upcoming enrollment cycles.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F1F5F9] font-sans selection:bg-blue-600 selection:text-white">
      {/* 3. HOMEPAGE NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ScanFace className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>FaceAttend</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-mono font-semibold">
                  AI
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium -mt-0.5">
                Face Recognition Attendance Platform
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('technology')} className="hover:text-white transition-colors">
              AI Technology
            </button>
            <button onClick={() => scrollToSection('portals')} className="hover:text-white transition-colors">
              Portals
            </button>
            <button onClick={() => scrollToSection('benefits')} className="hover:text-white transition-colors">
              Benefits
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">
              FAQ
            </button>
          </nav>

          {/* Action: Separate Login Page Link */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-[#151C2B] hover:bg-[#1E273A] border border-slate-700/80 text-slate-200 text-xs font-semibold rounded-xl transition-all"
            >
              Register Institute
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center gap-2"
            >
              <span>Login to Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg"
            >
              Login
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#101624] border-b border-slate-800 px-4 py-4 space-y-3 text-sm">
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left py-1 text-slate-300 hover:text-white"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left py-1 text-slate-300 hover:text-white"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-1 text-slate-300 hover:text-white"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-1 text-slate-300 hover:text-white"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('technology')}
              className="block w-full text-left py-1 text-slate-300 hover:text-white"
            >
              AI Technology
            </button>
            <button
              onClick={() => scrollToSection('portals')}
              className="block w-full text-left py-1 text-slate-300 hover:text-white"
            >
              Portals
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="block w-full text-left py-1 text-slate-300 hover:text-white"
            >
              Benefits
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left py-1 text-slate-300 hover:text-white"
            >
              FAQ
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full mt-2 py-2.5 bg-blue-600 text-white font-semibold rounded-lg text-center"
            >
              Login to Portal
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full mt-2 py-2.5 bg-[#151C2B] border border-slate-700 text-slate-200 font-semibold rounded-lg text-center"
            >
              Register Institute
            </button>
          </div>
        )}
      </header>

      {/* 4. HOMEPAGE HERO SECTION */}
      <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Hero background */}
        <div
          className="absolute inset-0 bg-cover bg-center sm:bg-[center_top_20%] bg-no-repeat transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url(${ASSETS.heroBackground})`,
          }}
        >
          {/* Overlay keeps text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/80 via-[#0B0F19]/60 to-[#0B0F19]" />
          <div className="absolute inset-0 bg-[#0B0F19]/40 backdrop-blur-[0.5px]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-semibold mb-6 shadow-lg backdrop-blur-md">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Attendance software for schools, colleges & universities</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
            Smart Attendance.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-400">
              Smarter Institutions.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-200/90 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            Transforming traditional attendance into an intelligent, secure and efficient experience through
            AI-powered face recognition technology.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <button
              onClick={() => scrollToSection('features')}
              className="px-6 py-3 bg-[#151C2B]/90 hover:bg-[#1E273A] border border-slate-700/80 hover:border-blue-500/60 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl shadow-xl transition-all"
            >
              Explore Features
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/40 hover:shadow-blue-500/60 transition-all flex items-center gap-2"
            >
              <span>Login to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-[#151C2B]/90 hover:bg-[#1E273A] border border-slate-700/80 hover:border-cyan-500/60 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl shadow-xl transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Register Your Institute</span>
            </button>
          </div>

          {/* Feature Highlights Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="p-3 bg-[#151C2B]/85 border border-slate-800/80 rounded-xl backdrop-blur-md flex items-center justify-center gap-2 text-xs font-semibold text-slate-200">
              <ScanFace className="w-4 h-4 text-cyan-400" />
              <span>AI Face Recognition</span>
            </div>
            <div className="p-3 bg-[#151C2B]/85 border border-slate-800/80 rounded-xl backdrop-blur-md flex items-center justify-center gap-2 text-xs font-semibold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Smart Attendance</span>
            </div>
            <div className="p-3 bg-[#151C2B]/85 border border-slate-800/80 rounded-xl backdrop-blur-md flex items-center justify-center gap-2 text-xs font-semibold text-slate-200">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Real-Time Monitoring</span>
            </div>
            <div className="p-3 bg-[#151C2B]/85 border border-slate-800/80 rounded-xl backdrop-blur-md flex items-center justify-center gap-2 text-xs font-semibold text-slate-200">
              <BrainCircuit className="w-4 h-4 text-amber-400" />
              <span>Intelligent Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1 – ABOUT FACEATTEND AI */}
      <section id="about" className="py-20 bg-[#0E1422] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase font-mono">
              Institutional Context
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Next-Generation Attendance Automation
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Built for classrooms, lecture halls, labs and training rooms of any size.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* The Challenge & Limitations */}
            <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h3 className="text-lg font-bold text-white">Limitations of Traditional Methods</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Manual Paper Registers:</strong> Consumes 10–15 minutes of every lecture hour calling
                    roll numbers, interrupting teaching flow.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Proxy & Buddy Marking:</strong> Easy falsification of signatures and fraudulent
                    attendance marking in large classes.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Slow Administrative Consolidation:</strong> Generating monthly eligibility reports
                    requires days of manual calculation across sheets.
                  </span>
                </li>
              </ul>
            </div>

            {/* The AI Face Solution */}
            <div className="bg-[#151C2B] border border-blue-900/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 text-cyan-400">
                <ScanFace className="w-6 h-6 shrink-0" />
                <h3 className="text-lg font-bold text-white">How FaceAttend AI Solves It</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Instant Contactless Recognition:</strong> Scans students entering the hall or classroom
                    camera field in seconds with high confidence.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Real-Time Database Sync:</strong> Immediately records presence, late timestamps, and
                    notifies student portals.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>One-Click CSV Export:</strong> Instant generation of official attendance
                    transcripts and exam eligibility rosters.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 – KEY FEATURES (14 CARDS) */}
      <section id="features" className="py-20 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase font-mono">
              Comprehensive Platform Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Everything Needed for Modern Attendance
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Engineered to support one main institutional Admin, multiple subject faculty, and thousands of students.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuresList.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div
                  key={index}
                  className="bg-[#151C2B] border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 shadow-lg hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#101624] border border-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon className={`w-5 h-5 ${feat.color}`} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3 – HOW FACEATTEND AI WORKS (4-STEP TIMELINE) */}
      <section id="how-it-works" className="py-20 bg-[#0E1422] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase font-mono">
              Workflow Lifecycle
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              How FaceAttend AI Works
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              From authorized account provisioning to real-time verification and automated reporting.
            </p>
          </div>

          {/* 4-Step Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
                  01
                </div>
                <h3 className="text-base font-bold text-white mb-2">Account Provisioning</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Admin securely provisions verified faculty and student accounts with official IDs.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-blue-400 font-mono">
                Admin Exclusive
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-full bg-cyan-600 text-white font-mono font-bold text-sm flex items-center justify-center mb-4 shadow-lg shadow-cyan-600/30">
                  02
                </div>
                <h3 className="text-base font-bold text-white mb-2">Cohort & Subject Mapping</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Admin assigns teachers to specific academic years, courses, classes, sections, and modules.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-400 font-mono">
                Dynamic Sections
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-mono font-bold text-sm flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/30">
                  03
                </div>
                <h3 className="text-base font-bold text-white mb-2">Camera Scanning Session</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Teacher launches the live camera terminal in lecture hall. Students are identified via face recognition.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-mono">
                Live Terminal
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-mono font-bold text-sm flex items-center justify-center mb-4 shadow-lg shadow-purple-600/30">
                  04
                </div>
                <h3 className="text-base font-bold text-white mb-2">Instant Dashboard Sync</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Attendance logs sync immediately across teacher rosters, student calendars, and admin reports.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-purple-400 font-mono">
                Export & Analytics
              </div>
            </div>
          </div>

          <div className="mt-8 p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-center text-xs text-blue-200">
            <span className="font-semibold">Note:</span> Face signatures are computed from each student&apos;s
            enrolled photograph and stored privately in your institute&apos;s secure database.
          </div>
        </div>
      </section>

      {/* SECTION 4 – THREE SEPARATE USER PORTALS */}
      <section id="portals" className="py-20 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase font-mono">
              Dedicated Experiences
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Three Distinct Role Portals
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Strict role separation with isolated dashboards tailored to administrative, teaching, and student workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Portal Card */}
            <div className="bg-[#151C2B] border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">Admin / HOD</h3>
                  <span className="text-[10px] text-blue-400 font-mono bg-blue-950 px-2 py-0.5 rounded">
                    FULL AUTHORITY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Single executive authority governing departments, courses, teachers, and attendance parameters.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Manages the entire institute</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Adds teachers and student rosters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Creates classes, dynamic sections & subjects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Monitors institute-wide attendance</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/login/admin')}
                className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Teacher Portal Card */}
            <div className="bg-[#151C2B] border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">Teacher Portal</h3>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded">
                    FACULTY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Designed for professors to start live camera scanning sessions for their assigned class cohorts.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Views assigned classes & sections</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Manages permitted student records</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Starts camera face scanning sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Exports assigned section reports</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/login/teacher')}
                className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Teacher Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Student Portal Card */}
            <div className="bg-[#151C2B] border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">Student Portal</h3>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-950 px-2 py-0.5 rounded">
                    ENROLLED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Transparent student view for tracking attendance percentage, lecture history, and calendar days.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Views personal verified attendance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Color-coded monthly calendar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Subject-wise percentage breakdown</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Downloads personal attendance report</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/login/student')}
                className="mt-6 w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 – AI FACE RECOGNITION TECHNOLOGY */}
      <section id="technology" className="py-20 bg-[#0E1422] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase font-mono">
              Biometric Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              AI Face Recognition Technology
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              How high-accuracy facial landmarks translate into verifiable educational attendance records.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Scanner Mockup Frame */}
            <div className="lg:col-span-6 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Lecture Hall Video Stream · 1080p</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-mono">
                  ACTIVE SCAN
                </span>
              </div>

              {/* Scanning Box with animated corner brackets & laser line */}
              <div className="relative w-full max-w-[360px] aspect-square rounded-2xl overflow-hidden bg-[#0A0E17] border border-slate-800 flex items-center justify-center shadow-inner">
                {/* Four Corner Indicators */}
                <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg shadow-[0_0_12px_rgba(34,211,238,0.5)] animate-corner-pulse pointer-events-none" />
                <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg shadow-[0_0_12px_rgba(34,211,238,0.5)] animate-corner-pulse pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg shadow-[0_0_12px_rgba(34,211,238,0.5)] animate-corner-pulse pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-cyan-400 rounded-br-lg shadow-[0_0_12px_rgba(34,211,238,0.5)] animate-corner-pulse pointer-events-none" />

                {/* Laser scan line */}
                <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-scan-laser pointer-events-none z-10" />

                {/* Simulated Target */}
                <div className="w-40 h-48 border border-emerald-400/80 bg-emerald-500/10 rounded-xl flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                  <div className="flex items-center justify-between text-[10px] text-emerald-300 font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded">
                    <span>AWAITING</span>
                    <span>--</span>
                  </div>
                  <div className="text-[10px] font-semibold text-white bg-black/80 px-2 py-1 rounded text-center truncate shadow">
                    No face detected
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-center text-[10px] text-cyan-300 bg-black/70 py-1 px-2 rounded">
                  AI recognition will be activated after backend integration.
                </div>
              </div>
            </div>

            {/* Workflow Points */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-4 bg-[#151C2B] border border-slate-800 rounded-xl space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>1. Reference Vector Enrollment</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pl-4">
                  Students provide one-time biometric consent; reference landmark coordinates are registered securely.
                </p>
              </div>

              <div className="p-4 bg-[#151C2B] border border-slate-800 rounded-xl space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>2. Multi-Face Detection in Live Frames</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pl-4">
                  The classroom camera detects multiple students simultaneously as they walk into the lecture room.
                </p>
              </div>

              <div className="p-4 bg-[#151C2B] border border-slate-800 rounded-xl space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>3. High-Confidence Identity Matching</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pl-4">
                  Face-signature distance is compared with each enrolled student; only close matches are marked present.
                </p>
              </div>

              <div className="p-4 bg-[#151C2B] border border-slate-800 rounded-xl space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>4. Automated Status Tagging</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pl-4">
                  Logs status as Present, Late (grace window), or Absent, recording exact time and module ID.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 – SMART DASHBOARD PREVIEW */}
      <section className="py-20 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase font-mono">
              Interface Showcase
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Engineered for Intuitive Daily Use
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Explore the clean, responsive consoles designed for administrators, faculty, and students.
            </p>
          </div>

          {/* Interactive Preview Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-[#151C2B] border border-slate-800 rounded-xl gap-1 text-xs font-medium">
              <button
                onClick={() => setActivePreviewTab('admin')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activePreviewTab === 'admin'
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin Overview
              </button>
              <button
                onClick={() => setActivePreviewTab('teacher')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activePreviewTab === 'teacher'
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Teacher Terminal
              </button>
              <button
                onClick={() => setActivePreviewTab('student')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activePreviewTab === 'student'
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Student Calendar
              </button>
            </div>
          </div>

          {/* Preview Window Card */}
          <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto">
            {activePreviewTab === 'admin' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="font-bold text-white text-sm">
                    Admin Executive Dashboard{settings.instituteName ? ` · ${settings.instituteName}` : ''}
                  </div>
                  <span className="text-xs font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded">
                    {currentAY ? `AY ${currentAY.name}` : 'AY —'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#101624] rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Total Students</div>
                    <div className="text-xl font-bold text-white">{students.length} Enrolled</div>
                  </div>
                  <div className="p-3 bg-[#101624] rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Faculty Members</div>
                    <div className="text-xl font-bold text-emerald-400">{teachers.filter(t => t.status === 'active').length} Active</div>
                  </div>
                  <div className="p-3 bg-[#101624] rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Departments</div>
                    <div className="text-xl font-bold text-purple-400">{departments.length}</div>
                  </div>
                  <div className="p-3 bg-[#101624] rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Today's Attendance</div>
                    <div className="text-xl font-bold text-cyan-400">{todayRate}%</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'teacher' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="font-bold text-white text-sm">
                    Faculty Class Session
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                    Camera Live
                  </span>
                </div>
                <div className="p-4 bg-[#101624] rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-white font-semibold">Active Roster: {students.length} Students</div>
                    <div className="text-slate-400 text-[11px]">{attendanceRecords.filter(r => r.date === todayISO() && r.status === 'Present').length} Present · {attendanceRecords.filter(r => r.date === todayISO() && r.status === 'Absent').length} Absent · {attendanceRecords.filter(r => r.date === todayISO() && r.status === 'Late').length} Late</div>
                  </div>
                  <button
                    onClick={() => navigate('/login/teacher')}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Open Live Terminal
                  </button>
                </div>
              </div>
            )}

            {activePreviewTab === 'student' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="font-bold text-white text-sm">
                    Student Attendance Calendar
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">
                    {attendanceRate(attendanceRecords)}% Attendance
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300">
                    <div className="font-bold text-lg">{attendanceRecords.filter(r => r.status === 'Present').length}</div>
                    <div className="text-[10px]">Present Days</div>
                  </div>
                  <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300">
                    <div className="font-bold text-lg">{attendanceRecords.filter(r => r.status === 'Late').length}</div>
                    <div className="text-[10px]">Late Days</div>
                  </div>
                  <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300">
                    <div className="font-bold text-lg">{attendanceRecords.filter(r => r.status === 'Absent').length}</div>
                    <div className="text-[10px]">Absent Days</div>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                    <div className="font-bold text-lg">0</div>
                    <div className="text-[10px]">Holidays</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 7 – BENEFITS */}
      <section id="benefits" className="py-20 bg-[#0E1422] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase font-mono">
              Value Proposition
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Institutional Benefits
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Measurable improvements across teaching efficiency, compliance, and academic administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-[#151C2B] border border-slate-800 rounded-2xl space-y-2">
              <div className="text-emerald-400 font-bold text-sm">01. Zero Manual Roll Call</div>
              <h3 className="text-base font-semibold text-white">Reclaim Teaching Time</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Professors spend lecture periods teaching instead of reading off hundreds of roll numbers.
              </p>
            </div>

            <div className="p-6 bg-[#151C2B] border border-slate-800 rounded-2xl space-y-2">
              <div className="text-blue-400 font-bold text-sm">02. Proxy-Resistant Attendance</div>
              <h3 className="text-base font-semibold text-white">Tamper-Proof Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Facial recognition ensures that only physically present students are logged in the official records.
              </p>
            </div>

            <div className="p-6 bg-[#151C2B] border border-slate-800 rounded-2xl space-y-2">
              <div className="text-purple-400 font-bold text-sm">03. Automated 75% Rule Alerts</div>
              <h3 className="text-base font-semibold text-white">Retention Risk Warnings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated detection flags students whose attendance falls below the mandatory examination threshold.
              </p>
            </div>

            <div className="p-6 bg-[#151C2B] border border-slate-800 rounded-2xl space-y-2">
              <div className="text-cyan-400 font-bold text-sm">04. Flexible Dynamic Sections</div>
              <h3 className="text-base font-semibold text-white">Scalable Campus Batches</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Support for Section A through E, plus ability to add Section F, G, or evening batches dynamically.
              </p>
            </div>

            <div className="p-6 bg-[#151C2B] border border-slate-800 rounded-2xl space-y-2">
              <div className="text-amber-400 font-bold text-sm">05. Instant CSV Export</div>
              <h3 className="text-base font-semibold text-white">Frictionless Reporting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download audit spreadsheets for accreditation, audits and examinations with one click.
              </p>
            </div>

            <div className="p-6 bg-[#151C2B] border border-slate-800 rounded-2xl space-y-2">
              <div className="text-rose-400 font-bold text-sm">06. Student Self-Monitoring</div>
              <h3 className="text-base font-semibold text-white">Transparent Student Portals</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Students check their subject percentages and attendance calendar daily to remain exam-eligible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 – FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 bg-[#0B0F19]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase font-mono">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Clear answers regarding FaceAttend AI architecture, permissions, and institutional operations.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#151C2B] border border-slate-800 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-white hover:text-blue-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 9 – FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-b from-[#0E1422] to-[#0B0F19] border-t border-slate-800/80 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Ready for your institute</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Experience the Future of Smart Attendance.
          </h2>

          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Eliminate proxy attendance and save teaching time with AI face recognition.
          </p>

          <div className="pt-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all inline-flex items-center gap-2.5"
            >
              <span>Access FaceAttend AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="ml-3 px-8 py-3.5 bg-[#151C2B] hover:bg-[#1E273A] border border-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all inline-flex items-center gap-2.5"
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Register Your Institute</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 10 – FOOTER */}
      <footer id="contact" className="py-12 bg-[#080C14] border-t border-slate-800/80 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ScanFace className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm">FaceAttend AI</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Intelligent AI Face Recognition Attendance Management software for schools, colleges, universities and training institutes.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-200">Navigation</div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => scrollToSection('hero')} className="hover:text-white">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="hover:text-white">
                  About
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-white">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('portals')} className="hover:text-white">
                  Portals
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-200">Dedicated Portals</div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => navigate('/login/admin')} className="hover:text-blue-400">
                  Admin / HOD Login
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login/teacher')} className="hover:text-emerald-400">
                  Teacher Login
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login/student')} className="hover:text-amber-400">
                  Student Login
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-200">Get Started</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Any school, college, university or training institute can register and start using FaceAttend AI.
            </p>
            <button onClick={() => navigate('/register')} className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold">
              Register your institute →
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>© {new Date().getFullYear()} FaceAttend AI. All rights reserved.</div>
          <div className="text-slate-500">
            Secure cloud database · Each institute&apos;s data stays private
          </div>
        </div>
      </footer>
    </div>
  );
};
