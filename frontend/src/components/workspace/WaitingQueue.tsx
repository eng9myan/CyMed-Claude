"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function WaitingQueue({ statusFilter, title, description }: { statusFilter: string, title: string, description: string }) {
  const [encounters, setEncounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app this would call an API like `/api/patients/encounters?status=${statusFilter}`
    // For now we simulate an API call
    setTimeout(() => {
      setEncounters([
        { id: "e-1", mrn: "MRN-10001", patient_name: "John Doe", status: statusFilter, created_at: "10:00 AM", priority: "NORMAL" },
        { id: "e-2", mrn: "MRN-10002", patient_name: "Jane Smith", status: statusFilter, created_at: "10:15 AM", priority: "URGENT" }
      ]);
      setLoading(false);
    }, 1000);
  }, [statusFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading queue...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>MRN</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encounters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">No patients in queue.</TableCell>
                </TableRow>
              ) : (
                encounters.map(enc => (
                  <TableRow key={enc.id}>
                    <TableCell>{enc.created_at}</TableCell>
                    <TableCell className="font-medium">{enc.mrn}</TableCell>
                    <TableCell>{enc.patient_name}</TableCell>
                    <TableCell>
                      <Badge variant={enc.priority === "URGENT" ? "destructive" : "secondary"}>
                        {enc.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{enc.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <button className="text-sm font-medium text-primary hover:underline">
                        Process
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
