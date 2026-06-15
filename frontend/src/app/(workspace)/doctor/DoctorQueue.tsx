"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { consultPatient } from "@/services/encounterService";

export default function DoctorQueue({ encounters }: { encounters: any[] }) {
  const [selectedEncounter, setSelectedEncounter] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [diagnosisName, setDiagnosisName] = useState("");
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [labName, setLabName] = useState("");
  const [radModality, setRadModality] = useState("");
  
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<string[]>([]);
  const [radOrders, setRadOrders] = useState<string[]>([]);

  const handleAddDiagnosis = () => {
    if (diagnosisName) {
      setDiagnoses([...diagnoses, { name: diagnosisName }]);
      setDiagnosisName("");
    }
  }

  const handleAddMedication = () => {
    if (medName) {
      setMedications([...medications, { 
        name: medName, 
        dosage: medDosage || "As directed", 
        route: "PO", 
        frequency: "QD" 
      }]);
      setMedName("");
      setMedDosage("");
    }
  }

  const handleAddLab = () => {
    if (labName) {
      setLabOrders([...labOrders, labName]);
      setLabName("");
    }
  }

  const handleAddRad = () => {
    if (radModality) {
      setRadOrders([...radOrders, radModality]);
      setRadModality("");
    }
  }

  const handleConsultComplete = async () => {
    if (!selectedEncounter) return;
    try {
      await consultPatient(selectedEncounter.id, {
        notes,
        diagnoses,
        medications,
        lab_orders: labOrders,
        radiology_orders: radOrders
      });
      window.location.reload(); // Refresh the server component
    } catch (e) {
      console.error(e);
      alert("Failed to complete consult");
    }
  };

  const activeEncounters = encounters.filter(e => e.status === "TRIAGED" || e.status === "IN_PROGRESS");

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
          {activeEncounters.length > 0 ? activeEncounters.map((enc) => (
            <TableRow key={enc.id}>
              <TableCell className="font-medium">
                {enc.patient.first_name} {enc.patient.last_name}
              </TableCell>
              <TableCell>{enc.patient.mrn}</TableCell>
              <TableCell><span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{enc.status}</span></TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedEncounter(enc)}>Start Consult</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Consultation: {enc.patient.first_name} {enc.patient.last_name}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-4">
                      {/* Clinical Notes */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Clinical Notes</label>
                        <Textarea 
                          placeholder="Subjective, Objective, Assessment, Plan..." 
                          value={notes} 
                          onChange={(e) => setNotes(e.target.value)} 
                          rows={4}
                        />
                      </div>
                      
                      {/* Diagnoses */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Diagnoses</label>
                        <div className="flex gap-2">
                          <Input placeholder="Enter diagnosis (e.g. Hypertension)" value={diagnosisName} onChange={(e) => setDiagnosisName(e.target.value)} />
                          <Button onClick={handleAddDiagnosis} variant="secondary">Add</Button>
                        </div>
                        {diagnoses.length > 0 && (
                          <ul className="list-disc pl-5 text-sm mt-2">
                            {diagnoses.map((d, i) => <li key={i}>{d.name}</li>)}
                          </ul>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Lab Orders */}
                        <div className="space-y-2 border p-3 rounded">
                          <label className="text-sm font-medium">Lab Orders</label>
                          <div className="flex gap-2">
                            <Input placeholder="e.g. CBC Panel" value={labName} onChange={(e) => setLabName(e.target.value)} />
                            <Button onClick={handleAddLab} variant="secondary">Add</Button>
                          </div>
                          {labOrders.length > 0 && (
                            <ul className="list-disc pl-5 text-sm mt-2">
                              {labOrders.map((l, i) => <li key={i}>{l}</li>)}
                            </ul>
                          )}
                        </div>

                        {/* Radiology Orders */}
                        <div className="space-y-2 border p-3 rounded">
                          <label className="text-sm font-medium">Imaging Orders</label>
                          <div className="flex gap-2">
                            <Input placeholder="e.g. Chest X-Ray" value={radModality} onChange={(e) => setRadModality(e.target.value)} />
                            <Button onClick={handleAddRad} variant="secondary">Add</Button>
                          </div>
                          {radOrders.length > 0 && (
                            <ul className="list-disc pl-5 text-sm mt-2">
                              {radOrders.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Medications */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Prescribe Medications</label>
                        <div className="flex gap-2">
                          <Input placeholder="Medication Name" className="flex-1" value={medName} onChange={(e) => setMedName(e.target.value)} />
                          <Input placeholder="Dosage" className="w-24" value={medDosage} onChange={(e) => setMedDosage(e.target.value)} />
                          <Button onClick={handleAddMedication} variant="secondary">Add</Button>
                        </div>
                        {medications.length > 0 && (
                          <ul className="list-disc pl-5 text-sm mt-2">
                            {medications.map((m, i) => <li key={i}>{m.name} - {m.dosage}</li>)}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleConsultComplete}>Complete & Sign</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                No patients waiting for consultation.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
