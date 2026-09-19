import { useState } from 'react';
import { Copy, Check, Download, FileJson, CheckCircle2 } from 'lucide-react';
import { SecurityAuditReport } from '../types';

interface JsonViewerProps {
  report: SecurityAuditReport;
}

export function JsonViewer({ report }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  // Format the JSON cleanly with 2 spaces
  const jsonString = JSON.stringify(report, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtrace-security-audit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Quick validation check against the schema
  const isSchemaValid =
    typeof report.security_score === 'number' &&
    typeof report.summary === 'string' &&
    Array.isArray(report.secrets_found) &&
    Array.isArray(report.vulnerabilities) &&
    Array.isArray(report.license_issues);

  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
      {/* Header bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <FileJson className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Strict JSON Output
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              DevTrace AI Schema v2.0
            </span>
          </div>

          {isSchemaValid && (
            <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 border border-emerald-800/80 text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Valid Schema Object
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            title="Copy strict JSON object"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            title="Download report as JSON file"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Code block */}
      <div className="p-4 overflow-x-auto max-h-[540px] text-xs font-mono leading-relaxed bg-slate-950 text-slate-200">
        <pre className="selection:bg-cyan-900 selection:text-white">
          {jsonString}
        </pre>
      </div>

      <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>application/json (UTF-8)</span>
        <span>{jsonString.split('\n').length} lines</span>
      </div>
    </div>
  );
}
