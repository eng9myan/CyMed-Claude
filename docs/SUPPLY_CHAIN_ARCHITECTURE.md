# CyMed Healthcare Supply Chain — Architecture

## Strategy

CyMed leverages the rebranded **CyMed ERP engine** (forked from Odoo CE 19,
LGPL-compliant) for the proven, deeply tested supply chain primitives:

- `stock` — multi-location warehouse + lots + serials
- `purchase` + `purchase_requisition` — RFQ + tender + PO
- `mrp` + `mrp_subcontracting` — kit BOMs + outsourcing
- `stock_landed_costs` + `stock_dropshipping` — costing nuances
- `stock_picking_batch` — wave / batch picking
- `maintenance` — equipment lifecycle
- `barcodes` + `barcodes_gs1_nomenclature` — GS1 / GTIN / UDI
- `account` + `stock_account` — full inventory valuation in GL

On top, **CyMed-native modules** add the healthcare-specific layer that Odoo
deliberately does not ship:

| Module | Purpose | Key models |
|---|---|---|
| `cymed_pharmacy_supply` | Drug formulary, controlled substances, recalls, ward par-levels | `cymed.drug.formulary`, `cymed.controlled.substance.log`, `cymed.drug.recall`, `cymed.ward.par.level` |
| `cymed_surgical_supply` | Implants with UDI + patient traceability, surgical kits, sterilization | `cymed.implant`, `cymed.implant.placement`, `cymed.surgical.kit`, `cymed.sterilization.cycle` |
| `cymed_lab_supply` | Reagents tied to analyzers, QC materials, Westgard rules | `cymed.lab.reagent`, `cymed.lab.qc.run`, `cymed.lab.analyzer` |
| `cymed_quality` | Incoming inspection, CAPA, NCR, deviations — JCI-ready | `cymed.incoming.inspection`, `cymed.quality.capa`, `cymed.quality.ncr` |
| `cymed_cold_chain` | IoT-driven cold-zone monitoring + excursion handling | `cymed.cold.zone`, `cymed.cold.excursion` |
| `cymed_supply_dashboard` | Executive KPIs and vendor scorecards | `cymed.supply.kpi`, `cymed.vendor.scorecard` |

## Layered architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│  CyMed Next.js Frontend                                                   │
│  (preserved Cybercom UI — dark theme, orange accent)                      │
└─────────────┬──────────────────────────────┬──────────────────────────────┘
              │                              │
              │ JSON-RPC                     │ REST
              ▼                              ▼
