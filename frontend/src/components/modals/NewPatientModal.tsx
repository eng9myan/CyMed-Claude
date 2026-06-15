"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewPatientModal({ isOpen, onClose, onSuccess }: NewPatientModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "M",
    mrn: `MRN-${Math.floor(Math.random() * 100000)}`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/v1/patient/globalpatients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem('cymed_access_token')}` // Uncomment if endpoint requires auth
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to create patient");
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
        <div className="bg-teal-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-bold">
            <UserPlus className="h-5 w-5" /> Add New Patient
          </div>
          <button onClick={onClose} className="text-teal-100 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">First Name</label>
              <input 
                type="text" 
                required 
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Last Name</label>
              <input 
                type="text" 
                required 
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Date of Birth</label>
            <input 
              type="date" 
              required 
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
              value={formData.date_of_birth}
              onChange={e => setFormData({...formData, date_of_birth: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Gender</label>
            <select 
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value})}
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
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
              className="px-6 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : "Save Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
