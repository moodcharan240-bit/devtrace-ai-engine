import { Scale, FileCheck2, AlertCircle, ArrowRightCircle } from 'lucide-react';
import { LicenseIssue } from '../types';

interface LicenseMatrixViewProps {
  licenseIssues: LicenseIssue[];
}

export function LicenseMatrixView({ licenseIssues }: LicenseMatrixViewProps) {
  if (!licenseIssues || licenseIssues.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
        <div className="w-10 h-10 mx-auto rounded-full bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mb-3">
          <FileCheck2 className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">License Matrix Cleared</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          No viral copyleft licenses (GPL, AGPL) or unlicenses conflicting with commercial software distribution were detected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            License Compliance Matrix ({licenseIssues.length})
          </h3>
        </div>
        <span className="text-xs font-semibold text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2.5 py-0.5 rounded-full">
          Copyleft & Legal Evaluation
        </span>
      </div>

      <div className="grid gap-2.5">
        {licenseIssues.map((issue, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">
                  {issue.package_name}
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-purple-950 border border-purple-800/80 text-purple-300 rounded font-mono">
                  {issue.license_type}
                </span>
              </div>

              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                issue.status.toLowerCase() === 'conflict'
                  ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                  : 'bg-amber-950/80 border border-amber-800 text-amber-300'
              }`}>
                {issue.status}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2 text-xs">
              <ArrowRightCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-cyan-300">Actionable Remediation:</span>{' '}
                <span className="text-slate-300">{issue.recommendation}</span>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Commercial proprietary software distribution risk: Copyleft terms may require disclosing host codebase source.
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
