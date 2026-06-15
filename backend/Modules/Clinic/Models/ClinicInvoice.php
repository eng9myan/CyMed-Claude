<?php

namespace Modules\Clinic\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Patient\Models\Patient;

class ClinicInvoice extends Model
{
    use HasUuids;

    protected $table = 'clinic_invoices';

    protected $fillable = [
        'invoice_number',
        'clinic_id',
        'patient_id',
        'cashier_id',
        'invoice_date',
        'visit_type',
        'consultation_fee',
        'procedure_fees',
        'discount_amount',
        'subtotal',
        'vat_amount',
        'total_amount',
        'patient_share',
        'paid_amount',
        'payment_method',
        'status',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'consultation_fee' => 'decimal:2',
        'procedure_fees' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'patient_share' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    public static function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $result = DB::select(
            "SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'CINV-{$year}-(.+)') AS INTEGER)), 0) AS max_seq FROM clinic_invoices WHERE invoice_number LIKE 'CINV-{$year}-%'"
        );

        $seq = ((int) $result[0]->max_seq) + 1;

        return 'CINV-' . $year . '-' . str_pad((string) $seq, 6, '0', STR_PAD_LEFT);
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
}
