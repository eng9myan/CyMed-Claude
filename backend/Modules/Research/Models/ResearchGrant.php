<?php

namespace Modules\Research\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ResearchGrant extends Model
{
    use HasUuids;

    protected $table = 'research_grants';

    protected $fillable = [
        'grant_number', 'facility_id', 'principal_investigator_id',
        'title', 'funding_agency', 'amount', 'currency',
        'start_date', 'end_date', 'status', 'objectives',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public static function generateGrantNumber(): string
    {
        $year = now()->year;
        $result = DB::select(
            "SELECT COALESCE(MAX(CAST(SUBSTRING(grant_number FROM 'GR-{$year}-(.+)') AS INTEGER)), 0) AS max_seq FROM research_grants WHERE grant_number LIKE 'GR-{$year}-%'"
        );
        $seq = ((int) $result[0]->max_seq) + 1;

        return 'GR-' . $year . '-' . str_pad((string) $seq, 6, '0', STR_PAD_LEFT);
    }

    public function principalInvestigator()
    {
        return $this->belongsTo(User::class, 'principal_investigator_id');
    }

    public function expenditures()
    {
        return $this->hasMany(GrantExpenditure::class);
    }
}
