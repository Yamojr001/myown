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
        Schema::create('course_contents', function (Blueprint $table) {
            $table->id();
            $table->string('course_code');
            $table->string('school');
            $table->string('department');
            $table->integer('year');
            $table->longText('content');
            $table->timestamps();

            // Unique constraint to prevent duplicate content for the same school, department, year, and course code
            $table->unique(['school', 'department', 'year', 'course_code'], 'content_unique_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_contents');
    }
};
