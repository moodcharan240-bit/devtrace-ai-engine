import { Bug, ExternalLink, PackageCheck, AlertOctagon } from 'lucide-react';
import { Vulnerability } from '../types';

interface VulnerabilitiesViewProps {
  vulnerabilities: Vulnerability[];
}

export function VulnerabilitiesView({ vulnerabilities }: VulnerabilitiesViewProps) {
  if (!vulnerabilities || vulnerabilities.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
        <div className="w-10 h-10 mx-auto rounded-full bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mb-3">
          <PackageCheck className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">No CVE Package Vulnerabilities</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          All identified dependencies conform to secure version baselines with no known high-risk CVE advisories.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    const s = (severity || '').toUpperCase();
    if (s.includes('CRITICAL')) {
      return 'bg-rose-950/90 border-rose-800 text-rose-300';
    }
    if (s.includes('HIGH')) {
      return 'bg-orange-950/90 border-orange-800 text-orange-300';
    }
    if (s.includes('MEDIUM')) {
      return 'bg-amber-950/90 border-amber-800 text-amber-300';
    }
    return 'bg-blue-950/90 border-blue-800 text-blue-300';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <Bug className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Package Vulnerabilities ({vulnerabilities.length})
          </h3>
        </div>
        <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
          CVE Advisories
        </span>
      </div>

      <div className="grid gap-2.5">
        {vulnerabilities.map((vuln, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">
                  {vuln.package_name}
                </span>
                <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded">
                  v{vuln.installed_version}
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded border ${getSeverityBadge(vuln.severity)}`}>
                  {vuln.severity}
                </span>
              </div>

              {vuln.cve_id && (
                <a
                  href={`https://nvd.nist.gov/vuln/detail/${vuln.cve_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded hover:bg-cyan-900/40 transition-colors"
                >
                  <span>{vuln.cve_id}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1">
              {vuln.summary}
            </p>

            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-400">
                <AlertOctagon className="w-3 h-3 text-amber-400" />
                Recommended: Upgrade to latest patched release
              </span>
              <span className="font-mono text-slate-500">npm / pip audit</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
