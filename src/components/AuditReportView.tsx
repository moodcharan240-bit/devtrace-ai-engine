import { useState } from 'react';
import { LayoutDashboard, FileJson, ShieldAlert, KeyRound, Bug, Scale, Sparkles, RefreshCw } from 'lucide-react';
import { SecurityAuditReport } from '../types';
import { ScoreGauge } from './ScoreGauge';
import { SecretsView } from './SecretsView';
import { VulnerabilitiesView } from './VulnerabilitiesView';
import { LicenseMatrixView } from './LicenseMatrixView';
import { RemediationView } from './RemediationView';
import { JsonViewer } from './JsonViewer';

interface AuditReportViewProps {
  report: SecurityAuditReport;
  fileName: string;
  onReAudit: () => void;
  isLoading: boolean;
}

export function AuditReportView({ report, fileName, onReAudit, isLoading }: AuditReportViewProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');

  const secretsCount = report.secrets_found?.length || 0;
  const vulnsCount = report.vulnerabilities?.length || 0;
  const licenseCount = report.license_issues?.length || 0;

  return (
    <div className="space-y-5">
      {/* Top action bar: File info + View Mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="text-xs font-semibold text-slate-300">Audited Target:</span>
          <span className="text-xs font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {fileName || 'package.json'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'visual'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Audit Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'json'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Strict Raw JSON</span>
            </button>
          </div>

          <button
            onClick={onReAudit}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
            title="Re-run audit"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {activeTab === 'json' ? (
        <JsonViewer report={report} />
      ) : (
        <div className="space-y-5">
          {/* Executive Overview: Score Gauge + 2-Sentence Summary Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <ScoreGauge score={report.security_score} />
            </div>

            <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Executive Audit Summary
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {report.summary || 'Security analysis complete.'}
                </p>
              </div>

              {/* Stat metric pills */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${
                  secretsCount > 0
                    ? 'bg-rose-950/70 border-rose-800/80 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{secretsCount} Exposed Secret{secretsCount !== 1 ? 's' : ''}</span>
                </span>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${
                  vulnsCount > 0
                    ? 'bg-amber-950/70 border-amber-800/80 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <Bug className="w-3.5 h-3.5" />
                  <span>{vulnsCount} CVE Vulnerabilit{vulnsCount !== 1 ? 'ies' : 'y'}</span>
                </span>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${
                  licenseCount > 0
                    ? 'bg-purple-950/70 border-purple-800/80 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <Scale className="w-3.5 h-3.5" />
                  <span>{licenseCount} License Issue{licenseCount !== 1 ? 's' : ''}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Audit Dimensions */}
          <div className="space-y-6">
            <SecretsView secrets={report.secrets_found} />
            <VulnerabilitiesView vulnerabilities={report.vulnerabilities} />
            <LicenseMatrixView licenseIssues={report.license_issues} />
            <RemediationView steps={report.remediation_steps} />
          </div>
        </div>
      )}
    </div>
  );
}
