"use client";
import { PlaceholderModule } from "@/components/erp/PlaceholderModule";
export default function Page() {
  return <PlaceholderModule title="Shifts & Rota" subtitle="Auto-roster · Night shift differentials · Coverage requirements · Swap requests" sections={[
    "Weekly / monthly roster builder", "Skill-based auto-assignment", "Ward minimum staffing rules", "Shift swap marketplace",
    "Night/weekend differential calc", "On-call schedule", "Coverage gap alerts", "Mobile shift confirmation",
  ]}/>;
}
