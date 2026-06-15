"use client";
import { PlaceholderModule } from "@/components/erp/PlaceholderModule";
export default function Page() {
  return <PlaceholderModule title="Coupons & Promotions" subtitle="Discount codes · Loyalty tiers · Campaign-linked · Expiry tracking" sections={[
    "Coupon code generator", "Fixed amount / % discount", "Min purchase threshold", "Per-customer usage limit",
    "Corporate package pricing", "Loyalty tier discounts", "Campaign-linked coupons", "Redemption analytics",
  ]}/>;
}
