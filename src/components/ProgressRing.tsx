
export default function ProgressRing({progress}:{progress:number}) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress/100)*circumference
  return (
    <svg width="60" height="60">
      <circle cx="30" cy="30" r={radius} stroke="white" strokeOpacity="0.1" strokeWidth="8" fill="none"/>
      <circle cx="30" cy="30" r={radius} stroke="url(#grad)" strokeWidth="8" fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"/>
      <defs>
        <linearGradient id="grad">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#22c55e"/>
        </linearGradient>
      </defs>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fill="white">{progress}%</text>
    </svg>
  )
}
