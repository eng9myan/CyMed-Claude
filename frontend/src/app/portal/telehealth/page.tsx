"use client";

import { useState, useEffect } from "react";
import { Video, Mic, MicOff, VideoOff, PhoneOff, User, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PatientTelehealthRoom() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col bg-gray-900 rounded-3xl overflow-hidden relative shadow-2xl border border-gray-800">
       {/* Doctor Video (Mock) */}
       <div className="absolute inset-0 flex items-center justify-center bg-black">
         <div className="text-center">
            <div className="w-48 h-48 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-gray-700 shadow-xl">
               <User className="h-24 w-24 text-gray-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Dr. Sarah Smith</h2>
            <p className="text-gray-400 text-lg flex items-center justify-center gap-2">
               <ShieldCheck className="h-5 w-5 text-green-500" /> CyMed Secure Connection
            </p>
         </div>
       </div>
       
       {/* Patient Picture-in-Picture (Mock) */}
       <div className="absolute top-6 right-6 w-48 h-72 bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden flex items-center justify-center shadow-2xl">
         <div className="text-center">
            <User className="h-12 w-12 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">You</p>
         </div>
         {isVideoOff && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <VideoOff className="h-10 w-10 text-red-500" />
            </div>
         )}
       </div>

       {/* Top Info Bar */}
       <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">General Consultation</h3>
            <div className="flex items-center gap-3">
               <span className="flex h-3 w-3 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
               </span>
               <span className="text-gray-300 font-mono font-medium">{formatTime(callDuration)}</span>
            </div>
          </div>
       </div>

       {/* Call Controls */}
       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur-xl px-10 py-5 rounded-full border border-gray-800 shadow-2xl">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-5 rounded-full transition shadow-lg ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            {isMuted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
          </button>
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-5 rounded-full transition shadow-lg ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            {isVideoOff ? <VideoOff className="h-7 w-7" /> : <Video className="h-7 w-7" />}
          </button>
          <Link 
            href={`/portal`}
            className="p-5 rounded-full bg-red-600 text-white hover:bg-red-700 transition shadow-lg shadow-red-900/50"
          >
            <PhoneOff className="h-7 w-7" />
          </Link>
       </div>
    </div>
  );
}
