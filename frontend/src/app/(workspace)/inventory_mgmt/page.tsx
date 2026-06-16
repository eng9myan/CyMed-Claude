"use client";
import { useState } from "react";
import { Package, AlertTriangle, TrendingDown, ArrowRightLeft, Scan, Loader2 } from "lucide-react";
import { useERP, inventory } from "@/lib/erp";

interface Product {
  id: number;
  name: string;
  default_code?: string;
  qty_available: number;
  list_price: number;
  standard_price: number;
  categ_id?: [number, string];
  uom_id?: [number, string];
}

interface StockMove {
  id: number;
  product_id: [number, string];
  product_uom_qty: number;
  location_id: [number, string];
  location_dest_id: [number, string];
  date: string;
  state: string;
}

const TABS = ["Stock Levels", "Movements", "Alerts"];

const STATE_COLORS: Record<string, string> = {
  ok: "bg-emerald-900/50 text-emerald-400",
  low: "bg-amber-900/50 text-amber-400",
  stockout: "bg-red-900/50 text-red-400",
};

const MOVE_COLORS: Record<string, string> = {
  done: "text-emerald-400",
  assigned: "text-blue-400",
  draft: "text-slate-400",
};

const LOW_STOCK_THRESHOLD = 100;

export default function InventoryPage() {
  const [tab, setTab] = useState(0);

  const products = useERP<Product[]>(() => inventory.products());
  const moves = useERP<StockMove[]>(() => inventory.stockMoves());

  const totalSKUs = products.data?.length ?? 0;
  const stockouts = (products.data ?? []).filter(p => p.qty_available === 0).length;
  const lowStock = (products.data ?? []).filter(p => p.qty_available > 0 && p.qty_available < LOW_STOCK_THRESHOLD).length;
  const totalValue = (products.data ?? []).reduce((s, p) => s + (p.qty_available * (p.standard_price || p.list_price || 0)), 0);

  const KPIS = [
    { label: "Total SKUs", value: String(totalSKUs), sub: "Active items", icon: Package, color: "from-blue-500 to-indigo-600" },
    { label: "Low Stock", value: String(lowStock), sub: "Below reorder point", icon: AlertTriangle, color: "from-amber-500 to-orange-600" },
    { label: "Stockouts", value: String(stockouts), sub: "Out of stock", icon: TrendingDown, color: "from-red-500 to-rose-600" },
    { label: "Inventory Value", value: `SAR ${(totalValue / 1e6).toFixed(1)}M`, sub: "At cost", icon: Scan, color: "from-emerald-500 to-teal-600" },
  ];

  const statusOf = (qty: number) => qty === 0 ? "stockout" : qty < LOW_STOCK_THRESHOLD ? "low" : "ok";

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
            <p className="text-slate-400 text-sm mt-1">Stock Levels · Movements · Alerts · FEFO Tracking</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <ArrowRightLeft className="w-4 h-4" /> Record Movement
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map((k) => (
            <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}>
                <k.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{k.value}</div>
              <div className="text-xs text-slate-400 mt-1">{k.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === i ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Current Stock</div>
            {products.isLoading ? <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div> : (
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                  <tr><th className="text-left p-3">SKU</th><th className="text-left p-3">Item</th><th className="text-left p-3">Category</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Cost</th><th className="text-left p-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(products.data ?? []).map((p) => {
                    const status = statusOf(p.qty_available);
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-xs text-slate-400">{p.default_code ?? `#${p.id}`}</td>
                        <td className="p-3 text-white">{p.name}</td>
                        <td className="p-3 text-slate-400 text-xs">{p.categ_id?.[1] ?? "—"}</td>
                        <td className="p-3 text-right">
                          <span className={`font-bold ${p.qty_available === 0 ? "text-red-400" : p.qty_available < LOW_STOCK_THRESHOLD ? "text-amber-400" : "text-white"}`}>
                            {p.qty_available}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">{p.uom_id?.[1] ?? ""}</span>
                        </td>
                        <td className="p-3 text-right text-slate-400 text-xs">SAR {(p.standard_price || 0).toLocaleString()}</td>
                        <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${STATE_COLORS[status]}`}>{status}</span></td>
                      </tr>
                    );
                  })}
                  {(products.data ?? []).length === 0 && <tr><td colSpan={6} className="p-12 text-center text-slate-500">No products yet</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Recent Movements</div>
            {moves.isLoading ? <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div> : (
              <div className="divide-y divide-slate-800">
                {(moves.data ?? []).map((m) => (
                  <div key={m.id} className="p-4 flex items-center gap-4">
                    <span className={`text-xs font-bold uppercase w-20 ${MOVE_COLORS[m.state] ?? "text-slate-400"}`}>{m.state}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium">{m.product_id[1]}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{m.location_id[1]} → {m.location_dest_id[1]}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{m.product_uom_qty} units</div>
                      <div className="text-xs text-slate-500">{m.date?.split(' ')[0]}</div>
                    </div>
                  </div>
                ))}
                {(moves.data ?? []).length === 0 && <div className="p-12 text-center text-slate-500">No movements yet</div>}
              </div>
            )}
          </div>
        )}

        {tab === 2 && (
          <div className="space-y-3">
            {(products.data ?? []).filter(p => p.qty_available < LOW_STOCK_THRESHOLD).map((p) => (
              <div key={p.id} className={`bg-slate-900 border rounded-xl p-4 flex items-center justify-between ${
                p.qty_available === 0 ? "border-red-500/50" : "border-amber-500/30"
              }`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${p.qty_available === 0 ? "text-red-400" : "text-amber-400"}`} />
                  <div>
                    <div className="font-medium text-white">{p.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.default_code ?? `#${p.id}`} · Current: {p.qty_available}</div>
                  </div>
                </div>
                <button className="text-xs px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 border border-orange-500/30 rounded-lg">Auto-Requisition</button>
              </div>
            ))}
            {(products.data ?? []).filter(p => p.qty_available < LOW_STOCK_THRESHOLD).length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
                <Package className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
                <div className="text-slate-400">All stock levels healthy</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
