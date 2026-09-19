import { Wrench, CheckCircle2, ArrowRight } from 'lucide-react';

interface RemediationViewProps {
  steps?: string[];
}

export function RemediationView({ steps }: RemediationViewProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>AI Remediation Plan</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                {steps.length} Action{steps.length !== 1 ? 's' : ''}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Prescriptive step-by-step actions to resolve identified security & compliance risks
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-950/90 border border-cyan-700/80 text-cyan-300 text-xs font-mono font-bold shrink-0 mt-0.5">
              {idx + 1}
            </div>
            <div className="flex-1 text-xs text-slate-200 leading-relaxed font-mono">
              {step}
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500/50 shrink-0 mt-0.5" />
          </div>
        ))}
      </div>
    </div>
  );
}
