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
        Schema::table('master_timetables', function (Blueprint $table) {
            $table->json('preferences')->after('test_schedule')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('master_timetables', function (Blueprint $table) {
            $table->dropColumn('preferences');
        });
    }
};
