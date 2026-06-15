"use client";

import { useState } from "react";
import { Activity, Calendar, FileText, Pill, LogOut, Search, User, Clock, Video } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState("overview");

  // Simulated portal data for the logged-in patient
  const patientData = {
     name: "John Doe",
     dob: "1985-04-12",
     mrn: "MRN-5541-899",
     provider: "Dr. Gregory House",
     upcoming_appointments: [
        { date: "Oct 24, 2026", time: "10:30 AM", dept: "Cardiology Follow-up" }
     ],
     recent_labs: [
        { test: "Complete Blood Count (CBC)", date: "Oct 01, 2026", result: "Normal" },
        { test: "Lipid Panel", date: "Oct 01, 2026", result: "Elevated LDL" }
     ],
     prescriptions: [
        { med: "Atorvastatin 20mg", sig: "Take one tablet daily at bedtime", refills: 2 },
        { med: "Lisinopril 10mg", sig: "Take one tablet daily in the morning", refills: 1 }
     ]
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Portal Header */}
      <header className="bg-emerald-600 text-white shadow-md sticky top-0 z-50">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Image src="/cymed_logo_variants.svg" alt="CyMed Logo" width={32} height={32} className="filter brightness-0 invert" />
               <h1 className="text-xl font-bold tracking-wide">CyMed Portal</h1>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-sm font-medium hidden sm:block">Welcome, {patientData.name}</span>
               <div className="h-8 w-8 bg-emerald-700 rounded-full flex items-center justify-center border border-emerald-400">
                  <User className="h-4 w-4" />
               </div>
               <Link href="/login" className="text-emerald-100 hover:text-white transition">
                  <LogOut className="h-5 w-5" />
               </Link>
            </div>
         </div>
      </header>

      {/* Portal Navigation */}
      <div className="bg-white border-b border-gray-200">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
               {['overview', 'appointments', 'labs', 'medications'].map((tab) => (
                  <button 
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                        activeTab === tab 
                           ? 'border-emerald-500 text-emerald-600' 
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                     }`}
                  >
                     {tab}
                  </button>
               ))}
            </nav>
         </div>
      </div>

      {/* Portal Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {activeTab === 'overview' && (
            <div className="space-y-6">
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900">{patientData.name}</h2>
                     <p className="text-gray-500">DOB: {patientData.dob} | MRN: <span className="font-mono">{patientData.mrn}</span></p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-100">
                     Primary Care: {patientData.provider}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Appointments Summary */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                           <Calendar className="h-5 w-5 text-emerald-500"/> Upcoming Appointments
                        </h3>
                        <div className="flex gap-2">
                           <Link href="/portal/telehealth" className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition animate-pulse">
                              <Video className="h-3 w-3"/> Join Telehealth Call
                           </Link>
                           <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Schedule New</button>
                        </div>
                     </div>
                     <div className="p-6">
                        {patientData.upcoming_appointments.map((apt, i) => (
                           <div key={i} className="flex gap-4 p-4 border border-emerald-100 rounded-xl bg-emerald-50/30">
                              <div className="bg-emerald-100 text-emerald-700 rounded-lg p-3 text-center min-w-[70px]">
                                 <div className="text-xs font-bold uppercase">{apt.date.split(' ')[0]}</div>
                                 <div className="text-xl font-black">{apt.date.split(' ')[1].replace(',','')}</div>
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-900 text-lg">{apt.dept}</h4>
                                 <p className="text-gray-600 text-sm flex items-center gap-1"><Clock className="h-3 w-3"/> {apt.time}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Active Prescriptions Summary */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                           <Pill className="h-5 w-5 text-emerald-500"/> Active Prescriptions
                        </h3>
                     </div>
                     <div className="divide-y divide-gray-100">
                        {patientData.prescriptions.map((rx, i) => (
                           <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                              <div>
                                 <h4 className="font-bold text-gray-900">{rx.med}</h4>
                                 <p className="text-gray-500 text-xs mt-1">{rx.sig}</p>
                              </div>
                              <button className="text-xs font-bold bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition">
                                 Refill
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Recent Labs Summary */}
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                     <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-500"/> Test Results
                     </h3>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                           <tr>
                              <th className="px-6 py-3">Date</th>
                              <th className="px-6 py-3">Test Name</th>
                              <th className="px-6 py-3">Result Status</th>
                              <th className="px-6 py-3 text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {patientData.recent_labs.map((lab, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition">
                                 <td className="px-6 py-4 text-gray-600">{lab.date}</td>
                                 <td className="px-6 py-4 font-semibold text-gray-900">{lab.test}</td>
                                 <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                       lab.result === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                       {lab.result}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <button className="text-emerald-600 font-semibold text-xs hover:text-emerald-800 flex items-center justify-end gap-1 w-full">
                                       <FileText className="h-3 w-3" /> View PDF
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}

         {activeTab !== 'overview' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
               <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-slate-400" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">Extended Feature</h3>
               <p className="text-gray-500">The detailed {activeTab} view is part of the next scheduled release update.</p>
            </div>
         )}
      </main>
    </div>
  );
}
