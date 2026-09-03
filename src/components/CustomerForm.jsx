import { FileText } from "lucide-react";
import { PACKAGE_OPTIONS } from "../data/designs";

export function Detail({ label, value, full }) {
  if (!value) return null;
  return (
    <div className={full ? "col-span-full" : undefined}>
      <dt className="text-gray-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-gray-700">{value}</dd>
    </div>
  );
}

export function CustomerForm({ title, form, setForm, batches, showBatch, nameLocked, fileError, onFile, onCancel, onSubmit, submitLabel }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          autoFocus={!nameLocked}
          disabled={nameLocked}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Customer Name (required)"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-500 sm:col-span-2"
        />
        {showBatch ? (
          <select
            value={form.batch}
            onChange={(e) => setForm((f) => ({ ...f, batch: e.target.value }))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        ) : (
          <div />
        )}

        <input
          value={form.orderId}
          onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
          placeholder="Order ID"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <input
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="Contact No."
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <input
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="Email"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />

        <select
          value={form.package}
          onChange={(e) => setForm((f) => ({ ...f, package: e.target.value }))}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Package</option>
          {PACKAGE_OPTIONS.map((p) => (
            <option key={p} value={p}>RM{p}</option>
          ))}
        </select>
        <input
          value={form.packageValue}
          onChange={(e) => setForm((f) => ({ ...f, packageValue: e.target.value }))}
          placeholder="Package Value"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <input
          value={form.packageTypeQty}
          onChange={(e) => setForm((f) => ({ ...f, packageTypeQty: e.target.value }))}
          placeholder="Package Type & Design Quantity"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />

        <div>
          <label className="mb-1 block text-xs text-gray-400">Estimated Completion Date</label>
          <input
            type="date"
            value={form.estimatedCompletionDate}
            onChange={(e) => setForm((f) => ({ ...f, estimatedCompletionDate: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-gray-400">ACS Customization Agreement (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={onFile}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-gray-700"
          />
          {form.agreement && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
              <FileText size={12} /> {form.agreement.fileName}
            </p>
          )}
          {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
        </div>

        <textarea
          value={form.specialRequests}
          onChange={(e) => setForm((f) => ({ ...f, specialRequests: e.target.value }))}
          placeholder="Special Requests"
          rows={2}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:col-span-3"
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onSubmit}
          disabled={!form.name.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitLabel}
        </button>
        <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </div>
  );
}
