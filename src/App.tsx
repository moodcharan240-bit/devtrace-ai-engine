import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { AuditReportView } from './components/AuditReportView';
import { EmptyStatePrompt } from './components/EmptyStatePrompt';
import { SAMPLE_MANIFESTS } from './data/samples';
import { SecurityAuditReport } from './types';
import { runSecurityAudit } from './services/gemini';
import { clientFallbackAudit } from './utils/localAudit';
import { AlertCircle, ShieldCheck, FileSearch, Sparkles } from 'lucide-react';

export default function App() {
  // Initialize with sample 0 (Node.js manifest with CVEs and leaked secrets)
  const defaultSample = SAMPLE_MANIFESTS[0];
  const [code, setCode] = useState<string>(defaultSample.code);
  const [fileName, setFileName] = useState<string>(defaultSample.fileName);
  const [report, setReport] = useState<SecurityAuditReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isAuditedOnce, setIsAuditedOnce] = useState<boolean>(false);

  // Run audit for current code
  const executeAudit = async (targetCode: string = code, targetFile: string = fileName) => {
    const trimmed = (targetCode || '').trim();

    if (!trimmed) {
      setErrorNotice('Please paste your package.json, requirements.txt, or GitHub file tree.');
      setReport(null);
      return;
    }

    setErrorNotice(null);
    setIsLoading(true);

    try {
      const data = await runSecurityAudit(trimmed, targetFile);
      setReport(data);
      setIsAuditedOnce(true);
    } catch (err: any) {
      console.warn('API audit failed, falling back to deterministic local scanner:', err);
      // Run deterministic fallback
      const fallbackData = clientFallbackAudit(trimmed, targetFile);
      setReport(fallbackData);
      setIsAuditedOnce(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial audit on load
  useEffect(() => {
    executeAudit(defaultSample.code, defaultSample.fileName);
  }, []);

  // Preset loader
  const handleSelectSample = (sampleId: string) => {
    const found = SAMPLE_MANIFESTS.find((s) => s.id === sampleId);
    if (found) {
      setCode(found.code);
      setFileName(found.fileName);
      setErrorNotice(null);
      executeAudit(found.code, found.fileName);
    }
  };

  // Clear handler
  const handleClear = () => {
    setCode('');
    setReport(null);
    setErrorNotice('Please paste your package.json, requirements.txt, or GitHub file tree.');
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = (event.target?.result as string) || '';
        setCode(content);
        executeAudit(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onLoadPreset={handleSelectSample} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner if no code or error */}
        {errorNotice && (
          <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-sm font-semibold">{errorNotice}</span>
            </div>
            <button
              onClick={() => handleSelectSample('node-vulnerable')}
              className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              Load Sample Manifest
            </button>
          </div>
        )}

        {/* Workspace 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Panel */}
          <div className="lg:col-span-5 h-full">
            <InputPanel
              code={code}
              onChangeCode={(newCode) => {
                setCode(newCode);
                if (errorNotice && newCode.trim()) {
                  setErrorNotice(null);
                }
              }}
              fileName={fileName}
              onChangeFileName={setFileName}
              onSubmit={() => executeAudit()}
              onClear={handleClear}
              onSelectSample={handleSelectSample}
              onFileUpload={handleFileUpload}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Output & Audit Report */}
          <div className="lg:col-span-7">
            {isLoading ? (
              <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileSearch className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Auditing Manifest & Evaluating CVE Matrix...
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Scanning for credentials, cross-referencing known CVEs in dependencies, and checking viral copyleft license terms.
                  </p>
                </div>
              </div>
            ) : !code.trim() ? (
              <EmptyStatePrompt
                onSelectSample={handleSelectSample}
                onFileUpload={handleFileUpload}
              />
            ) : report ? (
              <AuditReportView
                report={report}
                fileName={fileName}
                onReAudit={() => executeAudit()}
                isLoading={isLoading}
              />
            ) : (
              <EmptyStatePrompt
                onSelectSample={handleSelectSample}
                onFileUpload={handleFileUpload}
              />
            )}
          </div>
        </div>

        {/* Engine Specification Footer */}
        <footer className="pt-6 pb-4 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-400">DevTrace AI Engine</span>
            <span>• HackDevengers 2.0 Edition</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Strict JSON Schema Enforced
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Gemini 3.8 Flash Powered
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
