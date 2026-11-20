import React from 'react';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';
import { useApp } from '../../context/AppContext';
import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AIInsightsPage: React.FC = () => {
  const { aiInsights, students, classes } = useApp();

  const atRiskStudents = students.filter(s => s.totalClasses > 0 && s.attendanceRate < 75);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">AI Biometric & Attendance Intelligence</h2>
          </div>
          <p className="text-xs text-slate-400">
            Heuristic pattern recognition & early retention warnings based on facial scan telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1.5 rounded-lg font-mono">
            {aiInsights.length} Insights
          </span>
        </div>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aiInsights.length === 0 && (
          <p className="text-xs text-slate-500">No insights available yet. Insights appear once real attendance records exist.</p>
        )}
        {aiInsights.map(insight => {
          let badgeBg = 'bg-blue-950 text-blue-400 border-blue-800';
          let Icon = TrendingUp;

          if (insight.severity === 'critical') {
            badgeBg = 'bg-rose-950 text-rose-400 border-rose-800';
            Icon = AlertTriangle;
          } else if (insight.severity === 'medium') {
            badgeBg = 'bg-amber-950 text-amber-400 border-amber-800';
            Icon = ShieldAlert;
          } else if (insight.category === 'suggestion') {
            Icon = Lightbulb;
          }

          return (
            <div
              key={insight.id}
              className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border ${badgeBg}`}>
                    {insight.severity} Severity · {insight.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{insight.date}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{insight.title}</span>
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Cohort: {insight.relatedEntity}</span>
                {insight.metricImpact && (
                  <span className="text-cyan-400 font-mono font-semibold">{insight.metricImpact}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Predictive Intervention Roster */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Retention Risk Watchlist (&lt;75% Attendance Warning)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Students identified by the system at risk of examination debarment if current pattern persists.
            </p>
          </div>
          <span className="text-xs font-mono text-rose-400 font-semibold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
            {atRiskStudents.length} Flagged
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {atRiskStudents.length === 0 && <p className="text-xs text-slate-500">No students flagged.</p>}
          {atRiskStudents.map(student => (
            <div
              key={student.id}
              className="p-3.5 bg-[#101624] border border-rose-900/40 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <NeutralAvatar src={student.avatar} name={student.name} size="sm" rounded="rounded-full" className="shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-100">{student.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {student.enrollmentNo} · {student.sectionName}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-rose-400 font-mono">{student.attendanceRate}%</div>
                <div className="text-[10px] text-slate-500">{student.absentDays} missed</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
