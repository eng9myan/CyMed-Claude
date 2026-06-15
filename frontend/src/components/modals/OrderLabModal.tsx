import { useState } from "react";
import { X, Beaker, FileText, Activity } from "lucide-react";

export function OrderLabModal({ isOpen, onClose, onSuccess, patientId }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, patientId: string }) {
  const [panelName, setPanelName] = useState("Complete Blood Count (CBC)");
  const [priority, setPriority] = useState("ROUTINE");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/lab/laborders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          encounter_id: null,
          ordering_physician_id: "00000000-0000-0000-0000-000000000000",
          panel_name: panelName,
          priority: priority,
          clinical_notes: notes,
          status: "ORDERED",
          order_date: new Date().toISOString()
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setPanelName("Complete Blood Count (CBC)");
        setPriority("ROUTINE");
        setNotes("");
      } else {
        const err = await res.json();
        console.error("Failed to order lab:", err);
        alert("Failed to create lab order. See console for details.");
      }
    } catch (error) {
      console.error("Error submitting lab order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-teal-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
              <Beaker className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Order Lab Test</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Activity className="h-3 w-3" /> Panel / Test Name
              </label>
              <select 
                value={panelName} 
                onChange={e => setPanelName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                <option value="Comprehensive Metabolic Panel (CMP)">Comprehensive Metabolic Panel (CMP)</option>
                <option value="Lipid Panel">Lipid Panel</option>
                <option value="Thyroid Stimulating Hormone (TSH)">Thyroid Stimulating Hormone (TSH)</option>
                <option value="Urinalysis">Urinalysis</option>
                <option value="Hemoglobin A1C">Hemoglobin A1C</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Priority</label>
              <select 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="STAT">STAT (Immediate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-2">
                <FileText className="h-3 w-3" /> Clinical Notes / Reason
              </label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Include any specific instructions or diagnostic codes..."
              />
            </div>

          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