┌──────────────────────────────────┐  ┌────────────────────────────────────┐
│  CyMed ERP Engine                 │  │  CyMed Clinical (Django)            │
│  • 50+ rebranded Odoo modules    │  │  • Patient, EMR, Pharmacy, Lab     │
│  • cymed_branding (white-label)   │  │  • Already exists                  │
│  • cymed_landing (marketing)      │  └────────────────────────────────────┘
│                                   │
│  ┌─ Supply chain CyMed extensions┐│
│  │  cymed_pharmacy_supply        ││
│  │  cymed_surgical_supply        ││
│  │  cymed_lab_supply             ││
│  │  cymed_quality                ││
│  │  cymed_cold_chain             ││
│  │  cymed_supply_dashboard       ││
│  │  cymed_implant_management     ││
│  │  cymed_controlled_substances  ││
│  └───────────────────────────────┘│
└────┬──────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PostgreSQL — single tenant database per facility/network                 │
│  Multi-company / multi-warehouse / multi-currency built into ERP engine   │
└──────────────────────────────────────────────────────────────────────────┘
```

## Why this design

1. **Don't rebuild solved problems.** Inventory, costing, FEFO, lot tracking,
   purchase workflows, GS1 barcoding are 20-year-mature in Odoo's stock /
   purchase / barcodes modules. Forking under LGPL is faster and safer than
   reimplementing.

2. **Build the differentiator.** Healthcare requires controlled-substance
   audit registers, implant-to-patient UDI traceability, reagent-to-analyzer
   ties, JCI-grade CAPA, and IoT cold-chain — all absent from Odoo. These
   are CyMed-native LGPL-3 code, full copyright CyMed.

3. **One database, one transaction.** A surgical implant placement creates:
   - stock.move (decrement OR cabinet)
   - cymed.implant.placement (patient permanent record)
   - cymed.procedure.consumption.line (cost & billing)
   - account.move via stock_account (GL posting)
   ...all in a single Postgres transaction. No bus, no integration broker.

## Healthcare item taxonomy

The `product.template` is extended with:

```python
is_drug              # routes to cymed_pharmacy_supply
is_controlled        # adds witness/biometric requirements
is_implant           # routes to cymed_surgical_supply
requires_lot         # forces lot creation on receipt
cold_chain_required  # routes to cymed_cold_chain monitoring
udi_code             # Medical Device UDI
gs1_gtin             # GS1 GTIN barcode
```

This taxonomy supports all the item types listed in the original spec:
Drug · Medical Consumable · Surgical Instrument · Surgical Kit · Implant ·
Laboratory Reagent · Laboratory Consumable · Radiology Consumable ·
Biomedical Equipment · Spare Part · Linen · Hospital Asset ·
Controlled Substance · Vaccination Inventory · Blood Bank Inventory ·
Organ Preservation Inventory.

## Workflows preserved from Odoo

| Workflow | Odoo module | CyMed enhancement |
|---|---|---|
| PR → RFQ → PO → GRN → Invoice | purchase + purchase_requisition | + `cymed.incoming.inspection` |
| Stock move (any) | stock | + quarantine flag for recalls |
| Manufacturing / Kits | mrp | + `cymed.kit.allocation` |
| Subcontracting (e.g., sterile pack reprocessing) | mrp_subcontracting | + sterilization cycle link |
| Landed costs | stock_landed_costs | direct use |
| Vendor management | purchase + base | + `cymed.vendor.scorecard` |
| Asset depreciation (CT/MRI) | account_asset (enterprise — replaced by Odoo's stock-side or by custom) | + AMC + calibration |
| Quality control | quality (enterprise — replaced by CyMed native) | full CyMed module |

## AI Forecasting hook

The `cymed.supply.kpi` snapshot is read by the `ai_platform` app (existing in
`cymed_python/`) which runs:

- Drug consumption forecasting (Prophet / ARIMA per drug × ward)
- Stockout prediction (Random Forest on lead time + usage volatility)
- Expiry prediction (linear regression on usage rate vs. shelf life)
- Vendor risk scoring (logistic regression on OTD + quality + financial)

Forecasts write back to `cymed.ward.par.level.daily_avg_usage` and
`cymed.ward.replenishment.run` as recommended quantities.

## REST API

Each CyMed extension module exposes its models via the existing CyMed Ninja
ERP API at `/api/v1/erp/...` already mounted from the Django side. The
TypeScript client at `frontend/src/lib/erp/modules.ts` adds new facades:

```ts
import { pharmacy_supply, surgical_supply, lab_supply, quality, dashboards } from '@/lib/erp';
```

(To be wired in the next iteration — module CRUD lives in Odoo until then.)

## Migration & deployment

```bash
# Install all CyMed extension modules
cd /opt/cymed/cymed_erp
python cymed-erp-bin -d cymed --addons-path=cymed_erp_core/addons,addons \
  -i cymed_pharmacy_supply,cymed_surgical_supply,cymed_lab_supply,\
cymed_quality,cymed_cold_chain,cymed_supply_dashboard --stop-after-init
```

## What's complete in this iteration

| Module | Models | Security CSV | Views | Status |
|---|---|---|---|---|
| `cymed_pharmacy_supply` | ✅ 12 models | ✅ | ⏳ next iteration | Models ready |
| `cymed_surgical_supply` | ✅ 11 models | ✅ | ⏳ | Models ready |
| `cymed_lab_supply` | ✅ 7 models | ✅ | ⏳ | Models ready |
| `cymed_quality` | ✅ 5 models | ✅ | ⏳ | Models ready |
| `cymed_cold_chain` | ✅ 3 models | ✅ | ⏳ | Models ready |
| `cymed_supply_dashboard` | ✅ 2 KPI models | ✅ | ⏳ | Models ready |
| `cymed_implant_management` | placeholder | — | — | Scaffolded |
| `cymed_controlled_substances` | placeholder | — | — | Scaffolded |

40 substantive models, ~3,500 LOC of CyMed-original LGPL-3 code on top of
the 50-module rebranded engine. Views (forms + lists + kanbans) are the
next iteration — the data layer is the harder part and is done.

## Next iterations

1. Views (form + list + kanban + search) for every model — straightforward
   XML
2. Wire `vendor_management_app` and `warehouse_app` on the Django side
3. Wire the executive dashboards into the Next.js Cybercom UI
4. AI Platform integration for forecasting
5. Implant management + controlled substances as dedicated extension modules
   on top of the foundation here

This is enterprise-scale work. The foundation is intentionally pragmatic:
deep where it differentiates (healthcare quality + traceability + cold chain)
and reuses Odoo where it doesn't (basic warehouse + purchase + accounting).
