import { ShieldCheck, Terminal, Sparkles, Cpu } from 'lucide-react';

interface HeaderProps {
  onLoadPreset: (id: string) => void;
}

export function Header({ onLoadPreset }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-slate-950">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                DevTrace <span className="text-cyan-400 font-mono">AI Engine</span>
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded-md">
                HackDevengers 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI Code Security Auditor & License Compliance Matrix
            </p>
          </div>
        </div>

        {/* Engine status & Quick Loaders */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit Engine:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Active
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => onLoadPreset('node-vulnerable')}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              title="Load demo Node.js package.json with CVEs and leaked secrets"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Vulns</span>
            </button>

            <button
              onClick={() => onLoadPreset('raw-code-secrets')}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              title="Load demo source code with AWS and GitHub tokens"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo Secrets</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
