"use client";
import { PlaceholderModule } from "@/components/erp/PlaceholderModule";
export default function Page() {
  return <PlaceholderModule title="Performance Management" subtitle="Annual reviews · 360 feedback · Goals (OKR/KPI) · Competencies · PIP" sections={[
    "Annual review cycle", "360-degree feedback", "Goals & OKRs", "Competency framework", "Performance ratings", "Calibration sessions",
    "Promotion recommendations", "Performance Improvement Plan (PIP)", "Talent matrix (9-box)",
  ]}/>;
}
