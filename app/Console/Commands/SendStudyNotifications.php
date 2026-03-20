<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\MasterTimetable;
use App\Services\ProactiveStudyService;
use App\Services\AiService;
use App\Mail\ReadingReminderMail;
use App\Mail\TestAlertMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendStudyNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-study-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily study assignments and test alerts to users based on their master timetable.';

    /**
     * Execute the console command.
     */
    public function handle(ProactiveStudyService $proactiveService, AiService $aiService)
    {
        $startedAt = microtime(true);
        $this->info('Starting study notification dispatch...');

        $stats = [
            'processed_users' => 0,
            'test_alerts_queued' => 0,
            'study_reminders_queued' => 0,
            'errors' => 0,
        ];

        $timetables = MasterTimetable::with('user')->get();

        foreach ($timetables as $timetable) {
            $user = $timetable->user;
            if (!$user) continue;

            $stats['processed_users']++;

            $this->info("Processing user: {$user->email}");

            // 1. Check for Test Alerts
            $testAlert = $proactiveService->getActiveTestAlert($user);
            if ($testAlert) {
                // To avoid spamming everyday of the week, maybe send only on Monday or specific days
                if (now()->format('l') === 'Monday' || now()->format('l') === 'Thursday') {
                    try {
                        Mail::to($user->email)->queue((new TestAlertMail($user, $testAlert))->onQueue('mail')->delay(now()->addSeconds(5)));
                        $stats['test_alerts_queued']++;
                        $this->info("   - Queued Test Alert: {$testAlert['name']}");
                    } catch (Throwable $e) {
                        $stats['errors']++;
                        Log::error('Failed to queue test alert', [
                            'user_id' => $user->id,
                            'email' => $user->email,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }

            // 2. Process Daily Assignments
            $assignments = $proactiveService->getDailyAssignment($user);
            
            if (!empty($assignments)) {
                $processedAssignments = [];

                foreach ($assignments as $item) {
                    $course = $item['course'];
                    $range = $item['page_range'];
                    
                    // Extract text
                    $text = $proactiveService->extractContentForAssignment($course, $range);
                    
                    // Generate AI advice
                    $advice = $aiService->generateDailyAdvice($text ?? "Focus on the topics below.", $item['topics']);

                    $processedAssignments[] = array_merge($item, [
                        'extracted_text' => $text,
                        'advice' => $advice
                    ]);
                }

                if (!empty($processedAssignments)) {
                    try {
                        Mail::to($user->email)->queue((new ReadingReminderMail($user, $processedAssignments, $timetable->current_week))->onQueue('mail')->delay(now()->addSeconds(10)));
                        $stats['study_reminders_queued']++;
                        $this->info("   - Queued Daily Study Flash with " . count($processedAssignments) . " courses.");
                    } catch (Throwable $e) {
                        $stats['errors']++;
                        Log::error('Failed to queue reading reminder', [
                            'user_id' => $user->id,
                            'email' => $user->email,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }
        }

        $durationMs = (int) ((microtime(true) - $startedAt) * 1000);
        Log::info('Study notifications dispatch finished', $stats + ['duration_ms' => $durationMs]);

        $this->info('Notification dispatch completed.');
        $this->table(['Metric', 'Value'], [
            ['Processed users', (string) $stats['processed_users']],
            ['Test alerts queued', (string) $stats['test_alerts_queued']],
            ['Study reminders queued', (string) $stats['study_reminders_queued']],
            ['Errors', (string) $stats['errors']],
            ['Duration (ms)', (string) $durationMs],
        ]);

        return $stats['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }
}
