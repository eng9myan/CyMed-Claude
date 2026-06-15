import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Stethoscope, X } from "lucide-react";
import { ICD11Search } from "../clinical/ICD11Search";

export function AddDiagnosisModal({ isOpen, onClose, onSuccess, patientId }: { isOpen: boolean, onClose: () => void, onSuccess: (diagnosis: any) => void, patientId: string }) {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiagnosis) return;
    
    // Simulating API POST request to save the diagnosis
    console.log("Saving Dual-Coded Diagnosis", selectedDiagnosis);
    
    // Mock success
    setTimeout(() => {
      onSuccess(selectedDiagnosis);
      setSelectedDiagnosis(null);
    }, 500);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 flex items-center gap-2">
                    <Stethoscope className="h-6 w-6 text-blue-600" />
                    Record Clinical Diagnosis
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4 h-80">
                    <label className="block text-sm font-semibold text-gray-700">Search WHO ICD-11 Database</label>
                    <ICD11Search onSelect={(diag) => setSelectedDiagnosis(diag)} />

                    {selectedDiagnosis && (
                      <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                        <h4 className="font-bold text-gray-900 mb-4 border-b border-blue-200 pb-2">Selected Diagnosis (Dual-Coded)</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ICD-11 (Clinical)</p>
                              <p className="text-lg font-bold text-blue-700">{selectedDiagnosis.code}</p>
                              <p className="text-sm text-gray-800 font-medium">{selectedDiagnosis.display_name}</p>
                           </div>
                           <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ICD-10 (Billing Crosswalk)</p>
                              <p className="text-lg font-bold text-orange-600">{selectedDiagnosis.icd10_crosswalk}</p>
                              <p className="text-sm text-gray-800 font-medium">Mapped for backward compatibility</p>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button type="button" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" disabled={!selectedDiagnosis} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      Save to Patient Record
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
