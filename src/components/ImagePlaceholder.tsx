export default function ImagePlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-toac-blue-800 to-toac-blue-950 text-center ${className}`}
      role="img"
      aria-label={label}
    >
      <span className="px-4 font-display text-sm uppercase tracking-wide text-white/70">
        📷 {label}
      </span>
    </div>
  );
}
