"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { dispenseMedication } from "@/services/pharmacyService";

export default function DispenseQueue({ orders }: { orders: any[] }) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dispenseQty, setDispenseQty] = useState("");
  const [isControlled, setIsControlled] = useState(false);
  const [verifiedBy, setVerifiedBy] = useState("");

  const handleDispense = async () => {
    if (!selectedOrder || !dispenseQty) return;
    if (isControlled && !verifiedBy) {
      alert("Must provide secondary verification ID for controlled substances.");
      return;
    }
    try {
      await dispenseMedication(selectedOrder.id, parseFloat(dispenseQty), isControlled, verifiedBy);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to dispense medication");
    }
  };

  const activeOrders = orders.filter(o => o.status === "ACTIVE");

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medication</TableHead>
            <TableHead>Dosage</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeOrders.length > 0 ? activeOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.medication_name}</TableCell>
              <TableCell>{order.dose} {order.route}</TableCell>
              <TableCell>{order.frequency}</TableCell>
              <TableCell>{order.duration_days} days</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>Verify</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Clinical Verification: {order.medication_name}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">Perform clinical checks, interactions, and contraindications before dispensing.</p>
                        <Button className="w-full" onClick={async () => {
                          const { verifyPrescription } = await import("@/services/pharmacyService");
                          await verifyPrescription(order.id, "Verified safe to dispense", "VERIFIED");
                          window.location.reload();
                        }}>Approve & Verify</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" onClick={() => setSelectedOrder(order)}>Dispense</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Dispense {order.medication_name}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Quantity to Dispense</label>
                          <Input 
                            type="number"
                            placeholder="Enter quantity" 
                            value={dispenseQty} 
                            onChange={(e) => setDispenseQty(e.target.value)} 
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="controlled" className="rounded" checked={isControlled} onChange={(e) => setIsControlled(e.target.checked)} />
                          <label htmlFor="controlled" className="text-sm font-medium text-red-500">Is Controlled Substance?</label>
                        </div>
                        {isControlled && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Secondary Pharmacist ID</label>
                            <Input 
                              placeholder="Enter verifying pharmacist ID" 
                              value={verifiedBy} 
                              onChange={(e) => setVerifiedBy(e.target.value)} 
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleDispense}>Confirm Dispense</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                No active medication orders.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
