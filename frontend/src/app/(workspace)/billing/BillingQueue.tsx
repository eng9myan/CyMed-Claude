"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { finalizeInvoice, dischargePatient } from "@/services/billingService";

export default function BillingQueue({ invoices }: { invoices: any[] }) {

  const handleDischarge = async (invoice: any) => {
    try {
      await finalizeInvoice(invoice.id);
      if (invoice.encounter_id) {
        await dischargePatient(invoice.encounter_id);
      }
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to finalize and discharge");
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length > 0 ? invoices.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell className="font-medium">{inv.invoice_number}</TableCell>
              <TableCell>{new Date(inv.issue_date).toLocaleDateString()}</TableCell>
              <TableCell>${inv.total_amount.toFixed(2)}</TableCell>
              <TableCell><span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">{inv.status}</span></TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Review & Discharge</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Invoice Details: {inv.invoice_number}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inv.servicecharge_set?.map((charge: any) => (
                            <TableRow key={charge.id}>
                              <TableCell>{charge.service_code}</TableCell>
                              <TableCell>{charge.description}</TableCell>
                              <TableCell>{charge.quantity}</TableCell>
                              <TableCell>${charge.unit_price.toFixed(2)}</TableCell>
                              <TableCell>${charge.total_amount.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={4} className="text-right font-bold">Total Due:</TableCell>
                            <TableCell className="font-bold border-t-2 border-black">${inv.total_amount.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {}}>Print Invoice</Button>
                      <Button onClick={() => handleDischarge(inv)}>Finalize & Discharge</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                No active invoices pending discharge.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
