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
        Schema::table('patient_registrations', function (Blueprint $table) {
            $table->enum('status', ['done', 'on_process', 'cancelled'])->default('on_process')->after('queue_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_registrations', function (Blueprint $table) {
            if(Schema::hasColumn('patient_registrations', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
