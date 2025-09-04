"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Trash2, FileText, ImageIcon, Calendar, User, Mail, Phone, Instagram } from "lucide-react"

type Item = { description: string; quantity: number; price: number }

const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString().slice(-6)
  return `FS-${timestamp}`
}

const businessInfo = {
  name: "Glam Up With Feyi",
  email: "feyisaraabodunrin@gmail.com",
  phone: "+234 813 100 3292",
  instagram: "@feyi_shara_",
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
    notes: "",
    paymentTerms: "Payment due within 7 days",
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
      const html2canvas = (await import("html2canvas")).default
      if (!invoiceRef.current) {
        alert("Invoice preview not found")
        return
      }
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: true,
        foreignObjectRendering: true,
      })
      const link = document.createElement("a")
      link.download = `Glam-Tales-Invoice-${invoiceData.invoiceNumber}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (err) {
      console.error("PNG export error:", err)
      alert("PNG export failed. Please try again.")
    }
  }

  const exportToPDF = async () => {
    try {
      const jsPDFModule = await import("jspdf")
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default
      const pdf = new jsPDF("p", "mm", "a4")

      // Header
      pdf.setFontSize(28)
      pdf.setTextColor(101, 67, 33)
      pdf.text("Glam Tales", 20, 30)

      pdf.setFontSize(11)
      pdf.setTextColor(0, 0, 0)
      pdf.text("Professional Makeup & Beauty Services", 20, 40)

      // Business contact info
      pdf.setFontSize(9)
      pdf.setTextColor(107, 114, 128)
      pdf.text(`Email: ${businessInfo.email}`, 20, 50)
      pdf.text(`Phone: ${businessInfo.phone}`, 20, 56)
      pdf.text(`Instagram: ${businessInfo.instagram}`, 20, 62)

      // Invoice details
      pdf.setFontSize(18)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`Invoice #${invoiceData.invoiceNumber}`, 20, 80)

      pdf.setFontSize(10)
      pdf.setTextColor(107, 114, 128)
      pdf.text(`Date: ${invoiceData.date}`, 20, 90)
      pdf.text(`Due Date: ${invoiceData.dueDate}`, 20, 98)

      // Client info
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      pdf.text("Bill To:", 20, 118)
      pdf.setFontSize(10)
      let yPos = 128
      if (invoiceData.client.name) {
        pdf.text(invoiceData.client.name, 20, yPos)
        yPos += 8
      }
      if (invoiceData.client.email) {
        pdf.text(invoiceData.client.email, 20, yPos)
        yPos += 8
      }
      if (invoiceData.client.phone) {
        pdf.text(invoiceData.client.phone, 20, yPos)
        yPos += 8
      }
      if (invoiceData.client.address) {
        pdf.text(invoiceData.client.address, 20, yPos)
        yPos += 8
      }

      // Items
      yPos += 15
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      pdf.text("Services:", 20, yPos)
      yPos += 12

      pdf.setFontSize(10)
      invoiceData.items.forEach((item) => {
        if (item.description) {
          pdf.text(`${item.description} (Qty: ${item.quantity}) - ${formatNaira(item.quantity * item.price)}`, 20, yPos)
          yPos += 8
        }
      })

      // Totals
      yPos += 15
      pdf.text(`Subtotal: ${formatNaira(calculateSubtotal())}`, 20, yPos)
      yPos += 8
      if (invoiceData.taxRate > 0) {
        pdf.text(`Tax (${invoiceData.taxRate}%): ${formatNaira(calculateTax())}`, 20, yPos)
        yPos += 8
      }
      pdf.setFontSize(12)
      pdf.text(`Total: ${formatNaira(calculateTotal())}`, 20, yPos)

      pdf.save(`Glam-Tales-Invoice-${invoiceData.invoiceNumber}.pdf`)
    } catch (err) {
      alert("PDF export failed. Make sure jspdf is installed.")
    }
  }

  const regenerateInvoiceNumber = () => setInvoiceData((prev) => ({ ...prev, invoiceNumber: generateInvoiceNumber() }))

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-900 mb-2">Glam Tales</h1>
          <p className="text-gray-600 text-lg">Invoice Generator</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create Invoice</h2>
            <div className="h-1 w-20 bg-amber-800 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Invoice Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => updateInvoiceData("invoiceNumber", e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <button
                  onClick={regenerateInvoiceNumber}
                  title="Generate new invoice number"
                  className="px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ↻
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="inline w-4 h-4 mr-2" />
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceData.date}
                onChange={(e) => updateInvoiceData("date", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="inline w-4 h-4 mr-2" />
                Due Date
              </label>
              <input
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => updateInvoiceData("dueDate", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <User className="inline w-4 h-4 mr-2" />
                  Client Name
                </label>
                <input
                  type="text"
                  value={invoiceData.client.name}
                  onChange={(e) => updateClient("name", e.target.value)}
                  placeholder="Enter client name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={invoiceData.client.email}
                  onChange={(e) => updateClient("email", e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={invoiceData.client.phone}
                  onChange={(e) => updateClient("phone", e.target.value)}
                  placeholder="+234 xxx xxx xxxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Address</label>
                <input
                  type="text"
                  value={invoiceData.client.address}
                  onChange={(e) => updateClient("address", e.target.value)}
                  placeholder="Client address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Services & Items</h3>
              <button
                onClick={addItem}
                className="bg-amber-800 hover:bg-amber-900 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {invoiceData.items.map((item, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Service/Item Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="e.g., Bridal Makeup"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value || "1"))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Price (₦)</label>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={item.price}
                        onChange={(e) => updateItem(index, "price", Number.parseFloat(e.target.value || "0"))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="text-lg font-bold text-gray-900 px-4 py-3">
                        {formatNaira(item.quantity * item.price)}
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      {invoiceData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 p-3 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={exportToPDF}
              className="flex-1 bg-amber-800 hover:bg-amber-900 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 font-semibold transition-colors"
            >
              <FileText className="w-5 h-5" /> Export as PDF
            </button>
            <button
              onClick={exportToPNG}
              className="flex-1 border-2 border-amber-800 text-amber-800 hover:bg-amber-50 px-8 py-4 rounded-lg flex items-center justify-center gap-3 font-semibold transition-colors"
            >
              <ImageIcon className="w-5 h-5" /> Export as PNG
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-900 text-white px-8 py-6">
            <h2 className="text-2xl font-bold">Invoice Preview</h2>
            <p className="text-gray-300 mt-1">Preview your invoice before exporting</p>
          </div>

          <div ref={invoiceRef} className="p-10 bg-white">
            <div className="flex flex-col lg:flex-row justify-between items-start mb-12">
              <div className="mb-8 lg:mb-0">
                <h1 className="text-5xl font-bold text-amber-900 mb-4">Glam Up With Feyi</h1>
                <p className="text-xl text-gray-600 mb-4">Professional Makeup & Beauty Services</p>
                <div className="space-y-1 text-gray-500">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {businessInfo.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {businessInfo.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    {businessInfo.instagram}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <h2 className="text-3xl font-bold text-amber-900 mb-2">INVOICE</h2>
                  <p className="text-xl font-semibold text-gray-700">#{invoiceData.invoiceNumber}</p>
                </div>
                <div className="mt-6 space-y-2 text-sm text-gray-600">
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
              <div className="mb-12">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bill To:</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  {invoiceData.client.name && <p className="font-semibold text-gray-900">{invoiceData.client.name}</p>}
                  {invoiceData.client.email && <p className="text-gray-600">{invoiceData.client.email}</p>}
                  {invoiceData.client.phone && <p className="text-gray-600">{invoiceData.client.phone}</p>}
                  {invoiceData.client.address && <p className="text-gray-600">{invoiceData.client.address}</p>}
                </div>
              </div>
            )}

            <div className="mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Services</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-semibold text-gray-700">Description</th>
                      <th className="text-center py-3 font-semibold text-gray-700">Qty</th>
                      <th className="text-right py-3 font-semibold text-gray-700">Price</th>
                      <th className="text-right py-3 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map(
                      (item, index) =>
                        item.description && (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-4 text-gray-900">{item.description}</td>
                            <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                            <td className="py-4 text-right text-gray-600">{formatNaira(item.price)}</td>
                            <td className="py-4 text-right font-semibold text-gray-900">
                              {formatNaira(item.quantity * item.price)}
                            </td>
                          </tr>
                        ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mb-12">
              <div className="w-full lg:w-1/2 max-w-md">
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
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
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between">
                      <span className="text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-amber-800">{formatNaira(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-sm">Thank you for choosing Glam Up with Feyi!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
