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
        $this->info('Starting study notification dispatch...');

        $timetables = MasterTimetable::with('user')->get();

        foreach ($timetables as $timetable) {
            $user = $timetable->user;
            if (!$user) continue;

            $this->info("Processing user: {$user->email}");

            // 1. Check for Test Alerts
            $testAlert = $proactiveService->getActiveTestAlert($user);
            if ($testAlert) {
                // To avoid spamming everyday of the week, maybe send only on Monday or specific days
                if (now()->format('l') === 'Monday' || now()->format('l') === 'Thursday') {
                    Mail::to($user->email)->send(new TestAlertMail($user, $testAlert));
                    $this->info("   - Sent Test Alert: {$testAlert['name']}");
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
                    Mail::to($user->email)->send(new ReadingReminderMail($user, $processedAssignments, $timetable->current_week));
                    $this->info("   - Sent Daily Study Flash with " . count($processedAssignments) . " courses.");
                }
            }
        }

        $this->info('Notification dispatch completed.');
    }
}
