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
        Schema::table('tests', function (Blueprint $table) {
            // Change enum to string to support flexible test types (Pre-Test, Mock Exam, Random Test, Mid-Semester, etc.)
            $table->string('type')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            // Can't reliably convert back to original enum without data loss if we have new types
            // So we'll just leave it as string, or you could attempt to map it back if strictly required
            $table->enum('type', ['Pre-Test', 'Post-Test'])->change();
        });
    }
};
