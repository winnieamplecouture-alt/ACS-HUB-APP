import { stageStyle } from "../data/customers";

export default function StagePill({ stage }) {
  const s = stageStyle(stage.key);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {stage.label}
    </span>
  );
}
