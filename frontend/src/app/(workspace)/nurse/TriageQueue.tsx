"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { triagePatient } from "@/services/encounterService";

export default function TriageQueue({ encounters }: { encounters: any[] }) {
  const [selectedEncounter, setSelectedEncounter] = useState<any>(null);
  const [vitals, setVitals] = useState({
    temperature: 98.6,
    heart_rate: 80,
    systolic_bp: 120,
    diastolic_bp: 80
  });

  const handleTriage = async () => {
    if (!selectedEncounter) return;
    try {
      await triagePatient(selectedEncounter.id, vitals);
      window.location.reload(); // Refresh the server component
    } catch (e) {
      console.error(e);
      alert("Failed to triage");
    }
  };

  const waitingEncounters = encounters.filter(e => e.status === "ARRIVED");

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>MRN</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {waitingEncounters.length > 0 ? waitingEncounters.map((enc) => (
            <TableRow key={enc.id}>
              <TableCell className="font-medium">
                {enc.patient.first_name} {enc.patient.last_name}
              </TableCell>
              <TableCell>{enc.patient.mrn}</TableCell>
              <TableCell><span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">{enc.status}</span></TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedEncounter(enc)}>Start Triage</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Triage Patient</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm font-medium">Temp (F)</label>
                        <Input type="number" className="col-span-3" value={vitals.temperature} onChange={(e) => setVitals({...vitals, temperature: parseFloat(e.target.value)})} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm font-medium">Heart Rate</label>
                        <Input type="number" className="col-span-3" value={vitals.heart_rate} onChange={(e) => setVitals({...vitals, heart_rate: parseInt(e.target.value)})} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm font-medium">BP Sys</label>
                        <Input type="number" className="col-span-3" value={vitals.systolic_bp} onChange={(e) => setVitals({...vitals, systolic_bp: parseInt(e.target.value)})} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm font-medium">BP Dia</label>
                        <Input type="number" className="col-span-3" value={vitals.diastolic_bp} onChange={(e) => setVitals({...vitals, diastolic_bp: parseInt(e.target.value)})} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleTriage}>Complete Triage</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                No patients waiting in queue.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
