
export default function ProgressRing({progress}:{progress:number}) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress/100)*circumference;
  return (
    <div style={{width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width="44" height="44" style={{display:'block'}}>
        <circle cx="22" cy="22" r={radius} stroke="white" strokeOpacity="0.1" strokeWidth="6" fill="none"/>
        <circle cx="22" cy="22" r={radius} stroke="url(#grad)" strokeWidth="6" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"/>
        <defs>
          <linearGradient id="grad">
            <stop offset="0%" stopColor="#7c3aed"/>
            <stop offset="100%" stopColor="#22c55e"/>
          </linearGradient>
        </defs>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="11" fill="var(--text)">{progress}%</text>
      </svg>
    </div>
  )
}
