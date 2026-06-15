"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function BedBoard({ beds, admissions }: { beds: any[], admissions: any[] }) {
  const [selectedPatient, setSelectedPatient] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "OCCUPIED": return "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20";
      case "CLEANING": return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      case "MAINTENANCE": return "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {beds.map((bed) => {
        const admission = admissions.find((a: any) => a.bed_id === bed.id);

        return (
          <Card key={bed.id} className={`border-l-4 ${bed.status === 'AVAILABLE' ? 'border-l-emerald-500' : bed.status === 'OCCUPIED' ? 'border-l-rose-500' : 'border-l-amber-500'}`}>
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{bed.bed_number}</CardTitle>
                <Badge variant="outline" className={getStatusColor(bed.status)}>{bed.status}</Badge>
              </div>
              <CardDescription>{bed.ward_name}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {bed.status === 'AVAILABLE' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full text-xs mt-2" size="sm">Admit Patient</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Admit to {bed.bed_number}</DialogTitle>
                    </DialogHeader>
                    <Input placeholder="Enter Patient UUID" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} />
                    <Button onClick={async () => {
                      const { admitPatient } = await import("@/services/admissionService");
                      await admitPatient(selectedPatient, "00000000-0000-0000-0000-000000000000", bed.id); // Dummy provider ID
                      window.location.reload();
                    }}>Confirm Admission</Button>
                  </DialogContent>
                </Dialog>
              )}

              {bed.status === 'OCCUPIED' && admission && (
                <div className="mt-2 text-sm text-muted-foreground flex flex-col gap-2">
                  <div className="font-medium text-foreground text-xs truncate">Pt ID: {admission.patient_id.split('-')[0]}</div>
                  <Button variant="outline" className="w-full text-xs" size="sm" onClick={async () => {
                    const { dischargePatient } = await import("@/services/admissionService");
                    await dischargePatient(admission.id);
                    window.location.reload();
                  }}>Discharge</Button>
                </div>
              )}

              {bed.status === 'CLEANING' && (
                <Button variant="outline" className="w-full text-xs mt-2" size="sm" onClick={async () => {
                    const { cleanBed } = await import("@/services/bedService");
                    await cleanBed(bed.id);
                    window.location.reload();
                  }}>Mark Clean</Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
