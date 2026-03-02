const DB_NAME = "glamup-invoice-history"
const STORE = "invoices"
const VERSION = 1

export type HistoryEntry = {
  id: number
  invoiceNumber: string
  clientName: string
  date: string
  dueDate: string
  total: number
  exportedAt: number
  fileType: "pdf" | "png"
  fileBlob: Blob
  invoiceDataJson: string
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveInvoice(entry: Omit<HistoryEntry, "id">): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const req = db.transaction(STORE, "readwrite").objectStore(STORE).add(entry)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function getAllInvoices(): Promise<HistoryEntry[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll()
    req.onsuccess = () => resolve([...(req.result as HistoryEntry[])].reverse())
    req.onerror = () => reject(req.error)
  })
}

export async function deleteInvoice(id: number): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const req = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}
