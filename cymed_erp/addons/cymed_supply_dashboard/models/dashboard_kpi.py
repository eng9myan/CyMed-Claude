"""
Supply Chain Dashboard KPIs
============================
Aggregations for executive supply-chain dashboards. Refreshed by cron on
configurable schedules.
"""
from odoo import models, fields, api


class SupplyChainKPI(models.Model):
    _name = 'cymed.supply.kpi'
    _description = 'Supply Chain KPI Snapshot'
    _order = 'snapshot_date desc'

    snapshot_date = fields.Date(required=True, default=fields.Date.today, index=True)
    company_id = fields.Many2one('res.company', required=True, default=lambda s: s.env.company)

    # ── Inventory ──────────────────────────────────────────────────────────
    total_inventory_value = fields.Float()
    drug_inventory_value = fields.Float()
    consumable_inventory_value = fields.Float()
    implant_inventory_value = fields.Float()
    cold_chain_value = fields.Float()
    sku_count = fields.Integer()
    aging_30d_value = fields.Float(string='Stock Aging 0-30 days')
    aging_60d_value = fields.Float(string='Stock Aging 31-60 days')
    aging_90d_value = fields.Float(string='Stock Aging 61-90 days')
    aging_180d_value = fields.Float(string='Stock Aging 91-180 days')
    aging_old_value = fields.Float(string='Stock Aging > 180 days')

    # ── Expiry ─────────────────────────────────────────────────────────────
    expiring_30d_value = fields.Float()
    expiring_60d_value = fields.Float()
    expiring_90d_value = fields.Float()
    expired_value = fields.Float()

    # ── Shortages & service ───────────────────────────────────────────────
    stockout_count = fields.Integer(string='Active Stockouts')
    near_stockout_count = fields.Integer(string='Items Below Reorder')
    fill_rate_pct = fields.Float()
    avg_stockout_duration_hrs = fields.Float()

    # ── Procurement ────────────────────────────────────────────────────────
    open_po_value = fields.Float()
    pending_grn_count = fields.Integer()
    avg_lead_time_days = fields.Float()
    rejected_inspection_pct = fields.Float()

    # ── Vendor performance ────────────────────────────────────────────────
    avg_vendor_otd_pct = fields.Float(string='On-Time Delivery %')
    avg_vendor_quality_pct = fields.Float()
    avg_vendor_score = fields.Float()

    # ── Quality ────────────────────────────────────────────────────────────
    open_ncr_count = fields.Integer()
    open_capa_count = fields.Integer()
    overdue_capa_count = fields.Integer()
    active_recalls = fields.Integer()

    # ── Turnover & efficiency ────────────────────────────────────────────
    inventory_turnover = fields.Float()
    days_inventory_outstanding = fields.Float()
    carrying_cost_pct = fields.Float()

    # ── Forecast ───────────────────────────────────────────────────────────
    forecast_accuracy_pct = fields.Float()
    forecast_bias_pct = fields.Float()


class VendorScorecard(models.Model):
    _name = 'cymed.vendor.scorecard'
    _description = 'Vendor Performance Scorecard'
    _order = 'period_end desc'

    vendor_id = fields.Many2one('res.partner', required=True,
                                  domain=[('supplier_rank', '>', 0)])
    period_start = fields.Date(required=True)
    period_end = fields.Date(required=True)

    po_count = fields.Integer()
    po_value = fields.Float()
    on_time_pct = fields.Float()
    quality_pct = fields.Float()
    cost_variance_pct = fields.Float()
    response_time_hrs = fields.Float()
    ncr_count = fields.Integer()

    overall_score = fields.Float(compute='_compute_score', store=True,
                                   help='Weighted: 30% OTD + 30% quality + 20% cost + 20% responsiveness')

    grade = fields.Selection([
        ('a', 'A — Preferred'),
        ('b', 'B — Approved'),
        ('c', 'C — Watch'),
        ('d', 'D — Probation'),
        ('f', 'F — Disqualified'),
    ], compute='_compute_grade', store=True)

    @api.depends('on_time_pct', 'quality_pct', 'cost_variance_pct', 'response_time_hrs')
    def _compute_score(self):
        for r in self:
            cost_score = max(0, 100 - abs(r.cost_variance_pct))
            response_score = max(0, 100 - (r.response_time_hrs * 2))
            r.overall_score = (
                r.on_time_pct * 0.30 +
                r.quality_pct * 0.30 +
                cost_score * 0.20 +
                response_score * 0.20
            )

    @api.depends('overall_score')
    def _compute_grade(self):
        for r in self:
            if r.overall_score >= 90: r.grade = 'a'
            elif r.overall_score >= 75: r.grade = 'b'
            elif r.overall_score >= 60: r.grade = 'c'
            elif r.overall_score >= 40: r.grade = 'd'
            else: r.grade = 'f'
