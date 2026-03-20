<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('tests')->whereIn('type', ['Pre-Test', 'pre test', 'Pre Test', 'pre-test'])->update(['type' => 'pre_test']);
        DB::table('tests')->whereIn('type', ['Mid-Semester', 'mid semester', 'mid-semester'])->update(['type' => 'mid_semester']);
        DB::table('tests')->whereIn('type', ['Post-Test', 'post test', 'Post Test', 'post-test'])->update(['type' => 'post_test']);
        DB::table('tests')->whereIn('type', ['Mock Exam', 'mock exam', 'mock-exam'])->update(['type' => 'mock_exam']);
        DB::table('tests')->whereIn('type', ['Random Test', 'random test', 'random-test'])->update(['type' => 'random_test']);

        Schema::table('tests', function (Blueprint $table) {
            $table->string('type', 32)->default('pre_test')->change();
            $table->index(['user_id', 'course_id', 'type'], 'tests_user_course_type_idx');
        });

        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE tests ADD CONSTRAINT tests_type_check CHECK (type IN ('pre_test','mid_semester','post_test','mock_exam','random_test'))");
        }

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE tests ADD CONSTRAINT tests_type_check CHECK (type IN ('pre_test','mid_semester','post_test','mock_exam','random_test'))");
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if (in_array($driver, ['pgsql', 'mysql'], true)) {
            try {
                DB::statement('ALTER TABLE tests DROP CONSTRAINT tests_type_check');
            } catch (\Throwable $e) {
                // ignore if constraint does not exist
            }
        }

        Schema::table('tests', function (Blueprint $table) {
            $table->dropIndex('tests_user_course_type_idx');
            $table->string('type')->change();
        });

        DB::table('tests')->where('type', 'pre_test')->update(['type' => 'Pre-Test']);
        DB::table('tests')->where('type', 'mid_semester')->update(['type' => 'mid_semester']);
        DB::table('tests')->where('type', 'post_test')->update(['type' => 'post_test']);
        DB::table('tests')->where('type', 'mock_exam')->update(['type' => 'mock_exam']);
        DB::table('tests')->where('type', 'random_test')->update(['type' => 'random_test']);
    }
};
