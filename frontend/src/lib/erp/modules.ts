/**
 * Typed ERP module facades — one section per CyMed feature.
 *
 * Each facade is a thin typed wrapper around the generic client. Components
 * import what they need: `import { finance } from '@/lib/erp/modules'`.
 */
import { searchRead, create, write, action } from './client';

// ── Finance / Accounting ──────────────────────────────────────────────────────
export const finance = {
  async accounts(domain: unknown[] = []) {
    return searchRead('account.account', domain,
      ['code', 'name', 'account_type', 'company_id', 'currency_id'],
      { order: 'code asc', limit: 500 });
  },
  async journals() {
    return searchRead('account.journal', [], ['name', 'code', 'type', 'currency_id']);
  },
  async journalEntries(state: 'draft' | 'posted' | null = null) {
    const domain = state ? [['state', '=', state]] : [];
    return searchRead('account.move', domain,
      ['name', 'date', 'partner_id', 'amount_total', 'state', 'move_type'],
      { order: 'date desc', limit: 100 });
  },
  async postEntry(id: number) {
    return action('account.move', 'action_post', [id]);
  },
  async apInvoices() {
    return searchRead('account.move',
      [['move_type', '=', 'in_invoice']],
      ['name', 'partner_id', 'invoice_date', 'amount_total', 'payment_state', 'state'],
      { order: 'invoice_date desc', limit: 100 });
  },
  async arInvoices() {
    return searchRead('account.move',
      [['move_type', '=', 'out_invoice']],
      ['name', 'partner_id', 'invoice_date', 'amount_total', 'payment_state', 'state'],
      { order: 'invoice_date desc', limit: 100 });
  },
};

// ── HR ────────────────────────────────────────────────────────────────────────
export const hr = {
  async employees() {
    return searchRead('hr.employee', [['active', '=', true]],
      ['name', 'work_email', 'work_phone', 'job_title', 'department_id', 'parent_id']);
  },
  async departments() {
    return searchRead('hr.department', [], ['name', 'manager_id', 'member_ids', 'parent_id']);
  },
  async leaveRequests(state: string | null = null) {
    const domain = state ? [['state', '=', state]] : [];
    return searchRead('hr.leave', domain,
      ['employee_id', 'holiday_status_id', 'date_from', 'date_to', 'number_of_days', 'state']);
  },
  async approveLeave(id: number) {
    return action('hr.leave', 'action_approve', [id]);
  },
  async refuseLeave(id: number) {
    return action('hr.leave', 'action_refuse', [id]);
  },
  async attendance() {
    return searchRead('hr.attendance', [],
      ['employee_id', 'check_in', 'check_out', 'worked_hours'],
      { order: 'check_in desc', limit: 100 });
  },
};

// ── Inventory ─────────────────────────────────────────────────────────────────
export const inventory = {
  async products() {
    return searchRead('product.product', [['active', '=', true]],
      ['name', 'default_code', 'qty_available', 'list_price', 'standard_price', 'categ_id', 'uom_id']);
  },
  async stockQuants() {
    return searchRead('stock.quant', [['quantity', '>', 0]],
      ['product_id', 'location_id', 'quantity', 'reserved_quantity', 'lot_id']);
  },
  async warehouses() {
    return searchRead('stock.warehouse', [],
      ['name', 'code', 'partner_id', 'company_id']);
  },
  async stockMoves() {
    return searchRead('stock.move', [['state', 'in', ['done', 'assigned']]],
      ['product_id', 'product_uom_qty', 'location_id', 'location_dest_id', 'date', 'state'],
      { order: 'date desc', limit: 50 });
  },
};

// ── Procurement ───────────────────────────────────────────────────────────────
export const procurement = {
  async vendors() {
    return searchRead('res.partner',
      [['supplier_rank', '>', 0]],
      ['name', 'email', 'phone', 'vat', 'country_id', 'category_id']);
  },
  async purchaseOrders(state: string | null = null) {
    const domain = state ? [['state', '=', state]] : [];
    return searchRead('purchase.order', domain,
      ['name', 'partner_id', 'date_order', 'amount_total', 'state'],
      { order: 'date_order desc', limit: 100 });
  },
  async confirmPO(id: number) {
    return action('purchase.order', 'button_confirm', [id]);
  },
  async cancelPO(id: number) {
    return action('purchase.order', 'button_cancel', [id]);
  },
};

// ── CRM / Patient Relations ───────────────────────────────────────────────────
export const crm = {
  async leads(stage: string | null = null) {
    const domain = stage ? [['stage_id.name', '=', stage]] : [];
    return searchRead('crm.lead', domain,
      ['name', 'partner_name', 'email_from', 'phone', 'expected_revenue', 'stage_id', 'user_id']);
  },
  async opportunities() {
    return searchRead('crm.lead',
      [['type', '=', 'opportunity']],
      ['name', 'partner_id', 'expected_revenue', 'probability', 'stage_id', 'date_deadline']);
  },
};

// ── Sales / AR generator ──────────────────────────────────────────────────────
export const sales = {
  async orders(state: string | null = null) {
    const domain = state ? [['state', '=', state]] : [];
    return searchRead('sale.order', domain,
      ['name', 'partner_id', 'date_order', 'amount_total', 'state']);
  },
  async confirmOrder(id: number) {
    return action('sale.order', 'action_confirm', [id]);
  },
};
