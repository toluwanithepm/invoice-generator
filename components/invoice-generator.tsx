"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Plus,
  Trash2,
  FileText,
  Image as ImageIcon,
  Calendar,
  User,
  Mail,
  Phone,
  Instagram,
  RefreshCw,
  MapPin,
  Hash,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Item = {
  id: string
  description: string
  quantity: number
  price: number
}

type InvoiceData = {
  invoiceNumber: string
  date: string
  dueDate: string
  client: { name: string; email: string; phone: string; address: string }
  items: Item[]
  taxRate: number
  notes: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = {
  name: "Glam Up With Feyi",
  tagline: "Professional Makeup & Beauty Services",
  email: "feyisaraabodunrin@gmail.com",
  phone: "+234 813 100 3292",
  instagram: "@feyi_shara_",
} as const

const C = {
  primary: "#92400e",
  dark: "#78350f",
  light: "#b45309",
  accent: "#fef3c7",
  border: "#fde68a",
  gold: "#f59e0b",
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genInvoiceNumber() {
  const n = Number.parseInt(localStorage.getItem("lastInvoiceNumber") || "0") + 1
  localStorage.setItem("lastInvoiceNumber", n.toString())
  return `FS-${n.toString().padStart(6, "0")}`
}

function fmt(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount)
}

function fmtDate(dateStr: string) {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

// ─── Shared input class ───────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 " +
  "transition-all duration-150 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  icon: Icon,
  children,
  className = "",
}: {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      {children}
    </div>
  )
}

function SectionHeader({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold text-zinc-800">{title}</h3>
      {action}
    </div>
  )
}

