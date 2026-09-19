interface ScoreGaugeProps {
  score: number;
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  // Clamp score between 0 and 100
  const cleanScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine health color and rating
  let statusText = 'Low Risk';
  let grade = 'A';
  let strokeColor = '#10b981'; // emerald-500
  let badgeBg = 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300';
  let glowColor = 'shadow-emerald-500/10';

  if (cleanScore < 50) {
    statusText = 'Critical Risk';
    grade = 'F';
    strokeColor = '#ef4444'; // rose-500
    badgeBg = 'bg-rose-950/80 border-rose-800/80 text-rose-300';
    glowColor = 'shadow-rose-500/10';
  } else if (cleanScore < 75) {
    statusText = 'High Vulnerability';
    grade = 'C';
    strokeColor = '#f59e0b'; // amber-500
    badgeBg = 'bg-amber-950/80 border-amber-800/80 text-amber-300';
    glowColor = 'shadow-amber-500/10';
  } else if (cleanScore < 85) {
    statusText = 'Moderate Risk';
    grade = 'B';
    strokeColor = '#06b6d4'; // cyan-500
    badgeBg = 'bg-cyan-950/80 border-cyan-800/80 text-cyan-300';
    glowColor = 'shadow-cyan-500/10';
  }

  // Circle radius and circumference
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cleanScore / 100) * circumference;

  return (
    <div className={`p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-5 shadow-lg ${glowColor}`}>
      <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black tracking-tight text-white font-mono">
            {cleanScore}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Security Score
          </span>
          <span className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded border ${badgeBg}`}>
            Grade {grade}
          </span>
        </div>
        <p className="text-base font-semibold text-white tracking-tight">
          {statusText}
        </p>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
          Calculated by secrets exposure, CVE severity metrics, and license copyleft compliance.
        </p>
      </div>
    </div>
  );
}
