type SpinnerProps = {
  variant?: 'dot' | 'inline';
  sizeClass?: string; // used for the dot container (e.g. 'w-12 h-12')
  svgClass?: string; // svg size (e.g. 'h-6 w-6')
  colorClass?: string; // background color for dot variant
  ariaLabel?: string;
  className?: string;
};

export default function Spinner({
  variant = 'dot',
  sizeClass = 'w-12 h-12',
  svgClass = 'h-6 w-6',
  colorClass = 'bg-indigo-600',
  ariaLabel = 'loading',
  className = ''
}: SpinnerProps) {
  const svg = (
    <svg className={`animate-spin ${svgClass} text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="img" aria-label={ariaLabel}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );

  if (variant === 'inline') {
    return svg;
  }

  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <div className={`rounded-full ${colorClass} ${sizeClass} flex items-center justify-center`}>
        {svg}
      </div>
    </div>
  );
}
