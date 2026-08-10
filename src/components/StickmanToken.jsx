const STICKMAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="5" r="3"/>
  <path d="M12 8v8"/>
  <path d="M8 12h8"/>
  <path d="M8 16l4-4"/>
  <path d="M16 16l-4-4"/>
</svg>`;

export default function StickmanToken({ color, size = 32, teamNumber }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        color: color,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
      }}
      title={`Team ${teamNumber}`}
    >
      <div dangerouslySetInnerHTML={{ __html: STICKMAN_SVG }} />
    </div>
  );
}