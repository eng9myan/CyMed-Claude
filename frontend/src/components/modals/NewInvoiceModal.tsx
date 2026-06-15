"use client";

import { useState } from "react";
import { X, Receipt } from "lucide-react";

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewInvoiceModal({ isOpen, onClose, onSuccess }: NewInvoiceModalProps) {
  const [formData, setFormData] = useState({
    invoice_number: `INV-${Math.floor(Math.random() * 100000)}`,
    total_amount: 100,
    amount_paid: 0,
    status: "DRAFT"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/v1/billing/invoices/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem('cymed_access_token')}`
        },
        body: JSON.stringify({
            ...formData,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0] // 14 days later
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create invoice");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-amber-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-bold">
            <Receipt className="h-5 w-5" /> Create Invoice
          </div>
          <button onClick={onClose} className="text-amber-100 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Invoice Number</label>
            <input 
              type="text" 
              readOnly 
              className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-500 outline-none" 
              value={formData.invoice_number}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Total Amount ($)</label>
              <input 
                type="number" 
                required 
                min="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none" 
                value={formData.total_amount}
                onChange={e => setFormData({...formData, total_amount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Amount Paid ($)</label>
              <input 
                type="number" 
                required 
                min="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none" 
                value={formData.amount_paid}
                onChange={e => setFormData({...formData, amount_paid: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
            <select 
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="DRAFT">Draft</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PAID">Fully Paid</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? "Processing..." : "Generate Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
