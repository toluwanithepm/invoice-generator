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
    notes: "", // Notes field already exists in state
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
      console.log("[v0] Starting PNG export using direct canvas drawing...")

      if (!invoiceRef.current) {
        alert("Invoice preview not found")
        return
      }

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Set canvas size for high quality
      canvas.width = 800
      canvas.height = 1100

      drawInvoiceOnCanvas(ctx, canvas.width, canvas.height)

      // Convert to PNG and download
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.download = `Glam-Up-With-Feyi-Invoice-${invoiceData.invoiceNumber}.png`
            link.href = url
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            console.log("[v0] PNG export completed successfully")
          }
        },
        "image/png",
        1.0,
      )
    } catch (err) {
      console.error("[v0] PNG export error:", err)
      alert(`PNG export failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const exportToPDF = () => {
    try {
      console.log("[v0] Starting PDF export with exact preview styling...")

      // Create a new window with the invoice content
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        alert("Please allow popups to export PDF")
        return
      }

      const invoiceContent = invoiceRef.current?.innerHTML || ""

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.5; 
              color: #111827;
              background: white;
              font-size: 14px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
            @page { 
              margin: 0.75in; 
              size: A4;
            }
            
            /* Exact styling to match web preview */
            .p-6 { padding: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mt-12 { margin-top: 3rem; }
            .pt-6 { padding-top: 1.5rem; }
            .pt-2 { padding-top: 0.5rem; }
            .p-4 { padding: 1rem; }
            
            /* Layout */
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .gap-2 { gap: 0.5rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            
            /* Typography */
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-base { font-size: 1rem; line-height: 1.5rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            
            /* Colors - exact matches */
            h1 { color: #78350f !important; }
            h2 { color: #78350f !important; }
            .text-gray-900 { color: #111827; }
            .text-gray-700 { color: #374151; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-500 { color: #6b7280; }
            
            /* Backgrounds and borders */
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-white { background-color: white; }
            .rounded-lg { border-radius: 0.5rem; }
            .border { border: 1px solid #e5e7eb; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            .border-gray-100 { border-color: #f3f4f6; }
            .border-gray-200 { border-color: #e5e7eb; }
            .border-gray-300 { border-color: #d1d5db; }
            
            /* Invoice specific styling */
            [style*="background-color: rgb(254, 243, 199)"] { 
              background-color: #fef3c7 !important; 
            }
            [style*="border-color: rgb(252, 211, 77)"] { 
              border-color: #fcd34d !important; 
            }
            [style*="color: rgb(120, 53, 15)"] { 
              color: #78350f !important; 
            }
            [style*="color: rgb(146, 64, 14)"] { 
              color: #92400e !important; 
            }
            
            /* Table styling */
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 1.5rem;
            }
            th, td { 
              padding: 0.75rem; 
              text-align: left; 
              border-bottom: 1px solid #f3f4f6; 
              vertical-align: top;
            }
            th { 
              font-weight: 600; 
              color: #374151; 
            }
            tbody tr:nth-child(odd) {
              border-bottom: 1px solid #f3f4f6;
            }
            
            /* Max width for totals */
            .max-w-xs { max-width: 20rem; }
            .w-full { width: 100%; }
            
            /* Icons - hide in print */
            svg { display: none; }
            
            /* Whitespace handling */
            .whitespace-pre-wrap { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="p-6 bg-white">
            ${invoiceContent}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 500);
            }
          </script>
        </body>
        </html>
      `)

      printWindow.document.close()
      console.log("[v0] PDF export initiated with exact preview styling")
    } catch (err) {
      console.error("[v0] PDF export error:", err)
      alert(`PDF export failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const drawInvoiceOnCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Fill white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    let y = 40
    const leftMargin = 40
    const rightMargin = width - 40
    const contentWidth = rightMargin - leftMargin

    // Header section - business name on left, invoice box on right
    ctx.fillStyle = "#78350f"
    ctx.font = "bold 28px Arial"
    ctx.fillText("Glam Up With Feyi", leftMargin, y)

    // Invoice box on the right (matching web preview)
    const boxWidth = 200
    const boxHeight = 80
    const boxX = rightMargin - boxWidth
    const boxY = y - 25

    // Draw invoice box background
    ctx.fillStyle = "#fef3c7"
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

    // Draw invoice box border
    ctx.strokeStyle = "#fcd34d"
    ctx.lineWidth = 1
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

    // Invoice text in box
    ctx.fillStyle = "#78350f"
    ctx.font = "bold 18px Arial"
    ctx.textAlign = "center"
    ctx.fillText("INVOICE", boxX + boxWidth / 2, boxY + 25)

    ctx.fillStyle = "#92400e"
    ctx.font = "bold 16px Arial"
    ctx.fillText(`#${invoiceData.invoiceNumber}`, boxX + boxWidth / 2, boxY + 50)

    ctx.textAlign = "left"
    y += 50

    // Business subtitle
    ctx.fillStyle = "#4b5563"
    ctx.font = "16px Arial"
    ctx.fillText("Professional Makeup & Beauty Services", leftMargin, y)
    y += 30

    // Contact info
    ctx.font = "12px Arial"
    ctx.fillText(`📧 ${businessInfo.email}`, leftMargin, y)
    y += 18
    ctx.fillText(`📱 ${businessInfo.phone}`, leftMargin, y)
    y += 18
    ctx.fillText(`📷 ${businessInfo.instagram}`, leftMargin, y)
    y += 40

    // Invoice dates on the right
    ctx.font = "12px Arial"
    ctx.fillStyle = "#4b5563"
    ctx.textAlign = "right"
    ctx.fillText(`Date: ${invoiceData.date}`, rightMargin, y - 20)
    ctx.fillText(`Due: ${invoiceData.dueDate}`, rightMargin, y)
    ctx.textAlign = "left"
    y += 30

    // Client info section (if exists)
    if (invoiceData.client.name || invoiceData.client.email || invoiceData.client.phone || invoiceData.client.address) {
      ctx.fillStyle = "#111827"
      ctx.font = "bold 14px Arial"
      ctx.fillText("Bill To:", leftMargin, y)
      y += 20

      // Client info box background
      const clientBoxHeight = 80
      ctx.fillStyle = "#f9fafb"
      ctx.fillRect(leftMargin, y, contentWidth, clientBoxHeight)

      // Client info text
      ctx.fillStyle = "#111827"
      ctx.font = "12px Arial"
      let clientY = y + 15

      if (invoiceData.client.name) {
        ctx.font = "bold 12px Arial"
        ctx.fillText(invoiceData.client.name, leftMargin + 15, clientY)
        clientY += 15
        ctx.font = "12px Arial"
      }
      if (invoiceData.client.email) {
        ctx.fillStyle = "#4b5563"
        ctx.fillText(invoiceData.client.email, leftMargin + 15, clientY)
        clientY += 15
      }
      if (invoiceData.client.phone) {
        ctx.fillText(invoiceData.client.phone, leftMargin + 15, clientY)
        clientY += 15
      }
      if (invoiceData.client.address) {
        ctx.fillText(invoiceData.client.address, leftMargin + 15, clientY)
      }

      y += clientBoxHeight + 30
    }

    // Services section
    ctx.fillStyle = "#111827"
    ctx.font = "bold 14px Arial"
    ctx.fillText("Services", leftMargin, y)
    y += 30

    // Table header
    ctx.fillStyle = "#f9fafb"
    ctx.fillRect(leftMargin, y, contentWidth, 30)

    ctx.fillStyle = "#374151"
    ctx.font = "bold 12px Arial"
    ctx.fillText("Description", leftMargin + 10, y + 20)
    ctx.textAlign = "center"
    ctx.fillText("Qty", leftMargin + contentWidth * 0.65, y + 20)
    ctx.textAlign = "right"
    ctx.fillText("Price", leftMargin + contentWidth * 0.8, y + 20)
    ctx.fillText("Total", rightMargin - 10, y + 20)
    ctx.textAlign = "left"
    y += 30

    // Table border
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    ctx.strokeRect(leftMargin, y - 30, contentWidth, 30)

    // Services items
    ctx.font = "12px Arial"
    invoiceData.items.forEach((item, index) => {
      if (item.description) {
        // Alternating row background
        if (index % 2 === 1) {
          ctx.fillStyle = "#f9fafb"
          ctx.fillRect(leftMargin, y, contentWidth, 25)
        }

        ctx.fillStyle = "#111827"
        ctx.fillText(item.description, leftMargin + 10, y + 18)

        ctx.fillStyle = "#4b5563"
        ctx.textAlign = "center"
        ctx.fillText(item.quantity.toString(), leftMargin + contentWidth * 0.65, y + 18)

        ctx.textAlign = "right"
        ctx.fillText(formatNaira(item.price), leftMargin + contentWidth * 0.8, y + 18)

        ctx.fillStyle = "#111827"
        ctx.font = "bold 12px Arial"
        ctx.fillText(formatNaira(item.quantity * item.price), rightMargin - 10, y + 18)

        ctx.font = "12px Arial"
        ctx.textAlign = "left"

        // Row border
        ctx.strokeStyle = "#f3f4f6"
        ctx.strokeRect(leftMargin, y, contentWidth, 25)

        y += 25
      }
    })

    y += 30

    // Totals section (matching web preview layout)
    const totalsBoxWidth = 250
    const totalsBoxX = rightMargin - totalsBoxWidth
    const totalsBoxHeight = 80

    // Totals box background
    ctx.fillStyle = "#f9fafb"
    ctx.fillRect(totalsBoxX, y, totalsBoxWidth, totalsBoxHeight)

    // Totals content
    ctx.fillStyle = "#374151"
    ctx.font = "12px Arial"
    ctx.fillText("Subtotal:", totalsBoxX + 15, y + 20)
    ctx.textAlign = "right"
    ctx.fillText(formatNaira(calculateSubtotal()), rightMargin - 15, y + 20)

    // Total line
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(totalsBoxX + 15, y + 35)
    ctx.lineTo(rightMargin - 15, y + 35)
    ctx.stroke()

    ctx.textAlign = "left"
    ctx.fillStyle = "#111827"
    ctx.font = "bold 16px Arial"
    ctx.fillText("Total:", totalsBoxX + 15, y + 55)

    ctx.textAlign = "right"
    ctx.fillStyle = "#92400e"
    ctx.fillText(formatNaira(calculateTotal()), rightMargin - 15, y + 55)
    ctx.textAlign = "left"

    y += totalsBoxHeight + 40

    // Notes section (if exists)
    if (invoiceData.notes) {
      ctx.fillStyle = "#111827"
      ctx.font = "bold 14px Arial"
      ctx.fillText("Notes:", leftMargin, y)
      y += 25

      // Notes box background
      const notesHeight = 60
      ctx.fillStyle = "#f9fafb"
      ctx.fillRect(leftMargin, y, contentWidth, notesHeight)

      // Notes text with word wrapping
      ctx.fillStyle = "#374151"
      ctx.font = "12px Arial"
      const words = invoiceData.notes.split(" ")
      let line = ""
      let notesY = y + 20
      const maxWidth = contentWidth - 30

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " "
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, leftMargin + 15, notesY)
          line = words[n] + " "
          notesY += 15
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, leftMargin + 15, notesY)
      y += notesHeight + 30
    }

    // Footer
    y = height - 40
    ctx.fillStyle = "#6b7280"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Thank you for choosing Glam Up With Feyi!", width / 2, y)
    ctx.textAlign = "left"
  }

  const regenerateInvoiceNumber = () => setInvoiceData((prev) => ({ ...prev, invoiceNumber: generateInvoiceNumber() }))

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2" style={{ color: "#78350f" }}>
            Glam Up With Feyi
          </h1>
          <p className="text-gray-600 text-lg">Invoice Generator</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Invoice Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create Invoice</h2>
              <div className="h-1 w-20 rounded" style={{ backgroundColor: "#92400e" }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => updateInvoiceData("invoiceNumber", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                    style={{ "--tw-ring-color": "#f59e0b", color: "#92400e" } as any}
                  />
                  <button
                    onClick={regenerateInvoiceNumber}
                    title="Generate new invoice number"
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    style={{ "--tw-border-color": "#92400e" } as any}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                  style={{ "--tw-ring-color": "#f59e0b", "--tw-border-color": "#f59e0b" } as any}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                  style={{ "--tw-ring-color": "#f59e0b", "--tw-border-color": "#f59e0b" } as any}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                    style={{ "--tw-ring-color": "#f59e0b", "--tw-border-color": "#f59e0b" } as any}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                    style={{ "--tw-ring-color": "#f59e0b", "--tw-border-color": "#f59e0b" } as any}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                    style={{ "--tw-ring-color": "#f59e0b", "--tw-border-color": "#f59e0b" } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={invoiceData.client.address}
                    onChange={(e) => updateClient("address", e.target.value)}
                    placeholder="Client address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                    style={{ "--tw-ring-color": "#f59e0b", "--tw-border-color": "#f59e0b" } as any}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Services & Items</h3>
                <button
                  onClick={addItem}
                  className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                  style={{ backgroundColor: "#92400e" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#78350f")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#92400e")}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                          style={{ "--tw-ring-color": "#f59e0b", "--tw-border-color": "#f59e0b" } as any}
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                            style={{ "--tw-ring-color": "#f59e0b", "--tw-border-color": "#f59e0b" } as any}
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                            style={{ "--tw-ring-color": "#f59e0b", "--tw-border-color": "#f59e0b" } as any}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 resize-none"
                  style={{ "--tw-ring-color": "#f59e0b", "--tw-border-color": "#f59e0b" } as any}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={exportToPDF}
                className="text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors"
                style={{ backgroundColor: "#92400e" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#78350f")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#92400e")}
              >
                <FileText className="w-4 h-4" /> Export as PDF
              </button>
              <button
                onClick={exportToPNG}
                className="border-2 px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors"
                style={{ borderColor: "#92400e", color: "#92400e" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef3c7")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
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
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: "#78350f" }}>
                      Glam Up With Feyi
                    </h1>
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

                  <div className="text-right">
                    <div
                      className="border rounded-lg p-4 mb-4"
                      style={{ backgroundColor: "#fef3c7", borderColor: "#fcd34d" }}
                    >
                      <h2 className="text-2xl font-bold mb-1" style={{ color: "#78350f" }}>
                        INVOICE
                      </h2>
                      <p className="text-xl font-bold" style={{ color: "#92400e" }}>
                        #{invoiceData.invoiceNumber}
                      </p>
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
                          <span className="text-lg font-bold" style={{ color: "#92400e" }}>
                            {formatNaira(calculateTotal())}
                          </span>
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
