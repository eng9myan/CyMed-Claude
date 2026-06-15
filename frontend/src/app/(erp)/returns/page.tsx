"use client";
import { PlaceholderModule } from "@/components/erp/PlaceholderModule";
export default function Page() {
  return <PlaceholderModule title="Returns Management" subtitle="Sales returns · Purchase returns · Credit/debit notes · Reverse logistics" sections={[
    "Customer sales return (RMA)", "Vendor purchase return", "Quality inspection", "Credit note generation",
    "Debit note to vendor", "Stock reversal", "Refund processing", "Return reason analytics",
  ]}/>;
}
