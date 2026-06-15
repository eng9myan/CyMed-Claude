"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function RadQueue({ orders }: { orders: any[] }) {
  const [scheduledTime, setScheduledTime] = useState("");
  const [dicomUid, setDicomUid] = useState("");
  const [findings, setFindings] = useState("");
  const [impression, setImpression] = useState("");

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Modality</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id.split('-')[0]}</TableCell>
              <TableCell>{order.modality}</TableCell>
              <TableCell>{order.reason_for_exam}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {order.status === "ORDERED" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Schedule</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule Imaging</DialogTitle>
                        </DialogHeader>
                        <Input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
                        <Button onClick={async () => {
                          const { scheduleImaging } = await import("@/services/radService");
                          await scheduleImaging(order.id, scheduledTime);
                          window.location.reload();
                        }}>Confirm Schedule</Button>
                      </DialogContent>
                    </Dialog>
                  )}
                  {order.status === "SCHEDULED" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default" size="sm">Perform Study</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Perform Study & Push to PACS</DialogTitle>
                        </DialogHeader>
                        <Input placeholder="Enter Generated DICOM Study UID" value={dicomUid} onChange={e => setDicomUid(e.target.value)} />
                        <Button onClick={async () => {
                          const { completeImaging } = await import("@/services/radService");
                          await completeImaging(order.id, dicomUid || `1.2.840.113619.2.55.1.${Math.floor(Math.random()*100000)}`);
                          window.location.reload();
                        }}>Complete Study</Button>
                      </DialogContent>
                    </Dialog>
                  )}
                  {order.status === "INTERPRETATION" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" size="sm">Read & Interpret</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Radiologist Dictation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Findings</label>
                            <Textarea rows={4} value={findings} onChange={e => setFindings(e.target.value)} />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Impression</label>
                            <Textarea rows={2} value={impression} onChange={e => setImpression(e.target.value)} />
                          </div>
                        </div>
                        <Button onClick={async () => {
                          const { submitInterpretation } = await import("@/services/radService");
                          await submitInterpretation(order.id, findings, impression);
                          window.location.reload();
                        }}>Sign Report</Button>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                No active imaging orders.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
