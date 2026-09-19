import { Terminal, FileCode2, KeyRound, Sparkles, UploadCloud } from 'lucide-react';
import { SAMPLE_MANIFESTS } from '../data/samples';

interface EmptyStatePromptProps {
  onSelectSample: (id: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EmptyStatePrompt({ onSelectSample, onFileUpload }: EmptyStatePromptProps) {
  return (
    <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-950/40">
        <Terminal className="w-6 h-6" />
      </div>

      <h2 className="text-xl font-bold text-white tracking-tight">
        Awaiting Manifest or Code Input
      </h2>
      <p className="text-sm font-medium text-cyan-400 mt-1 max-w-lg mx-auto">
        Please paste your package.json, requirements.txt, or GitHub file tree.
      </p>

      <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
        DevTrace AI Engine evaluates exposed secrets, CVE package vulnerabilities, and commercial license copyleft compliance, outputting a strict JSON audit report.
      </p>

      {/* Preset sample cards for quick 1-click loading */}
      <div className="mt-6 text-left max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
          Or test with sample attack vectors & manifests:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SAMPLE_MANIFESTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample.id)}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-700/60 hover:bg-slate-900/90 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  {sample.category === 'node' && <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {sample.category === 'python' && <Terminal className="w-3.5 h-3.5 text-blue-400" />}
                  {sample.category === 'secrets' && <KeyRound className="w-3.5 h-3.5 text-rose-400" />}
                  {sample.category === 'clean' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                  {sample.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                  {sample.fileName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload button option */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 max-w-md mx-auto">
        <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors shadow-sm">
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>Upload File (.json, .txt, .js, .py, .env)</span>
          <input
            type="file"
            onChange={onFileUpload}
            className="hidden"
            accept=".json,.txt,.js,.ts,.py,.env,.yaml,.yml,.lock"
          />
        </label>
      </div>
    </div>
  );
}
