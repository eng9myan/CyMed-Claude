import { useState } from "react";
import { X, Pill, FileText, AlertCircle } from "lucide-react";

export function OrderPrescriptionModal({ isOpen, onClose, onSuccess, patientId }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, patientId: string }) {
  const [medicationName, setMedicationName] = useState("Amoxicillin 500mg");
  const [route, setRoute] = useState("ORAL");
  const [frequency, setFrequency] = useState("TID"); // Three times a day
  const [quantity, setQuantity] = useState("30");
  const [isControlled, setIsControlled] = useState(false);
  const [instructions, setInstructions] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/pharmacy/medicationorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          encounter_id: null,
          ordering_provider_id: "00000000-0000-0000-0000-000000000000",
          medication_name: medicationName,
          route: route,
          frequency: frequency,
          status: "ACTIVE", // Active means ordered/pending in this context
          is_controlled: isControlled,
          special_instructions: instructions,
          order_date: new Date().toISOString()
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
        // Reset form
        setMedicationName("Amoxicillin 500mg");
        setRoute("ORAL");
        setFrequency("TID");
        setQuantity("30");
        setIsControlled(false);
        setInstructions("");
      } else {
        const err = await res.json();
        console.error("Failed to order prescription:", err);
        alert("Failed to create prescription. See console for details.");
      }
    } catch (error) {
      console.error("Error submitting prescription order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 my-8">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-sky-100 text-sky-600 p-2 rounded-lg">
              <Pill className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Prescribe Medication</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Medication & Strength</label>
              <input 
                type="text" 
                value={medicationName} 
                onChange={e => setMedicationName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                required
                placeholder="e.g. Lisinopril 10mg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Route</label>
                <select 
                  value={route} 
                  onChange={e => setRoute(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                >
                  <option value="ORAL">Oral</option>
                  <option value="IV">Intravenous (IV)</option>
                  <option value="IM">Intramuscular (IM)</option>
                  <option value="TOPICAL">Topical</option>
                  <option value="SUBCUTANEOUS">Subcutaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Frequency</label>
                <select 
                  value={frequency} 
                  onChange={e => setFrequency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                >
                  <option value="QD">QD (Once a day)</option>
                  <option value="BID">BID (Twice a day)</option>
                  <option value="TID">TID (Three times a day)</option>
                  <option value="QID">QID (Four times a day)</option>
                  <option value="PRN">PRN (As needed)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="controlled"
                checked={isControlled}
                onChange={e => setIsControlled(e.target.checked)}
                className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
              />
              <label htmlFor="controlled" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Controlled Substance <AlertCircle className="h-3 w-3 text-red-500" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-2">
                <FileText className="h-3 w-3" /> Special Instructions / Sig
              </label>
              <textarea 
                value={instructions} 
                onChange={e => setInstructions(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Take with food, avoid alcohol..."
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
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? "Sending to Pharmacy..." : "Send Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
