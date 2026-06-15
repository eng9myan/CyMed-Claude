<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Queue health monitoring
        $schedule->command('horizon:snapshot')->everyFiveMinutes();

        // Appointment reminders
        $schedule->command('cymed:appointment-reminders --hours=24')->dailyAt('08:00');
        $schedule->command('cymed:appointment-reminders --hours=2')->everyTwoHours();

        // Insurance eligibility verification (batch)
        $schedule->command('cymed:verify-eligibility --upcoming-days=3')->dailyAt('06:00');

        // Critical lab alerts follow-up
        $schedule->command('cymed:critical-lab-followup')->everyFifteenMinutes();

        // Bed status cleanup
        $schedule->command('cymed:bed-status-reconcile')->hourly();

        // AR aging report
        $schedule->command('cymed:ar-aging-report')->dailyAt('23:00');

        // Audit log cleanup (keep 2 years)
        $schedule->command('activitylog:clean --days=730')->weekly();

        // PHI access report for Privacy Officer
        $schedule->command('cymed:phi-access-report')->weeklyOn(1, '07:00');

        // Backup database
        $schedule->command('cymed:backup')->dailyAt('02:00');

        // Cache warm-up
        $schedule->command('cymed:cache-warmup')->hourly();

        // NEWS2 reassessment alerts
        $schedule->command('cymed:news2-scan')->everyFifteenMinutes();

        // Infection control surveillance
        $schedule->command('cymed:infection-surveillance')->dailyAt('07:00');

        // Claims submission retry
        $schedule->command('cymed:retry-claims')->everyThirtyMinutes();
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
