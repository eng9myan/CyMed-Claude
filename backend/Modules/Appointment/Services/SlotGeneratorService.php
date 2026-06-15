<?php

namespace Modules\Appointment\Services;

use Carbon\Carbon;
use Modules\Appointment\Models\Appointment;
use Modules\Appointment\Models\AppointmentSchedule;

class SlotGeneratorService
{
    public function getAvailableSlots(string $physicianId, string $date): array
    {
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;

        $schedules = AppointmentSchedule::where('physician_id', $physicianId)
            ->where('is_active', true)
            ->get();

        $bookedTimes = Appointment::where('physician_id', $physicianId)
            ->where('appointment_date', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->pluck('start_time')
            ->map(fn ($t) => Carbon::parse($t)->format('H:i'))
            ->toArray();

        $slots = [];

        foreach ($schedules as $schedule) {
            $workingDays = $schedule->working_days ?? [];
            if (! in_array($dayOfWeek, $workingDays)) {
                continue;
            }

            // Check exceptions for this date
            $exceptions = $schedule->exceptions ?? [];
            $isOff = false;
            foreach ($exceptions as $exception) {
                if (isset($exception['date']) && $exception['date'] === $date && ($exception['is_off'] ?? false)) {
                    $isOff = true;
                    break;
                }
            }
            if ($isOff) {
                continue;
            }

            $slotDuration = (int) $schedule->slot_duration_minutes;
            if ($slotDuration < 1) {
                $slotDuration = 15;
            }

            $current = Carbon::parse($date . ' ' . $schedule->start_time);
            $endBoundary = Carbon::parse($date . ' ' . $schedule->end_time);

            while ($current < $endBoundary) {
                $slotEnd = $current->copy()->addMinutes($slotDuration);
                if ($slotEnd > $endBoundary) {
                    break;
                }

                $startFormatted = $current->format('H:i');
                if (! in_array($startFormatted, $bookedTimes)) {
                    $slots[] = [
                        'schedule_id' => $schedule->id,
                        'start_time' => $startFormatted,
                        'end_time' => $slotEnd->format('H:i'),
                        'duration_minutes' => $slotDuration,
                    ];
                }

                $current = $slotEnd;
            }
        }

        return $slots;
    }
}
