"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Trash2, FileText, ImageIcon, Calendar, User, Mail, Phone, Instagram } from "lucide-react"

type Item = { description: string; quantity: number; price: number }

const generateInvoiceNumber = () => {
  const currentNumber = Number.parseInt(localStorage.getItem("lastInvoiceNumber") || "0") + 1
  localStorage.setItem("lastInvoiceNumber", currentNumber.toString())
  return `FS-${currentNumber.toString().padStart(6, "0")}`
}

const businessInfo = {
  name: "Glam Up With Feyi",
  email: "hello@glamtales.ng",
  phone: "+234 813 456 7890",
  instagram: "@glamtales_ng",
}

export default function InvoiceGenerator() {
  const invoiceRef = useRef<HTMLDivElement | null>(null)

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    date: "",
    dueDate: "",
    client: { name: "", email: "", phone: "", address: "" },
    items: [{ description: "", quantity: 1, price: 0 }] as Item[],
    taxRate: 0,
    notes: "", // Notes field already exists in state
    paymentTerms: "Payment due within 14 days",
  })

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    setInvoiceData((prev) => ({
      ...prev,
      invoiceNumber: generateInvoiceNumber(),
      date: today,
      dueDate: dueDate,
    }))
  }, [])

  const addItem = () =>
    setInvoiceData((prev) => ({ ...prev, items: [...prev.items, { description: "", quantity: 1, price: 0 }] }))

  const removeItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
    }
  }

  const updateItem = (index: number, field: keyof Item, value: string | number) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const updateClient = (field: string, value: string) => {
    setInvoiceData((prev) => ({ ...prev, client: { ...prev.client, [field]: value } }))
  }

  const updateInvoiceData = (field: string, value: any) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateSubtotal = () => invoiceData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const calculateTax = () => calculateSubtotal() * (invoiceData.taxRate / 100)
  const calculateTotal = () => calculateSubtotal() + calculateTax()

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(amount)

  const exportToPNG = async () => {
    try {
      console.log("[v0] Starting PNG export...")
      const html2canvas = (await import("html2canvas")).default
      console.log("[v0] html2canvas loaded successfully")

      if (!invoiceRef.current) {
        console.log("[v0] Invoice ref not found")
        alert("Invoice preview not found")
        return
      }

      console.log("[v0] Capturing element with html2canvas...")
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: false,
        foreignObjectRendering: false,
        logging: true, // Enable logging for debugging
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      })

      console.log("[v0] Canvas created successfully, size:", canvas.width, "x", canvas.height)

      const dataURL = canvas.toDataURL("image/png", 1.0)
      console.log("[v0] Data URL created, length:", dataURL.length)

      const link = document.createElement("a")
      link.download = `Glam-Up-With-Feyi-Invoice-${invoiceData.invoiceNumber}.png`
      link.href = dataURL
      document.body.appendChild(link)
      console.log("[v0] Triggering download...")
      link.click()
      document.body.removeChild(link)
      console.log("[v0] PNG export completed successfully")
    } catch (err) {
      console.error("[v0] PNG export error:", err)
      alert(`PNG export failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const exportToPDF = async () => {
    try {
      console.log("[v0] Starting PDF export...")
      const html2canvas = (await import("html2canvas")).default
      console.log("[v0] html2canvas loaded successfully")

      const jsPDFModule = await import("jspdf")
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default
      console.log("[v0] jsPDF loaded successfully")

      if (!invoiceRef.current) {
        console.log("[v0] Invoice ref not found")
        alert("Invoice preview not found")
        return
      }

      console.log("[v0] Capturing element with html2canvas...")
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: false,
        foreignObjectRendering: false,
        logging: true, // Enable logging for debugging
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      })

      console.log("[v0] Canvas created successfully, size:", canvas.width, "x", canvas.height)

      const imgData = canvas.toDataURL("image/png", 1.0)
      console.log("[v0] Image data created, length:", imgData.length)

      const pdf = new jsPDF("p", "mm", "a4")
      console.log("[v0] PDF instance created")

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      console.log("[v0] PDF dimensions:", pdfWidth, "x", pdfHeight)
      console.log("[v0] Image dimensions:", imgWidth, "x", imgHeight)

      // Calculate scaling to fit the image on the PDF page
      const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583))
      const scaledWidth = imgWidth * 0.264583 * ratio
      const scaledHeight = imgHeight * 0.264583 * ratio

      console.log("[v0] Scaled dimensions:", scaledWidth, "x", scaledHeight)

      // Center the image on the page
      const x = (pdfWidth - scaledWidth) / 2
      const y = (pdfHeight - scaledHeight) / 2

      console.log("[v0] Position:", x, ",", y)

      pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight)
      console.log("[v0] Image added to PDF, saving...")

      pdf.save(`Glam-Up-With-Feyi-Invoice-${invoiceData.invoiceNumber}.pdf`)
      console.log("[v0] PDF export completed successfully")
    } catch (err) {
      console.error("[v0] PDF export error:", err)
      alert(`PDF export failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const regenerateInvoiceNumber = () => setInvoiceData((prev) => ({ ...prev, invoiceNumber: generateInvoiceNumber() }))

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-900 mb-2">Glam Up With Feyi</h1>
          <p className="text-gray-600 text-lg">Invoice Generator</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Invoice Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create Invoice</h2>
              <div className="h-1 w-20 bg-amber-800 rounded" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => updateInvoiceData("invoiceNumber", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    onClick={regenerateInvoiceNumber}
                    title="Generate new invoice number"
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ↻
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceData.date}
                  onChange={(e) => updateInvoiceData("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="lg:col-span-2 xl:col-span-1 2xl:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => updateInvoiceData("dueDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Client Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={invoiceData.client.name}
                    onChange={(e) => updateClient("name", e.target.value)}
                    placeholder="Enter client name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={invoiceData.client.email}
                    onChange={(e) => updateClient("email", e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={invoiceData.client.phone}
                    onChange={(e) => updateClient("phone", e.target.value)}
                    placeholder="+234 xxx xxx xxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={invoiceData.client.address}
                    onChange={(e) => updateClient("address", e.target.value)}
                    placeholder="Client address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Services & Items</h3>
                <button
                  onClick={addItem}
                  className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {invoiceData.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Service/Item Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          placeholder="e.g., Bridal Makeup"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value || "1"))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₦)</label>
                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={item.price}
                            onChange={(e) => updateItem(index, "price", Number.parseFloat(e.target.value || "0"))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-gray-900">
                          Total: {formatNaira(item.quantity * item.price)}
                        </div>
                        {invoiceData.items.length > 1 && (
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 p-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Notes</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={invoiceData.notes}
                  onChange={(e) => updateInvoiceData("notes", e.target.value)}
                  placeholder="Add any additional notes, terms, or special instructions..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={exportToPDF}
                className="bg-amber-800 hover:bg-amber-900 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors"
              >
                <FileText className="w-4 h-4" /> Export as PDF
              </button>
              <button
                onClick={exportToPNG}
                className="border-2 border-amber-800 text-amber-800 hover:bg-amber-50 px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors"
              >
                <ImageIcon className="w-4 h-4" /> Export as PNG
              </button>
            </div>
          </div>

          {/* Invoice Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 text-white px-6 py-4">
              <h2 className="text-xl font-bold">Invoice Preview</h2>
              <p className="text-gray-300 mt-1 text-sm">Preview your invoice before exporting</p>
            </div>

            <div className="max-h-[800px] overflow-y-auto">
              <div ref={invoiceRef} className="p-6 bg-white">
                <div className="flex flex-col justify-between items-start mb-8">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-amber-900 mb-2">Glam Up With Feyi</h1>
                    <p className="text-lg text-gray-600 mb-3">Professional Makeup & Beauty Services</p>
                    <div className="space-y-1 text-gray-500 text-sm">
                      <p className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {businessInfo.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {businessInfo.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <Instagram className="w-3 h-3" />
                        {businessInfo.instagram}
                      </p>
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <h2 className="text-2xl font-bold text-amber-900 mb-1">INVOICE</h2>
                      <p className="text-lg font-semibold text-gray-700">#{invoiceData.invoiceNumber}</p>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Date:</span> {invoiceData.date}
                      </p>
                      <p>
                        <span className="font-medium">Due:</span> {invoiceData.dueDate}
                      </p>
                    </div>
                  </div>
                </div>

                {(invoiceData.client.name ||
                  invoiceData.client.email ||
                  invoiceData.client.phone ||
                  invoiceData.client.address) && (
                  <div className="mb-8">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Bill To:</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {invoiceData.client.name && (
                        <p className="font-semibold text-gray-900 text-sm">{invoiceData.client.name}</p>
                      )}
                      {invoiceData.client.email && <p className="text-gray-600 text-sm">{invoiceData.client.email}</p>}
                      {invoiceData.client.phone && <p className="text-gray-600 text-sm">{invoiceData.client.phone}</p>}
                      {invoiceData.client.address && (
                        <p className="text-gray-600 text-sm">{invoiceData.client.address}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Services</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-semibold text-gray-700">Description</th>
                          <th className="text-center py-2 font-semibold text-gray-700">Qty</th>
                          <th className="text-right py-2 font-semibold text-gray-700">Price</th>
                          <th className="text-right py-2 font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.items.map(
                          (item, index) =>
                            item.description && (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="py-3 text-gray-900">{item.description}</td>
                                <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                                <td className="py-3 text-right text-gray-600">{formatNaira(item.price)}</td>
                                <td className="py-3 text-right font-semibold text-gray-900">
                                  {formatNaira(item.quantity * item.price)}
                                </td>
                              </tr>
                            ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end mb-8">
                  <div className="w-full max-w-xs">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-700">
                        <span className="font-medium">Subtotal:</span>
                        <span className="font-medium">{formatNaira(calculateSubtotal())}</span>
                      </div>
                      {invoiceData.taxRate > 0 && (
                        <div className="flex justify-between text-gray-700">
                          <span className="font-medium">Tax ({invoiceData.taxRate}%):</span>
                          <span className="font-medium">{formatNaira(calculateTax())}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-300 pt-2">
                        <div className="flex justify-between">
                          <span className="text-lg font-bold text-gray-900">Total:</span>
                          <span className="text-lg font-bold text-amber-800">{formatNaira(calculateTotal())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {invoiceData.notes && (
                  <div className="mb-8">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Notes:</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{invoiceData.notes}</p>
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-6 border-t border-gray-200 text-center">
                  <p className="text-gray-500 text-xs">Thank you for choosing Glam Up With Feyi!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
