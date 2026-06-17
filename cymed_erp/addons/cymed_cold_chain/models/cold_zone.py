"""
Cold Chain Zone + Temperature Monitoring
"""
from odoo import models, fields, api


class ColdZone(models.Model):
    _name = 'cymed.cold.zone'
    _description = 'Cold Chain Storage Zone'
    _rec_name = 'name'

    name = fields.Char(required=True)
    location_id = fields.Many2one('stock.location', required=True)
    zone_type = fields.Selection([
        ('frozen', 'Frozen (-25 to -15°C)'),
        ('refrigerator', 'Refrigerator (2-8°C)'),
        ('cool', 'Cool (8-15°C)'),
        ('controlled_room', 'Controlled Room (15-25°C)'),
        ('ultra_low', 'Ultra-Low (-80°C)'),
    ], required=True)
    target_min = fields.Float()
    target_max = fields.Float()
    alarm_min = fields.Float()
    alarm_max = fields.Float()
    sensor_device_id = fields.Char(string='IoT Sensor Device ID')
    last_temp_reading = fields.Float()
    last_reading_time = fields.Datetime()
    in_alarm = fields.Boolean()
    backup_power = fields.Boolean(string='UPS Backed')


class TemperatureReading(models.Model):
    _name = 'cymed.cold.temperature.reading'
    _description = 'Cold Zone Temperature Reading'
    _order = 'reading_time desc'

    zone_id = fields.Many2one('cymed.cold.zone', required=True, ondelete='cascade', index=True)
    reading_time = fields.Datetime(required=True, default=fields.Datetime.now, index=True)
    temperature = fields.Float(required=True)
    humidity = fields.Float()
    sensor_id = fields.Char()
    is_excursion = fields.Boolean(compute='_compute_excursion', store=True)

    @api.depends('temperature', 'zone_id.alarm_min', 'zone_id.alarm_max')
    def _compute_excursion(self):
        for r in self:
            r.is_excursion = r.temperature < r.zone_id.alarm_min or r.temperature > r.zone_id.alarm_max


class TemperatureExcursion(models.Model):
    _name = 'cymed.cold.excursion'
    _description = 'Cold Chain Excursion Event'
    _inherit = ['mail.thread']
    _order = 'start_time desc'

    name = fields.Char(default='New')
    zone_id = fields.Many2one('cymed.cold.zone', required=True)
    start_time = fields.Datetime(required=True)
    end_time = fields.Datetime()
    duration_min = fields.Integer(compute='_compute_duration', store=True)
    min_temp = fields.Float()
    max_temp = fields.Float()

    state = fields.Selection([
        ('detected', 'Detected'),
        ('investigating', 'Under Investigation'),
        ('product_quarantined', 'Affected Product Quarantined'),
        ('disposition_pending', 'Disposition Pending'),
        ('resolved', 'Resolved — Product Released'),
        ('discarded', 'Resolved — Product Discarded'),
    ], default='detected', tracking=True)

    affected_quant_ids = fields.Many2many('stock.quant', string='Affected Stock')
    capa_id = fields.Many2one('cymed.quality.capa')

    @api.depends('start_time', 'end_time')
    def _compute_duration(self):
        for r in self:
            r.duration_min = int((r.end_time - r.start_time).total_seconds() / 60) if r.start_time and r.end_time else 0
