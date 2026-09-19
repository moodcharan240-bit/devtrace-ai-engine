import { KeyRound, FileCode, Copy, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { SecretFound } from '../types';

interface SecretsViewProps {
  secrets: SecretFound[];
}

export function SecretsView({ secrets }: SecretsViewProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!secrets || secrets.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
        <div className="w-10 h-10 mx-auto rounded-full bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mb-3">
          <KeyRound className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">No Exposed Secrets Found</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Scanned patterns for AWS access keys, GitHub PATs, JWT session tokens, and database connection URIs. Zero leaks detected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Exposed Secrets & Credentials ({secrets.length})
          </h3>
        </div>
        <span className="text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2.5 py-0.5 rounded-full">
          Immediate Rotation Required
        </span>
      </div>

      <div className="grid gap-2.5">
        {secrets.map((secret, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-900/40 hover:border-rose-700/60 transition-colors shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold bg-rose-950 border border-rose-800/80 text-rose-300 rounded">
                  {secret.type}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-300 font-mono">
                  <FileCode className="w-3.5 h-3.5 text-slate-400" />
                  {secret.file || 'source'}
                  <span className="text-slate-500">:</span>
                  <span className="text-amber-400 font-semibold">L{secret.line || 1}</span>
                </span>
              </div>

              <button
                onClick={() => handleCopy(secret.masked_snippet, idx)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-800 transition-colors"
                title="Copy masked snippet"
              >
                {copiedIdx === idx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2.5 font-mono text-xs text-slate-200 overflow-x-auto flex items-center justify-between gap-4">
              <code className="text-rose-400 font-semibold">{secret.masked_snippet}</code>
              <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">
                [Masked for safety]
              </span>
            </div>

            <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-slate-400">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Do not commit raw secrets to source control. Invalidate this credential and inject via environment variables.
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
