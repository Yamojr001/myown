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
        Schema::table('users', function (Blueprint $table) {
            $table->string('school')->nullable();
            $table->string('department')->nullable();
            $table->string('level')->nullable();
            $table->string('avatar')->nullable();
            $table->foreignId('current_semester_id')->nullable()->constrained('semesters')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_semester_id']);
            $table->dropColumn(['current_semester_id', 'school', 'department', 'level', 'avatar']);
        });
    }
};
