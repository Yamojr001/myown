<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('master_timetables')->whereNull('current_week')->update(['current_week' => 1]);
        DB::table('master_timetables')->whereNull('semester_duration_weeks')->update(['semester_duration_weeks' => 15]);

        Schema::table('master_timetables', function (Blueprint $table) {
            $table->integer('current_week')->default(1)->nullable(false)->change();
            $table->integer('semester_duration_weeks')->default(15)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('master_timetables', function (Blueprint $table) {
            $table->integer('current_week')->nullable()->default(null)->change();
            $table->integer('semester_duration_weeks')->nullable()->default(null)->change();
        });
    }
};
