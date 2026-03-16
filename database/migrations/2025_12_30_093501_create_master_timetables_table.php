<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_timetables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->nullable()->constrained()->onDelete('cascade');
            $table->json('schedule')->nullable();
            $table->integer('semester_duration_weeks')->nullable();
            $table->date('semester_start_date')->nullable();
            $table->json('weekly_schedule')->nullable();
            $table->json('test_schedule')->nullable();
            $table->integer('current_week')->nullable();
            $table->integer('next_test_week')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_timetables');
    }
};