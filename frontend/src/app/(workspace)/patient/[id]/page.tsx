"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User, Calendar, Activity, FileText, Plus, Heart, Droplet, Thermometer, ShieldAlert, ArrowLeft, Pill, BrainCircuit, Stethoscope, Video } from "lucide-react";
import Link from "next/link";
import { OrderLabModal } from "@/components/modals/OrderLabModal";
import { OrderPrescriptionModal } from "@/components/modals/OrderPrescriptionModal";
import { AddDiagnosisModal } from "@/components/modals/AddDiagnosisModal";

export default function PatientEHRPage() {
  const params = useParams();
  const id = params.id as string;
  const [patient, setPatient] = useState<any>(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [vitals, setVitals] = useState({ heart_rate: 72, blood_pressure: "120/80", temperature: 98.6, spo2: 99 });

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/patient/globalpatients/${id}`)
      .then(res => res.json())
      .then(data => setPatient(data))
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`http://localhost:8000/api/v1/interop/iot/stream/${id}`)
        .then(res => res.json())
        .then(data => setVitals(data))
        .catch(console.error);
    }, 2000);
    return () => clearInterval(interval);
  }, [id]);

  const handleDiagnosisAdded = async (diagnosis: any) => {
    setIsDiagnosisModalOpen(false);
    setIsAiLoading(true);
    
    try {
      const response = await fetch("http://localhost:8000/api/v1/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icd11_code: diagnosis.code,
          diagnosis_name: diagnosis.display_name
        })
      });
      const data = await response.json();
      setAiInsight(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!patient) {
    return <div className="p-10 text-center text-gray-500">Loading Patient EHR...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/doctor" className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{patient.first_name} {patient.last_name}</h1>
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-0.5 rounded uppercase">{patient.gender}</span>
              <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-0.5 rounded font-mono border border-gray-200">{patient.mrn || `MRN-${patient.id.substring(0,6)}`}</span>
            </div>
            <p className="text-gray-500 text-sm">DOB: {patient.date_of_birth} | Contact: {patient.phone_number}</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setIsRxModalOpen(true)}
             className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
           >
             <Pill className="h-4 w-4" /> Prescribe Rx
           </button>
           <button 
             onClick={() => setIsLabModalOpen(true)}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
           >
             <Activity className="h-4 w-4" /> Order Lab
           </button>
           <button 
             onClick={() => setIsDiagnosisModalOpen(true)}
             className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
           >
             <Plus className="h-4 w-4" /> Add Encounter
           </button>
           <Link 
             href={`/telehealth/${id}`}
             className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
           >
             <Video className="h-4 w-4" /> Telehealth
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Vitals & Alerts */}
        <div className="space-y-6">
          {/* Active Alerts */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-5">
            <h3 className="text-red-800 font-bold text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
              <ShieldAlert className="h-4 w-4" /> Clinical Alerts
            </h3>
            <ul className="space-y-2">
              <li className="bg-white border border-red-200 p-3 rounded-lg flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-sm font-semibold text-gray-800">Allergic to Penicillin</span>
              </li>
              <li className="bg-white border border-red-200 p-3 rounded-lg flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <span className="text-sm font-semibold text-gray-800">History of Hypertension</span>
              </li>
            </ul>
          </div>

          {/* Vitals Snapshot */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
               Live ICU Vitals Stream
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                    <Heart className="h-3 w-3 text-red-500 animate-pulse" /> Heart Rate
                  </div>
                  <div className="text-xl font-bold text-gray-900 transition-all duration-500">{vitals.heart_rate} <span className="text-sm font-normal text-gray-500">bpm</span></div>
               </div>
               <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                    <Activity className="h-3 w-3 text-blue-500" /> BP
                  </div>
                  <div className="text-xl font-bold text-gray-900 transition-all duration-500">{vitals.blood_pressure} <span className="text-sm font-normal text-gray-500">mmHg</span></div>
               </div>
               <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                    <Thermometer className="h-3 w-3 text-orange-500" /> Temp
                  </div>
                  <div className="text-xl font-bold text-gray-900 transition-all duration-500">{vitals.temperature} <span className="text-sm font-normal text-gray-500">°F</span></div>
               </div>
               <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                    <Droplet className="h-3 w-3 text-cyan-500" /> SpO2
                  </div>
                  <div className="text-xl font-bold text-gray-900 transition-all duration-500">{vitals.spo2} <span className="text-sm font-normal text-gray-500">%</span></div>
               </div>
            </div>
          </div>

          {/* AI Clinical Decision Support */}
          {(aiInsight || isAiLoading) && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-indigo-800 font-bold text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
                <BrainCircuit className="h-4 w-4" /> AI Copilot Insight
              </h3>
              
              {isAiLoading ? (
                <div className="flex items-center gap-3 text-indigo-600 font-medium text-sm p-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  Generating clinical protocol...
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-gray-900">{aiInsight.summary}</p>
                  
                  <div>
                     <p className="text-xs font-bold text-indigo-500 uppercase mb-1">Recommended Protocol</p>
                     <ul className="list-disc pl-4 space-y-1">
                       {aiInsight.protocol.map((p: string, i: number) => (
                         <li key={i} className="text-sm text-gray-700">{p}</li>
                       ))}
                     </ul>
                  </div>

                  <div>
                     <p className="text-xs font-bold text-red-500 uppercase mb-1 flex items-center gap-1">
                       <ShieldAlert className="h-3 w-3"/> Contraindications
                     </p>
                     <ul className="list-disc pl-4 space-y-1">
                       {aiInsight.contraindications.map((c: string, i: number) => (
                         <li key={i} className="text-sm text-red-700">{c}</li>
                       ))}
                     </ul>
                  </div>

                  <div className="pt-3 border-t border-indigo-100 flex justify-between items-center">
                    <span className="text-xs font-medium text-indigo-600">Specialists: {aiInsight.recommended_specialists.join(', ')}</span>
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Risk Score: {aiInsight.risk_score}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Timeline / History */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-full flex flex-col">
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 rounded-t-xl flex justify-between items-center">
              <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" /> Clinical Timeline
              </h3>
              <select className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none">
                <option>All Encounters</option>
                <option>Labs Only</option>
                <option>Prescriptions</option>
              </select>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
               {aiInsight && (
                 <div className="relative pl-6 border-l-2 border-purple-100">
                    <div className="absolute w-3 h-3 bg-purple-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    <p className="text-xs font-bold text-purple-600 mb-1">Just Now</p>
                    <div className="bg-gradient-to-r from-purple-50 to-white rounded-lg p-4 border border-purple-100">
                       <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                         <Stethoscope className="h-4 w-4 text-purple-600" /> New Diagnosis Recorded
                       </h4>
                       <p className="text-sm text-gray-600 mb-2">{aiInsight.summary}</p>
                    </div>
                 </div>
               )}

               {/* Timeline Item 1 */}
               <div className="relative pl-6 border-l-2 border-teal-100">
                  <div className="absolute w-3 h-3 bg-teal-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                  <p className="text-xs font-bold text-teal-600 mb-1">Today, 09:30 AM</p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                     <h4 className="font-bold text-gray-900 mb-1">Patient Admission (General Ward)</h4>
                     <p className="text-sm text-gray-600 mb-3">Patient admitted for observation following mild chest discomfort. Vitals stable.</p>
                     <div className="flex gap-2">
                        <span className="inline-flex items-center gap-1 bg-white border border-gray-200 text-xs px-2 py-1 rounded text-gray-600"><User className="h-3 w-3"/> Dr. Smith</span>
                     </div>
                  </div>
               </div>

               {/* Timeline Item 2 */}
               <div className="relative pl-6 border-l-2 border-indigo-100">
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                  <p className="text-xs font-bold text-indigo-600 mb-1">Yesterday, 14:15 PM</p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                     <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">Lab Results Available <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded uppercase">Normal</span></h4>
                     <p className="text-sm text-gray-600 mb-3">Comprehensive Metabolic Panel (CMP) results returned. All values within normal reference ranges.</p>
                     <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><FileText className="h-3 w-3"/> View Report</button>
                  </div>
               </div>
            </div>
          </div>
        </div>

      </div>

      <OrderLabModal 
        isOpen={isLabModalOpen} 
        onClose={() => setIsLabModalOpen(false)} 
        onSuccess={() => alert('Lab Order placed successfully!')}
        patientId={id}
      />
      <OrderPrescriptionModal 
        isOpen={isRxModalOpen} 
        onClose={() => setIsRxModalOpen(false)} 
        onSuccess={() => alert('Prescription sent to pharmacy successfully!')}
        patientId={id}
      />
      <AddDiagnosisModal
        isOpen={isDiagnosisModalOpen}
        onClose={() => setIsDiagnosisModalOpen(false)}
        onSuccess={handleDiagnosisAdded}
        patientId={id}
      />
    </div>
  );
}
