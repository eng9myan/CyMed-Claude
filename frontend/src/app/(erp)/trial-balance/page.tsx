"use client";
import { PlaceholderModule } from "@/components/erp/PlaceholderModule";
export default function Page() {
  return <PlaceholderModule title="Trial Balance" subtitle="Period trial balance · Cumulative · Adjusted · Pre-close validation" sections={[
    "Period trial balance", "Cumulative YTD", "Pre-close validation", "Adjustment entries", "Drill-down to GL detail",
    "Cross-period comparison", "Cost center filtering", "Export to Excel / PDF",
  ]}/>;
}
