import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { downloadCsvFile } from '../../services/api';
import { ShieldAlert, Search, Download, Terminal, Clock, User, Filter } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const { auditLogs, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(
    l =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCsv = () => {
    const headers = ['Audit ID', 'Timestamp', 'Action', 'Actor Name', 'Actor Role', 'Details', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.action,
      l.actorName,
      l.actorRole,
      l.details,
      l.ipAddress,
    ]);
    downloadCsvFile('Institute_Audit_Trail', headers, rows);
    showToast('Audit trail exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Security & Audit Activity Trail</h2>
          </div>
          <p className="text-xs text-slate-400">
            Immutable log of institutional actions, faculty assignments, biometric verifications, and system events.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search audit trail by actor, action or detail..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs bg-[#151C2B] text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#101624] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Operational Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-white">{log.action}</td>
                  <td className="py-3 px-4 text-slate-200">{log.actorName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono capitalize bg-slate-800 text-slate-300">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{log.details}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                    {log.ipAddress}
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
