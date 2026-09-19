import { useState, useRef } from 'react';
import { Play, RotateCcw, UploadCloud, FileCode2, Terminal, KeyRound, Sparkles, Layers } from 'lucide-react';
import { SAMPLE_MANIFESTS } from '../data/samples';

interface InputPanelProps {
  code: string;
  onChangeCode: (code: string) => void;
  fileName: string;
  onChangeFileName: (fileName: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onSelectSample: (id: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

export function InputPanel({
  code,
  onChangeCode,
  fileName,
  onChangeFileName,
  onSubmit,
  onClear,
  onSelectSample,
  onFileUpload,
  isLoading,
}: InputPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lineCount = code ? code.split('\n').length : 0;
  const charCount = code.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Support Cmd+Enter or Ctrl+Enter to trigger audit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onChangeFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onChangeCode(content || '');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
      {/* Header controls: Preset buttons + File target input */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 space-y-3">
        {/* Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Preset Sample:</span>
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_MANIFESTS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample.id)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-1"
                title={sample.description}
              >
                {sample.category === 'node' && <FileCode2 className="w-3 h-3 text-emerald-400" />}
                {sample.category === 'python' && <Terminal className="w-3 h-3 text-blue-400" />}
                {sample.category === 'secrets' && <KeyRound className="w-3 h-3 text-rose-400" />}
                {sample.category === 'clean' && <Sparkles className="w-3 h-3 text-cyan-400" />}
                <span>{sample.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target file name + Upload file */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider absolute left-2.5 top-1.5">
              Target File / Path
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => onChangeFileName(e.target.value)}
              placeholder="e.g. package.json, requirements.txt, src/aws.js"
              className="w-full pt-5 pb-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-[46px] px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
            title="Upload file from machine"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={onFileUpload}
            className="hidden"
            accept=".json,.txt,.js,.ts,.py,.env,.yaml,.yml,.lock"
          />
        </div>
      </div>

      {/* Code Textarea Area with Drag & Drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex-1 min-h-[360px] flex flex-col transition-colors ${
          isDragOver ? 'bg-cyan-950/20 ring-2 ring-inset ring-cyan-500' : 'bg-slate-950'
        }`}
      >
        <textarea
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`// Paste your package.json, requirements.txt, Cargo.toml, go.mod, or raw source code here...\n\n{\n  "dependencies": {\n    "lodash": "4.17.15",\n    "axios": "0.21.1"\n  }\n}`}
          className="w-full h-full p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none placeholder:text-slate-600 selection:bg-cyan-900 selection:text-white"
          spellCheck={false}
        />

        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-cyan-400">
              <UploadCloud className="w-8 h-8 animate-bounce" />
              <span className="text-sm font-semibold">Drop manifest or code file here</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer bar: Stats & Action Buttons */}
      <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>{lineCount} lines</span>
          <span>•</span>
          <span>{charCount} chars</span>
          <span className="hidden md:inline text-slate-500">• (Press ⌘+Enter to scan)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            disabled={!code}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
            title="Clear editor"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Auditing Manifest...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Security Audit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
