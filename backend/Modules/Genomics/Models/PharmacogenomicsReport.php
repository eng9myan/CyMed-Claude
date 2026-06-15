<?php

namespace Modules\Genomics\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class PharmacogenomicsReport extends Model
{
    use HasUuids;

    protected $table = 'pharmacogenomics_reports';

    protected $fillable = [
        'patient_id', 'genomic_test_id', 'gene', 'diplotype', 'phenotype',
        'drug', 'recommendation', 'clinical_notes',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function genomicTest()
    {
        return $this->belongsTo(GenomicTest::class);
    }
}