function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: "success" | "error"
  onClose: () => void
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-medium
        ${type === "success" ? "bg-white border-emerald-200 text-emerald-700" : "bg-white border-red-200 text-red-700"}`}
      style={{ animation: "slideUp 0.25s ease" }}
    >
      {type === "success" ? (
        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
      )}
      {message}
      <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InvoiceGenerator() {
  const invoiceRef = useRef<HTMLDivElement | null>(null)
  const [isExporting, setIsExporting] = useState<"pdf" | "png" | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const [data, setData] = useState<InvoiceData>({
    invoiceNumber: "",
    date: "",
    dueDate: "",
    client: { name: "", email: "", phone: "", address: "" },
    items: [{ id: "1", description: "", quantity: 1, price: 0 }],
    taxRate: 0,
    notes: "",
  })

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    setData((p) => ({ ...p, invoiceNumber: genInvoiceNumber(), date: today, dueDate: due }))
  }, [])

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Data ops ────────────────────────────────────────────────────────────────

  const addItem = () =>
    setData((p) => ({
      ...p,
      items: [...p.items, { id: Date.now().toString(), description: "", quantity: 1, price: 0 }],
    }))

  const removeItem = (id: string) => {
    if (data.items.length > 1)
      setData((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) }))
  }

  const updateItem = (id: string, field: keyof Omit<Item, "id">, value: string | number) =>
    setData((p) => ({
      ...p,
      items: p.items.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    }))

  const updateClient = (field: string, value: string) =>
    setData((p) => ({ ...p, client: { ...p.client, [field]: value } }))

  const set = (field: string, value: unknown) =>
    setData((p) => ({ ...p, [field]: value }))

  // ── Calculations ────────────────────────────────────────────────────────────

  const subtotal = data.items.reduce((s, i) => s + i.quantity * i.price, 0)
  const tax = subtotal * (data.taxRate / 100)
  const total = subtotal + tax

  const hasClient =
    data.client.name || data.client.email || data.client.phone || data.client.address

  const regenerate = () => {
    set("invoiceNumber", genInvoiceNumber())
    showToast("New invoice number generated")
  }

  // ── PDF Export (html2canvas + jsPDF — pixel-perfect) ─────────────────────────

  const exportToPDF = async () => {
    setIsExporting("pdf")
    try {
      if (!invoiceRef.current) throw new Error("Invoice preview not found")

      const html2canvas = (await import("html2canvas-pro")).default
      const { jsPDF } = await import("jspdf")

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 8 // mm
      const contentW = pageW - 2 * margin
      const imgH = (canvas.height * contentW) / canvas.width

      if (imgH > pageH - 2 * margin) {
        const contentH = pageH - 2 * margin
        const scaledW = (canvas.width * contentH) / canvas.height
        const xOff = (pageW - scaledW) / 2
        pdf.addImage(imgData, "PNG", xOff, margin, scaledW, contentH)
      } else {
        pdf.addImage(imgData, "PNG", margin, margin, contentW, imgH)
      }

      pdf.save(`Invoice-${data.invoiceNumber}.pdf`)
      showToast("Invoice saved as PDF!")
    } catch (err) {
      showToast(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error")
    } finally {
      setTimeout(() => setIsExporting(null), 1500)
    }
  }

  // ── PNG Export (html2canvas — pixel-perfect) ────────────────────────────────

  const exportToPNG = async () => {
    setIsExporting("png")
    try {
      if (!invoiceRef.current) throw new Error("Invoice preview not found")

      const html2canvas = (await import("html2canvas-pro")).default

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      })

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.download = `Invoice-${data.invoiceNumber}.png`
            a.href = url
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            showToast("Invoice downloaded as PNG!")
          }
        },
        "image/png",
        1.0,
      )
    } catch (err) {
      showToast(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error")
    } finally {
      setTimeout(() => setIsExporting(null), 1000)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="min-h-screen" style={{ backgroundColor: "#fafaf9" }}>
        {/* ── App Bar ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100">
          <div className="max-w-[1440px] mx-auto px-5 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg"
                style={{ background: `linear-gradient(135deg, ${C.light}, ${C.dark})` }}
              >
                G
              </div>
              <div className="leading-tight">
                <span className="text-sm font-bold text-zinc-900">{BRAND.name}</span>
                <span className="hidden sm:inline text-zinc-400 text-sm font-normal">
                  {" "}
                  · Invoice Generator
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Live preview</span>
            </div>
          </div>
        </header>

        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-[540px_1fr] gap-8 items-start">
            {/* ══ FORM PANEL ══════════════════════════════════════════ */}
            <div className="flex flex-col gap-4">
              {/* Invoice Details */}
              <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                <SectionHeader title="Invoice Details" />
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <Field label="Invoice Number" icon={Hash} className="col-span-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={data.invoiceNumber}
                        onChange={(e) => set("invoiceNumber", e.target.value)}
                        className={`${inputCls} font-mono text-amber-800 font-bold`}
                      />
                      <button
                        onClick={regenerate}
                        title="Generate new number"
                        className="shrink-0 w-10 h-10 flex items-center justify-center border border-zinc-200 rounded-xl text-zinc-400 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </Field>

                  <Field label="Issue Date" icon={Calendar}>
                    <input
                      type="date"
                      value={data.date}
                      onChange={(e) => set("date", e.target.value)}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Due Date" icon={Calendar}>
                    <input
                      type="date"
                      value={data.dueDate}
                      onChange={(e) => set("dueDate", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </section>

              {/* Client Information */}
              <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                <SectionHeader title="Client Information" />
                <div className="mt-5 grid grid-cols-1 gap-3">
                  <Field label="Client Name" icon={User}>
                    <input
                      type="text"
                      value={data.client.name}
                      onChange={(e) => updateClient("name", e.target.value)}
                      placeholder="e.g., Adaeze Okonkwo"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Email" icon={Mail}>
                      <input
                        type="email"
                        value={data.client.email}
                        onChange={(e) => updateClient("email", e.target.value)}
                        placeholder="client@email.com"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Phone" icon={Phone}>
                      <input
                        type="tel"
                        value={data.client.phone}
                        onChange={(e) => updateClient("phone", e.target.value)}
                        placeholder="+234 xxx xxx xxxx"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Address" icon={MapPin}>
                    <input
                      type="text"
                      value={data.client.address}
                      onChange={(e) => updateClient("address", e.target.value)}
                      placeholder="Client address (optional)"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </section>

              {/* Services & Items */}
              <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                <SectionHeader
                  title="Services & Items"
                  action={
                    <button
                      onClick={addItem}
                      className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-white transition-all active:scale-95 shadow-sm"
                      style={{ backgroundColor: C.primary }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.dark)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Service
                    </button>
                  }
                />

                <div className="mt-5 flex flex-col gap-3">
                  {data.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="group relative border rounded-xl p-4 transition-all duration-200"
                      style={{
                        backgroundColor: "#fafafa",
                        borderColor: "#f0f0f0",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#fde68a"
                        e.currentTarget.style.backgroundColor = "#fffdf5"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#f0f0f0"
                        e.currentTarget.style.backgroundColor = "#fafafa"
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-zinc-300 tracking-widest">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        {data.items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Service or item description"
                        className={`${inputCls} mb-3`}
                      />

                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Qty
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.id, "quantity", parseInt(e.target.value) || 1)
                            }
                            className={`${inputCls} text-center`}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Unit Price (₦)
                          </span>
                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={item.price}
                            onChange={(e) =>
                              updateItem(item.id, "price", parseFloat(e.target.value) || 0)
                            }
                            className={inputCls}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Total
                          </span>
                          <div
                            className="h-10 flex items-center px-3.5 rounded-xl text-sm font-bold border"
                            style={{
                              backgroundColor: C.accent,
                              borderColor: C.border,
                              color: C.dark,
                            }}
                          >
                            {fmt(item.quantity * item.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tax Rate */}
                <div className="mt-5 pt-5 border-t border-zinc-100">
                  <Field label="Tax Rate">
                    <div className="flex items-center gap-4 mt-1">
                      <input
                        type="range"
                        min={0}
                        max={25}
                        step={0.5}
                        value={data.taxRate}
                        onChange={(e) => set("taxRate", parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <div
                        className="shrink-0 w-16 h-10 flex items-center justify-center border rounded-xl text-sm font-bold"
                        style={{
                          borderColor: C.border,
                          backgroundColor: C.accent,
                          color: C.dark,
                        }}
                      >
                        {data.taxRate}%
                      </div>
                    </div>
                  </Field>
                </div>
              </section>

              {/* Summary strip */}
              <div
                className="rounded-2xl overflow-hidden border"
                style={{
                  background: `linear-gradient(135deg, ${C.accent}, #fde68a)`,
                  borderColor: C.border,
                }}
              >
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex gap-6">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                        Subtotal
                      </div>
                      <div className="text-sm font-bold text-amber-900 mt-0.5">{fmt(subtotal)}</div>
                    </div>
                    {data.taxRate > 0 && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                          Tax ({data.taxRate}%)
                        </div>
                        <div className="text-sm font-bold text-amber-900 mt-0.5">{fmt(tax)}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                      Total Due
                    </div>
                    <div className="text-2xl font-black text-amber-900 mt-0.5">{fmt(total)}</div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                <SectionHeader title="Notes & Terms" />
                <div className="mt-5">
                  <textarea
                    value={data.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Payment terms, special instructions, or a personal thank-you message..."
                    rows={4}
                    className={`${inputCls} resize-none`}
                  />
                  <div className="mt-1.5 flex justify-end">
                    <span className="text-xs text-zinc-300">{data.notes.length} chars</span>
                  </div>
                </div>
              </section>

              {/* Export Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={exportToPDF}
                  disabled={!!isExporting}
                  className="flex items-center justify-center gap-2.5 h-12 rounded-2xl font-bold text-sm text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${C.light}, ${C.dark})`,
                    boxShadow: `0 6px 20px ${C.primary}40`,
                  }}
                >
                  {isExporting === "pdf" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Export PDF
                </button>

                <button
                  onClick={exportToPNG}
                  disabled={!!isExporting}
                  className="flex items-center justify-center gap-2.5 h-12 rounded-2xl font-bold text-sm border-2 transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ borderColor: C.primary, color: C.primary }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {isExporting === "png" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                  Export PNG
                </button>
              </div>
            </div>

            {/* ══ PREVIEW PANEL ═══════════════════════════════════════ */}
            <div className="xl:sticky xl:top-20">
              {/* Preview label */}
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Live Preview
                </p>
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-updating
                </span>
              </div>

              {/* Paper container */}
              <div
                className="rounded-2xl p-5 overflow-auto"
                style={{
                  backgroundColor: "#e8e8e8",
                  maxHeight: "calc(100vh - 110px)",
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              >
                {/* Invoice document */}
                <div
                  ref={invoiceRef}
                  className="bg-white relative overflow-hidden"
                  style={{
                    minWidth: 560,
                    boxShadow:
                      "0 24px 64px rgba(0,0,0,0.14), 0 8px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.06)",
                    borderRadius: 3,
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: C.primary }}
                  />

                  <div className="pl-8 pr-8 pt-10 pb-10">
                    {/* ── Header ── */}
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h1
                          className="text-2xl font-black tracking-tight mb-1"
                          style={{ color: C.dark }}
                        >
                          {BRAND.name}
                        </h1>
                        <p className="text-sm text-zinc-500 mb-3">{BRAND.tagline}</p>
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-xs text-zinc-400">
                            <Mail className="w-3 h-3 shrink-0" />
                            {BRAND.email}
                          </p>
                          <p className="flex items-center gap-2 text-xs text-zinc-400">
                            <Phone className="w-3 h-3 shrink-0" />
                            {BRAND.phone}
                          </p>
                          <p className="flex items-center gap-2 text-xs text-zinc-400">
                            <Instagram className="w-3 h-3 shrink-0" />
                            {BRAND.instagram}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className="inline-block border rounded-xl px-5 py-3 mb-3"
                          style={{
                            backgroundColor: C.accent,
                            borderColor: C.border,
                          }}
                        >
                          <div
                            className="text-xl font-black tracking-tight"
                            style={{ color: C.dark }}
                          >
                            INVOICE
                          </div>
                          <div className="text-sm font-bold mt-0.5" style={{ color: C.primary }}>
                            #{data.invoiceNumber}
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-zinc-500">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-zinc-400">Issued</span>
                            <span className="font-semibold text-zinc-700">{fmtDate(data.date)}</span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-zinc-400">Due</span>
                            <span className="font-semibold text-zinc-700">
                              {fmtDate(data.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Divider ── */}
                    <div className="border-t border-zinc-100 mb-8" />

                    {/* ── Bill To ── */}
                    {hasClient && (
                      <div className="mb-8">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                          Bill To
                        </p>
                        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                          {data.client.name && (
                            <p className="font-bold text-zinc-900 text-sm">{data.client.name}</p>
                          )}
                          {data.client.email && (
                            <p className="text-zinc-500 text-xs mt-0.5">{data.client.email}</p>
                          )}
                          {data.client.phone && (
                            <p className="text-zinc-500 text-xs">{data.client.phone}</p>
                          )}
                          {data.client.address && (
                            <p className="text-zinc-500 text-xs">{data.client.address}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Services Table ── */}
                    <div className="mb-8">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">
                        Services
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-zinc-100">
                            <th className="text-left pb-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                              Description
                            </th>
                            <th className="text-center pb-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest w-12">
                              Qty
                            </th>
                            <th className="text-right pb-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                              Unit Price
                            </th>
                            <th className="text-right pb-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.items.map((item) =>
                            item.description ? (
                              <tr
                                key={item.id}
                                className="border-b border-zinc-50 last:border-zinc-200"
                              >
                                <td className="py-3 text-zinc-800 font-medium">
                                  {item.description}
                                </td>
                                <td className="py-3 text-center text-zinc-500">{item.quantity}</td>
                                <td className="py-3 text-right text-zinc-500">
                                  {fmt(item.price)}
                                </td>
                                <td className="py-3 text-right font-bold text-zinc-900">
                                  {fmt(item.quantity * item.price)}
                                </td>
                              </tr>
                            ) : null,
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* ── Totals ── */}
                    <div className="flex justify-end mb-8">
                      <div className="w-64">
                        <div className="space-y-2 text-sm pb-3 border-b border-zinc-200">
                          <div className="flex justify-between text-zinc-500">
                            <span>Subtotal</span>
                            <span className="font-medium text-zinc-700">{fmt(subtotal)}</span>
                          </div>
                          {data.taxRate > 0 && (
                            <div className="flex justify-between text-zinc-500">
                              <span>Tax ({data.taxRate}%)</span>
                              <span className="font-medium text-zinc-700">{fmt(tax)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-3">
                          <span className="font-black text-zinc-900 text-base">Total</span>
                          <span
                            className="text-lg font-black"
                            style={{ color: C.primary }}
                          >
                            {fmt(total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── Notes ── */}
                    {data.notes && (
                      <div className="mb-8 border-t border-zinc-100 pt-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                          Notes
                        </p>
                        <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">
                          {data.notes}
                        </p>
                      </div>
                    )}

                    {/* ── Footer ── */}
                    <div className="border-t border-zinc-100 pt-6 flex items-center justify-between">
                      <p className="text-xs text-zinc-400">
                        Thank you for choosing {BRAND.name}!
                      </p>
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black"
                        style={{ backgroundColor: C.primary }}
                      >
                        G
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Toast ─────────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}
