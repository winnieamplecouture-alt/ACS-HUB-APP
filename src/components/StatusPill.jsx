import { STATUS_STYLES } from "../data/designs";

export default function StatusPill({ status }) {
  const s = STATUS_STYLES[status.key];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text} ${s.border}`}>
      <span>{status.emoji}</span>
      {status.label}
    </span>
  );
}
