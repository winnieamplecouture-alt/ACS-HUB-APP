import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Mail, User, ExternalLink, Check, Circle, CircleDot } from "lucide-react";
import StagePill from "../components/StagePill";
import { STAGE_ORDER, stageFlags } from "../data/customers";
import { useCustomers } from "../state/CustomersContext";

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const SKETCH_LABEL = { confirmed: "Confirmed by customer", pending: "Pending customer confirmation" };
const TS_LABEL = { in_progress: "In progress", done: "Done", pending: "Queued" };
const FABRIC_LABEL = { pending: "Sourcing / quotation in progress", confirmed: "Confirmed — ready for production" };

export default function CustomerDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getCustomer, beginDesignTimeline, updateMilestone } = useCustomers();
  const customer = getCustomer(orderId);

  if (!customer) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/customers")} className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800">
          <ArrowLeft size={16} /> Back to list
        </button>
        <p className="text-sm text-gray-500">Customer "{orderId}" was not found.</p>
      </div>
    );
  }

  const flags = stageFlags(customer);

  return (
    <div className="space-y-5">
      <button onClick={() => navigate("/customers")} className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800">
        <ArrowLeft size={16} /> Back to list
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{customer.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {customer.tier} tier · Order {customer.orderId}
          </p>
        </div>
        <StagePill stage={customer.stage} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <User size={16} className="text-gray-400" /> Contact & Order
            </h2>
            <dl className="space-y-3 text-sm">
              <Field icon={<Phone size={14} />} label="Phone" value={customer.phone} />
              <Field icon={<Mail size={14} />} label="Email" value={customer.email} />
              <Field label="PIC" value={customer.pic ?? "Unassigned"} />
              <Field label="Registered" value={customer.registeredDate} />
              <Field label="Package" value={customer.packageAmount} />
              <Field label="Actual Amount" value={customer.actualAmount} />
              {customer.discount && <Field label="Discount" value={customer.discount} />}
              {customer.canvaLink && (
                <div>
                  <dt className="text-xs text-gray-400">Canva Board</dt>
                  <dd className="mt-0.5">
                    <a
                      href={customer.canvaLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
                    >
                      Open board <ExternalLink size={12} />
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Pipeline</h2>
          <ol className="space-y-0">
            {STAGE_ORDER.map((s, i) => {
              const done = flags[s.key];
              const isCurrent = s.key === customer.stage.key;
              const note = stageNote(customer, s.key);
              return (
                <li key={s.key} className="flex gap-3 pb-5 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        done ? "bg-emerald-500 text-white" : isCurrent ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {done ? <Check size={14} /> : isCurrent ? <CircleDot size={14} /> : <Circle size={12} />}
                    </span>
                    {i < STAGE_ORDER.length - 1 && <span className="mt-1 w-px flex-1 bg-gray-100" />}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className={`text-sm font-medium ${done || isCurrent ? "text-gray-900" : "text-gray-400"}`}>{s.label}</p>
                    {note && <p className="mt-0.5 whitespace-pre-line text-xs text-gray-500">{note}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">Designs</h2>
        <p className="mb-4 text-xs text-gray-400">
          {customer.designs.length === 0
            ? "No designs started yet."
            : `${customer.designs.length} garment${customer.designs.length === 1 ? "" : "s"} in this order`}
        </p>

        {customer.designs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
            Designs will appear here once sketching begins.
          </p>
        ) : (
          <div className="space-y-3">
            {customer.designs.map((d) => (
              <GarmentCard
                key={d.id}
                design={d}
                onStartTimeline={() => beginDesignTimeline(customer.orderId, d.id, new Date())}
                onMarkMilestone={(day) => updateMilestone(customer.orderId, d.id, day, new Date())}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function stageNote(customer, key) {
  switch (key) {
    case "personal_image":
      return customer.personalImage?.note;
    case "consultation":
      return customer.consultation?.note;
    case "fabric_sourcing":
      return customer.fabricSourcingNote;
    default:
      return null;
  }
}

function Field({ icon, label, value }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-gray-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-gray-800">{value}</dd>
    </div>
  );
}

function GarmentCard({ design, onStartTimeline, onMarkMilestone }) {
  const timeline = design.timeline;
  const nextMilestone = timeline?.milestones.find((m) => !m.actualDate);
  const totalDays = timeline?.milestones.at(-1).day ?? 44;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-gray-900">{design.name}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge label="Sketch" value={SKETCH_LABEL[design.sketch] ?? "Not started"} tone={design.sketch === "confirmed" ? "green" : "gray"} />
          <Badge
            label="Tech Sketch"
            value={design.techSketch ? TS_LABEL[design.techSketch] : "Not started"}
            tone={design.techSketch === "done" ? "green" : design.techSketch ? "blue" : "gray"}
          />
          <Badge
            label="Fabric"
            value={design.fabric ? FABRIC_LABEL[design.fabric] : "Not started"}
            tone={design.fabric === "confirmed" ? "green" : design.fabric ? "amber" : "gray"}
          />
        </div>
      </div>
      {design.note && <p className="mt-1 text-xs text-gray-500">{design.note}</p>}

      {!timeline && (
        <div className="mt-3">
          <button
            onClick={onStartTimeline}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Start Design Timeline
          </button>
          <p className="mt-1.5 text-[11px] text-gray-400">
            Day 1 = start of Sketch Development. ETA to Handover: ~{totalDays} days.
          </p>
        </div>
      )}

      {timeline && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700">
              Day {timeline.currentDay} / {totalDays}
            </span>
            {nextMilestone ? (
              <span className="text-gray-500">
                Next: {nextMilestone.label} (Day {nextMilestone.day})
              </span>
            ) : (
              <span className="font-medium text-emerald-600">Delivered</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {timeline.milestones.map((m) => (
              <div
                key={m.day}
                title={m.etaNote ?? undefined}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                  m.actualDate ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                {m.actualDate ? <Check size={12} /> : <Circle size={10} />}
                {m.label} <span className="text-gray-400">(Day {m.day})</span>
                {m.actualDate && <span className="text-emerald-500">· {formatDate(m.actualDate)}</span>}
              </div>
            ))}
          </div>
          {nextMilestone && (
            <button
              onClick={() => onMarkMilestone(nextMilestone.day)}
              className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Mark "{nextMilestone.label}" Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ label, value, tone }) {
  const tones = {
    gray: "bg-gray-50 text-gray-600 border-gray-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {label}: {value}
    </span>
  );
}
