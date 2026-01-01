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
        Schema::table('total_patient_bills', function (Blueprint $table) {
            $table->enum('status', ['paid', 'unpaid', 'cancelled'])->default('unpaid')->after('total_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('total_patient_bills', function (Blueprint $table) {
            if(Schema::hasColumn('total_patient_bills', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
