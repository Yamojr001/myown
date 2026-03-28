<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('study_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->integer('week_number');
            $table->string('day_name');
            $table->json('completed_tasks')->nullable();
            $table->integer('test_score')->nullable();
            $table->boolean('test_passed')->default(false);
            $table->json('test_questions')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'course_id', 'week_number', 'day_name'], 'study_progress_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_progress');
    }
};
