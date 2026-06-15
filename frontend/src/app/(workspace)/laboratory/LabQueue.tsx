"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { submitLabResults } from "@/services/labService";

export default function LabQueue({ orders }: { orders: any[] }) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [results, setResults] = useState<any[]>([
    { test_name: "WBC", value: "", unit: "x10^9/L", reference_range: "4.5-11.0", flag: "NORMAL" },
    { test_name: "RBC", value: "", unit: "x10^12/L", reference_range: "4.5-5.9", flag: "NORMAL" },
    { test_name: "Hemoglobin", value: "", unit: "g/dL", reference_range: "13.5-17.5", flag: "NORMAL" }
  ]);

  const handleResultChange = (index: number, field: string, value: string) => {
    const newResults = [...results];
    newResults[index][field] = value;
    setResults(newResults);
  };

  const handleSubmitResults = async () => {
    if (!selectedOrder) return;
    try {
      await submitLabResults(selectedOrder.id, results.filter(r => r.value));
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to submit results");
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id.split('-')[0]}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.priority}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {order.status === "ORDERED" && (
                    <Button variant="outline" size="sm" onClick={async () => {
                      const barcode = prompt("Scan or enter specimen barcode:");
                      if (barcode) {
                        const { collectSample } = await import("@/services/labService");
                        await collectSample(order.id, "BLOOD", barcode);
                        window.location.reload();
                      }
                    }}>Collect Specimen</Button>
                  )}
                  {order.status === "COLLECTED" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default" size="sm" onClick={() => setSelectedOrder(order)}>Enter Results</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Enter Lab Results</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          {results.map((res, idx) => (
                            <div key={idx} className="grid grid-cols-4 gap-4 items-center border-b pb-2">
                              <div className="font-medium">{res.test_name}</div>
                              <Input 
                                placeholder="Value" 
                                value={res.value} 
                                onChange={(e) => handleResultChange(idx, 'value', e.target.value)} 
                              />
                              <div className="text-sm text-muted-foreground">{res.unit}</div>
                              <div className="text-sm text-muted-foreground">Ref: {res.reference_range}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={handleSubmitResults}>Submit for Validation</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {order.status === "VALIDATION" && (
                    <Button variant="secondary" size="sm" onClick={async () => {
                      const { validateLabResults } = await import("@/services/labService");
                      await validateLabResults(order.id);
                      window.location.reload();
                    }}>Clinical Validation</Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                No active lab orders.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
