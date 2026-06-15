<?php

namespace Modules\Genomics\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Patient\Models\Patient;

class GenomicTest extends Model
{
    use HasUuids;

    protected $table = 'genomic_tests';

    protected $fillable = [
        'test_number', 'patient_id', 'ordered_by', 'facility_id',
        'test_type', 'panel_name', 'ordered_date', 'sample_collected_date',
        'result_date', 'status', 'lab_name',
    ];

    protected $casts = [
        'ordered_date' => 'date',
        'sample_collected_date' => 'date',
        'result_date' => 'date',
    ];

    public static function generateTestNumber(): string
    {
        $year = now()->year;
        $result = DB::select(
            "SELECT COALESCE(MAX(CAST(SUBSTRING(test_number FROM 'GEN-{$year}-(.+)') AS INTEGER)), 0) AS max_seq FROM genomic_tests WHERE test_number LIKE 'GEN-{$year}-%'"
        );
        $seq = ((int) $result[0]->max_seq) + 1;

        return 'GEN-' . $year . '-' . str_pad((string) $seq, 6, '0', STR_PAD_LEFT);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function orderedBy()
    {
        return $this->belongsTo(User::class, 'ordered_by');
    }

    public function variants()
    {
        return $this->hasMany(GenomicVariant::class);
    }
}
