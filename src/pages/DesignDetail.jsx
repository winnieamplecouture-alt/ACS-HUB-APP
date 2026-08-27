import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Check, Shirt, X, Pencil, Upload, Zap } from "lucide-react";
import StatusPill from "../components/StatusPill";
import { DELAY_REASONS, designStatus, expectedVsActual } from "../data/designs";
import { totalDays } from "../data/timelineTemplates";
import { useDesigns } from "../state/DesignsContext";

function toISO(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function formatShort(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function resizeImageToDataUrl(file, maxDim = 900, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function DesignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDesign, startTimeline, toggleMilestone, setDelay, updateDesign, renameDesignId, templateForDesign } = useDesigns();
  const design = getDesign(id);

  const [reason, setReason] = useState(design?.timeline?.delay?.reason ?? DELAY_REASONS[0]);
  const [action, setAction] = useState(design?.timeline?.delay?.action ?? "");
  const [delayPic, setDelayPic] = useState(design?.timeline?.delay?.pic ?? design?.pic ?? "");
  const [recoveryDate, setRecoveryDate] = useState(design?.timeline?.delay?.recoveryDate ?? "");
  const [startDateInput, setStartDateInput] = useState(toISO(new Date()));
  const [milestoneDates, setMilestoneDates] = useState({});
  const [pendingDay, setPendingDay] = useState(null);
  const [pendingDate, setPendingDate] = useState("");
  const [pendingNote, setPendingNote] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [editingId, setEditingId] = useState(false);
  const [idInput, setIdInput] = useState(design?.id ?? "");
  const [idError, setIdError] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerInput, setCustomerInput] = useState(design?.customer ?? "");
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!design) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/designs")} className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800">
          <ArrowLeft size={16} /> Back to list
        </button>
        <p className="text-sm text-gray-500">Design "{id}" was not found.</p>
      </div>
    );
  }

  const status = designStatus(design);
  const { expected, next } = expectedVsActual(design);
  const previewTemplate = templateForDesign(design);
  const previewTotalDays = totalDays(previewTemplate.stages);
  const totalDaysForDesign = design.timeline ? design.timeline.milestones.at(-1)?.day ?? previewTotalDays : previewTotalDays;

  function saveDelay() {
    setDelay(design.id, { reason, action, pic: delayPic, recoveryDate });
  }

  function openPending(m) {
    setPendingDay(m.day);
    setPendingDate(milestoneDates[m.day] ?? toISO(new Date()));
    setPendingNote(m.note ?? "");
  }

  function confirmPending(m) {
    if (!pendingNote.trim()) return;
    setMilestoneDates((prev) => ({ ...prev, [m.day]: pendingDate }));
    toggleMilestone(design.id, m.day, true, new Date(pendingDate), pendingNote.trim());
    setPendingDay(null);
    setPendingNote("");
  }

  function startEditId() {
    setIdInput(design.id);
    setIdError("");
    setEditingId(true);
  }

  function saveId() {
    const trimmed = idInput.trim();
    if (!trimmed || trimmed === design.id) {
      setEditingId(false);
      return;
    }
    const result = renameDesignId(design.id, trimmed);
    if (!result.ok) {
      setIdError(result.error ?? "Couldn't rename.");
      return;
    }
    setEditingId(false);
    navigate(`/designs/${trimmed}`, { replace: true });
  }

  function startEditCustomer() {
    setCustomerInput(design.customer);
    setEditingCustomer(true);
  }

  function saveCustomer() {
    if (customerInput.trim()) {
      updateDesign(design.id, { customer: customerInput.trim() });
    }
    setEditingCustomer(false);
  }

  async function handlePhotoFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      updateDesign(design.id, { photo: dataUrl });
    } finally {
      setPhotoUploading(false);
    }
  }

  const bestPracticeEntries = design.timeline
    ? design.timeline.milestones.filter((m) => m.done && m.note)
    : [];

  return (
    <div className="space-y-5">
      <button onClick={() => navigate("/designs")} className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800">
        <ArrowLeft size={16} /> Back to list
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {design.photo ? (
            <button onClick={() => setLightboxOpen(true)} className="shrink-0">
              <img src={design.photo} alt={design.name} className="h-16 w-16 rounded-xl border border-gray-200 object-cover transition hover:opacity-80" />
            </button>
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-300">
              <Shirt size={22} />
            </span>
          )}
          <div>
            {editingId ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-gray-900">Design</span>
                  <input
                    autoFocus
                    value={idInput}
                    onChange={(e) => {
                      setIdInput(e.target.value);
                      setIdError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveId();
                      if (e.key === "Escape") setEditingId(false);
                    }}
                    className="rounded-lg border border-gray-300 px-2 py-0.5 text-2xl font-semibold text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <button onClick={saveId} className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700">
                    Save
                  </button>
                  <button onClick={() => setEditingId(false)} className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100">
                    Cancel
                  </button>
                </div>
                {idError && <p className="mt-1 text-xs text-red-600">{idError}</p>}
              </div>
            ) : (
              <h1 className="group flex items-center gap-1.5 text-2xl font-semibold text-gray-900">
                Design {design.id}
                <button onClick={startEditId} className="text-gray-300 opacity-0 transition group-hover:opacity-100 hover:text-gray-600">
                  <Pencil size={14} />
                </button>
              </h1>
            )}
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              {design.name}
              {design.category && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{design.category}</span>}
              <button
                onClick={() => updateDesign(design.id, { urgent: !design.urgent })}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition ${
                  design.urgent ? "bg-red-100 text-red-700" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >
                <Zap size={11} />
                {design.urgent ? "Urgent" : "Mark Urgent"}
              </button>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={status} />
          <span className="text-sm font-medium text-gray-500">
            {status.currentDay ? `Day ${status.currentDay} / ${totalDaysForDesign}` : "Not started"}
          </span>
        </div>
      </div>

      {lightboxOpen && design.photo && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
        >
          <button onClick={() => setLightboxOpen(false)} className="absolute right-6 top-6 text-white/80 hover:text-white">
            <X size={28} />
          </button>
          <img src={design.photo} alt={design.name} className="max-h-full max-w-3xl rounded-lg object-contain" />
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-400">Customer</dt>
            {editingCustomer ? (
              <div className="mt-0.5 flex items-center gap-2">
                <input
                  autoFocus
                  value={customerInput}
                  onChange={(e) => setCustomerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveCustomer();
                    if (e.key === "Escape") setEditingCustomer(false);
                  }}
                  className="w-full min-w-0 rounded-md border border-gray-300 px-2 py-1 text-sm font-medium text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button onClick={saveCustomer} className="shrink-0 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700">
                  Save
                </button>
                <button onClick={() => setEditingCustomer(false)} className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100">
                  Cancel
                </button>
              </div>
            ) : (
              <dd className="group mt-0.5 flex items-center gap-1.5 font-medium text-gray-800">
                {design.customer}
                <button onClick={startEditCustomer} className="text-gray-300 opacity-0 transition group-hover:opacity-100 hover:text-gray-600">
                  <Pencil size={12} />
                </button>
              </dd>
            )}
            <p className="mt-1 text-[11px] text-gray-400">Wrong customer? Edit here and it moves to the right group in the Designs list.</p>
          </div>
          <Field icon={<User size={14} />} label="PIC" value={design.pic ?? "Unassigned"} />
          {design.remark && <Field label="Remark" value={design.remark} />}
        </dl>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="relative w-full shrink-0 lg:w-[220px]">
          {design.photo ? (
            <button onClick={() => setLightboxOpen(true)} className="block h-full min-h-[300px] w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
              <img src={design.photo} alt={design.name} className="h-full w-full object-cover object-top transition hover:opacity-80" />
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-full min-h-[300px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white text-gray-300 hover:border-gray-300 hover:text-gray-400"
            >
              <Shirt size={32} />
              <span className="text-xs font-medium">Upload Photo</span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoFile} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={photoUploading}
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow hover:bg-white disabled:opacity-50"
          >
            <Upload size={12} /> {photoUploading ? "Uploading…" : design.photo ? "Change" : "Upload"}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {!design.timeline ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">This design hasn't started its timeline yet.</p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-gray-400">
                It'll follow the <span className="font-medium text-gray-600">{previewTemplate.label}</span> timeline ({previewTotalDays} days) —{" "}
                {design.urgent ? "marked Urgent above." : "change its Category, or mark it Urgent above, to use a different one."} Edit stage durations
                in Settings.
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-gray-400">
                If work already started earlier, set the real start date — Day 1 and every target date will be calculated from it.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  max={toISO(new Date())}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  onClick={() => startTimeline(design.id, new Date(startDateInput))}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Start {previewTotalDays}-Day Timeline
                </button>
              </div>
            </div>
          ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr_280px]">
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Expected Today</h2>
              <p className="text-sm text-gray-700">
                {expected ? `${expected.done ? "✔" : "○"} ${expected.label}` : "—"}
              </p>
              <h2 className="mb-3 mt-4 text-sm font-semibold text-gray-900">Actual</h2>
              <p className="text-sm text-gray-700">
                {expected ? (expected.done ? `✔ ${expected.label}` : "Not done yet") : "—"}
              </p>
              <h2 className="mb-3 mt-4 text-sm font-semibold text-gray-900">Next Target</h2>
              <p className="text-sm text-gray-700">
                {next ? `Day ${next.day} · ${next.label}` : "All milestones complete"}
              </p>
            </div>

            {status.key === "behind" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <h2 className="mb-4 text-sm font-semibold text-red-800">Behind Schedule</h2>
                <div className="space-y-4">
                  <div>
                    <p className="mb-1.5 text-sm font-medium text-gray-700">Why?</p>
                    <div className="flex flex-wrap gap-2">
                      {DELAY_REASONS.map((r) => (
                        <button
                          key={r}
                          onClick={() => setReason(r)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            reason === r ? "border-red-400 bg-red-100 text-red-800" : "border-gray-200 bg-white text-gray-600"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Action</label>
                    <input
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      placeholder="What are we doing about it?"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">PIC</label>
                    <input
                      value={delayPic}
                      onChange={(e) => setDelayPic(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Expected Recovery Date</label>
                    <input
                      type="date"
                      value={recoveryDate}
                      onChange={(e) => setRecoveryDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <button
                    onClick={saveDelay}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Timeline Progress</h2>
              <p className="mb-4 text-xs text-gray-400">
                Tick a step when it's done — you'll be asked for the date and a short best-practice note before it's saved.
              </p>
              <ul className="space-y-3">
                {design.timeline.milestones.map((m) => {
                  const dateValue = milestoneDates[m.day] ?? toISO(m.completedDate ?? new Date());
                  const isPending = pendingDay === m.day;
                  return (
                    <li key={m.day}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => (m.done ? toggleMilestone(design.id, m.day, false) : openPending(m))}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            m.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 bg-white hover:border-gray-400"
                          }`}
                        >
                          {m.done && <Check size={13} />}
                        </button>
                        <span className="w-14 shrink-0 text-xs text-gray-400">Day {m.day}</span>
                        <span className={`flex-1 text-sm ${m.done ? "text-gray-900" : "text-gray-600"}`}>{m.label}</span>
                        {m.done && (
                          <input
                            type="date"
                            value={dateValue}
                            max={toISO(new Date())}
                            onChange={(e) => {
                              const v = e.target.value;
                              setMilestoneDates((prev) => ({ ...prev, [m.day]: v }));
                              toggleMilestone(design.id, m.day, true, new Date(v), m.note);
                            }}
                            className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-xs text-emerald-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        )}
                      </div>
                      {isPending && (
                        <div className="ml-8 mt-2 space-y-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-600">Date completed</label>
                            <input
                              type="date"
                              value={pendingDate}
                              max={toISO(new Date())}
                              onChange={(e) => setPendingDate(e.target.value)}
                              className="rounded-md border border-gray-200 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                            <span
                              className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
                                pendingDate && pendingDate <= toISO(m.targetDate)
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {pendingDate && pendingDate <= toISO(m.targetDate) ? "🟢 On time" : "🔴 Overdue"}
                            </span>
                          </div>
                          <textarea
                            value={pendingNote}
                            onChange={(e) => setPendingNote(e.target.value)}
                            placeholder="Best-practice note — why on time, or why overdue? (required)"
                            rows={2}
                            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setPendingDay(null)}
                              className="rounded-md px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => confirmPending(m)}
                              disabled={!pendingNote.trim()}
                              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Mark Done
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-1 text-sm font-semibold text-gray-900">Best Practice</h2>
              <p className="mb-4 text-xs text-gray-400">Compulsory note captured each time a step is ticked done.</p>
              {bestPracticeEntries.length === 0 ? (
                <p className="text-xs text-gray-400">Nothing recorded yet — tick a step to add the first note.</p>
              ) : (
                <ul className="space-y-3">
                  {bestPracticeEntries.map((m) => {
                    const onTime = m.completedDate && m.targetDate && toISO(m.completedDate) <= toISO(m.targetDate);
                    return (
                      <li key={m.day} className={`rounded-lg border p-3 text-xs ${onTime ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50"}`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${onTime ? "text-emerald-700" : "text-red-700"}`}>
                            {onTime ? "🟢 Completed in time" : "🔴 Overdue"}
                          </span>
                          <span className="text-gray-400">{formatShort(m.completedDate)}</span>
                        </div>
                        <p className="mt-1 text-gray-500">{m.label} (Day {m.day})</p>
                        <p className="mt-1 text-gray-700">{m.note}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
          )}
        </div>
      </div>
    </div>
  );
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
