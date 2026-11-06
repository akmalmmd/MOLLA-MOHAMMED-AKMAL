import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { SQLLogEntry } from '../types.js';
import {
  Download,
  Copy,
  Check,
  Terminal,
  Database,
  FolderTree,
  FileCode,
  BookOpen,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Server,
  Layers,
  Sparkles
} from 'lucide-react';

export const RepositoryHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'zip' | 'sql' | 'workbench' | 'logs' | 'api'>('zip');
  const [copied, setCopied] = useState(false);
  const [sqlDump, setSqlDump] = useState<string>('');
  const [queryLogs, setQueryLogs] = useState<SQLLogEntry[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [repoFiles, setRepoFiles] = useState<any[]>([]);

  // Fetch SQL dump and query logs
  useEffect(() => {
    fetch('/api/db/sql-dump')
      .then((r) => r.text())
      .then(setSqlDump)
      .catch((e) => console.error('Failed to load SQL:', e));

    fetchLogs();
    fetch('/api/repository/files')
      .then((r) => r.json())
      .then((data) => {
        if (data.files) setRepoFiles(data.files);
      })
      .catch((e) => console.error('Failed to fetch files list:', e));
  }, []);

  const fetchLogs = () => {
    fetch('/api/db/query-logs')
      .then((r) => r.json())
      .then((data) => {
        if (data.logs) setQueryLogs(data.logs);
      })
      .catch((e) => console.error('Failed to fetch query logs:', e));
  };

  const copySQL = () => {
    navigator.clipboard.writeText(sqlDump);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSQLFile = () => {
    const blob = new Blob([sqlDump], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hotel_booking_db.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate ZIP bundle containing the standalone repository structure
  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();

      // Add each file in repoFiles
      repoFiles.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Generate zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hotel-booking-management-system.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation failed:', err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-2">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>Developer & Submission Repository Center</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Repository & MySQL Workbench Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete project repository, downloadable ZIP package, SQL schema scripts, and live SQL logger.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Bundling ZIP Archive...' : 'Download Complete Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('zip')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'zip'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Repository Structure
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'sql'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          hotel_booking_db.sql
        </button>
        <button
          onClick={() => setActiveTab('workbench')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'workbench'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          MySQL Workbench Guide
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Live SQL Query Log ({queryLogs.length})
        </button>
      </div>

      {/* Tab 1: ZIP & Repository Overview */}
      {activeTab === 'zip' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Single-Click Submission Export
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold">
                Download Standalone Project ZIP
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Contains the complete structured repository ready for offline evaluation:
                pure HTML5/CSS3/JS frontend, Node.js + Express backend with <code className="text-amber-400 font-mono">mysql2</code> integration,
                SQL schema dump, and step-by-step setup documentation.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Generating...' : 'Download hotel-booking-management-system.zip'}</span>
                </button>
                <button
                  onClick={downloadSQLFile}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Download .SQL Dump</span>
                </button>
              </div>
            </div>
          </div>

          {/* Directory Tree Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-serif font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-amber-600" />
              Preserved Clean Repository Hierarchy
            </h3>
            <div className="bg-slate-950 rounded-xl p-5 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
              <span className="text-amber-400 font-bold">hotel-booking-management-system/</span><br />
              │<br />
              ├── <span className="text-emerald-400 font-bold">frontend/</span><br />
              │   ├── index.html           <span className="text-slate-500"># Homepage, Hero Search, Featured Rooms</span><br />
              │   ├── login.html           <span className="text-slate-500"># Customer & Admin authentication view</span><br />
              │   ├── register.html        <span className="text-slate-500"># Customer account registration</span><br />
              │   ├── rooms.html           <span className="text-slate-500"># Available rooms filter & booking console</span><br />
              │   ├── my-bookings.html     <span className="text-slate-500"># Personal booking history & cancellation</span><br />
              │   ├── admin.html           <span className="text-slate-500"># Inventory & customer reservations dashboard</span><br />
              │   ├── style.css            <span className="text-slate-500"># Responsive luxury styling</span><br />
              │   └── script.js            <span className="text-slate-500"># Client-side API fetch layer</span><br />
              │<br />
              ├── <span className="text-blue-400 font-bold">backend/</span><br />
              │   ├── server.js            <span className="text-slate-500"># Express.js REST application entry point</span><br />
              │   ├── db.js                <span className="text-slate-500"># mysql2 promise connection pool</span><br />
              │   ├── .env.example         <span className="text-slate-500"># Database credentials template</span><br />
              │   ├── middleware/<br />
              │   │   └── auth.js          <span className="text-slate-500"># JWT verification & role authorization</span><br />
              │   ├── routes/<br />
              │   │   ├── customerRoutes.js<span className="text-slate-500"># Register, Login, Profile endpoints</span><br />
              │   │   ├── roomRoutes.js    <span className="text-slate-500"># Room CRUD & Availability search</span><br />
              │   │   ├── bookingRoutes.js <span className="text-slate-500"># Overlap checks, create, status, cancel</span><br />
              │   │   └── dashboardRoutes.js<span className="text-slate-500"># KPI statistics calculation</span><br />
              │   └── package.json         <span className="text-slate-500"># Dependencies (express, mysql2, bcrypt, jwt)</span><br />
              │<br />
              ├── <span className="text-purple-400 font-bold">database/</span><br />
              │   └── hotel_booking_db.sql <span className="text-slate-500"># DDL schema for customers, rooms, bookings</span><br />
              │<br />
              └── README.md                <span className="text-slate-500"># Comprehensive setup & MySQL Workbench guide</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SQL File Viewer */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-bold text-slate-200">
                database/hotel_booking_db.sql
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copySQL}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied SQL!' : 'Copy Script'}
              </button>
              <button
                onClick={downloadSQLFile}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download SQL
              </button>
            </div>
          </div>

          <pre className="p-5 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed">
            {sqlDump || 'Loading SQL script...'}
          </pre>
        </div>
      )}

      {/* Tab 3: MySQL Workbench Step-by-Step Guide */}
      {activeTab === 'workbench' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-xl">
              MySQL Workbench Configuration & Execution Guide
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Follow these sequential instructions to initialize the hotel booking database on your local machine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="font-bold text-slate-900 text-sm">Open MySQL Workbench & Connect</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open MySQL Workbench on your workstation. In the "MySQL Connections" home screen, click your local server instance (Default: <code>localhost:3306</code>, user: <code>root</code>). Enter your MySQL password when prompted.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="font-bold text-slate-900 text-sm">Open & Execute SQL Script</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click <strong>File → Open SQL Script...</strong> and select <code>database/hotel_booking_db.sql</code> (or copy from the tab above). Click the yellow <strong>Lightning Bolt icon</strong> (Execute) on the query bar.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h4 className="font-bold text-slate-900 text-sm">Refresh Schemas & Verify Tables</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                In the left-hand <strong>Navigator</strong> pane, click the <strong>Schemas</strong> tab. Right-click anywhere in the pane and click <strong>Refresh All</strong>. Expand <code>hotel_booking_db</code> → <code>Tables</code> to confirm all 3 tables: <code>customers</code>, <code>rooms</code>, and <code>bookings</code>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">4</span>
              <h4 className="font-bold text-slate-900 text-sm">Verify Records with SELECT Queries</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open a new query tab and execute:
                <code className="block bg-slate-900 text-amber-300 p-2 rounded mt-1 font-mono text-[11px]">
                  SELECT * FROM customers;<br />
                  SELECT * FROM rooms;<br />
                  SELECT * FROM bookings;
                </code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Live SQL Query Monitor */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-slate-200">
                Live Parameterized SQL Execution Stream
              </span>
            </div>
            <button
              onClick={fetchLogs}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Refresh Logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 bg-slate-950 font-mono text-xs max-h-[500px] overflow-y-auto space-y-3">
            {queryLogs.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">No queries logged yet.</p>
            ) : (
              queryLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1 hover:border-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="text-amber-400 font-bold">Query Log #{log.id}</span>
                    <span>{log.timestamp} • {log.executionTimeMs}ms • {log.affectedRows || 0} rows</span>
                  </div>
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {log.query}
                  </pre>
                  {log.params && log.params.length > 0 && (
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span className="text-slate-500">Parameters: </span>
                      {JSON.stringify(log.params)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
