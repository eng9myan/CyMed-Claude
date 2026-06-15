"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react";

export default function InvoiceList({ invoices }: { invoices: any[] }) {
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-emerald-500/10 text-emerald-500";
      case "ISSUED": return "bg-amber-500/10 text-amber-500";
      case "PARTIAL": return "bg-blue-500/10 text-blue-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Balance Due</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.length > 0 ? invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell className="font-medium">{inv.invoice_number}</TableCell>
            <TableCell>{inv.issue_date || "Today"}</TableCell>
            <TableCell>${inv.total_amount.toFixed(2)}</TableCell>
            <TableCell>${(inv.total_amount - inv.amount_paid).toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant="outline" className={getStatusColor(inv.status)}>{inv.status}</Badge>
            </TableCell>
            <TableCell>
              {(inv.status === "ISSUED" || inv.status === "PARTIAL") && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Record Payment</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Process Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Amount to Pay</label>
                        <Input 
                          type="number" 
                          value={paymentAmount || (inv.total_amount - inv.amount_paid)} 
                          onChange={e => setPaymentAmount(parseFloat(e.target.value))} 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Payment Method</label>
                        <Select value={paymentMethod} onValueChange={(val) => val && setPaymentMethod(val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="INSURANCE">Insurance Claim</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={async () => {
                        const { payInvoice } = await import("@/services/billingService");
                        const amt = paymentAmount || (inv.total_amount - inv.amount_paid);
                        await payInvoice(inv.id, amt, paymentMethod);
                        window.location.reload();
                      }}>Submit Payment</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
              No invoices found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
