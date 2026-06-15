<?php

namespace Modules\Genomics\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class GenomicVariant extends Model
{
    use HasUuids;

    protected $table = 'genomic_variants';

    protected $fillable = [
        'genomic_test_id', 'gene', 'variant', 'transcript',
        'zygosity', 'classification', 'inheritance', 'clinical_significance',
    ];

    public function test()
    {
        return $this->belongsTo(GenomicTest::class, 'genomic_test_id');
    }
}
