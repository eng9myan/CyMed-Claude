"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Video, Mic, MicOff, VideoOff, PhoneOff, User, Activity, FileText } from "lucide-react";
import Link from "next/link";

export default function DoctorTelehealthRoom() {
  const params = useParams();
  const id = params.id as string;
  const [patient, setPatient] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/patient/globalpatients/${id}`)
      .then(res => res.json())
      .then(data => setPatient(data))
      .catch(console.error);
      
    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [id]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!patient) return <div className="p-10 text-center text-gray-500">Connecting to secure room...</div>;

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4 bg-gray-900 p-4 -m-8">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col bg-black rounded-2xl overflow-hidden relative border border-gray-800">
         {/* Patient Video (Mock) */}
         <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
           <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-600">
                 <User className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">{patient.first_name} {patient.last_name}</h2>
              <p className="text-gray-400">Patient Camera Feed Simulated</p>
           </div>
         </div>
         
         {/* Doctor Picture-in-Picture (Mock) */}
         <div className="absolute top-4 right-4 w-64 h-48 bg-gray-700 rounded-xl border-2 border-gray-600 overflow-hidden flex items-center justify-center shadow-2xl">
           <div className="text-center">
              <User className="h-10 w-10 text-gray-500 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Your Camera</p>
           </div>
           {isVideoOff && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-red-500" />
              </div>
           )}
         </div>

         {/* Call Controls */}
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 backdrop-blur-md px-8 py-4 rounded-full border border-gray-700">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-4 rounded-full transition ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </button>
            <Link 
              href={`/patient/${id}`}
              className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
            >
              <PhoneOff className="h-6 w-6" />
            </Link>
         </div>

         {/* Top Bar Info */}
         <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
            <div className="flex items-center gap-3">
               <span className="flex h-3 w-3 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
               <span className="text-white font-mono font-bold">{formatTime(callDuration)}</span>
            </div>
            <div className="bg-gray-800/80 backdrop-blur px-3 py-1.5 rounded text-xs font-bold text-gray-300 border border-gray-700">
               End-to-End Encrypted
            </div>
         </div>
      </div>

      {/* Right Side Panel - Quick Clinical View */}
      <div className="w-96 bg-gray-800 rounded-2xl flex flex-col overflow-hidden border border-gray-700">
         <div className="p-5 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white mb-1">Clinical Context</h3>
            <p className="text-sm text-gray-400">{patient.first_name} {patient.last_name} • {patient.gender}</p>
         </div>
         
         <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div>
               <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                 <FileText className="h-4 w-4" /> Chief Complaint
               </h4>
               <p className="text-sm text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-700">
                  Patient reports recurring headaches and mild dizziness over the last 48 hours. Requested telehealth follow-up instead of in-person visit.
               </p>
            </div>
            
            <div>
               <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                 <Activity className="h-4 w-4" /> Latest Vitals (Self-Reported)
               </h4>
               <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                     <p className="text-[10px] uppercase text-gray-500 mb-1">Blood Pressure</p>
                     <p className="text-lg font-bold text-white">128/82</p>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                     <p className="text-[10px] uppercase text-gray-500 mb-1">Temperature</p>
                     <p className="text-lg font-bold text-white">99.1°F</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
