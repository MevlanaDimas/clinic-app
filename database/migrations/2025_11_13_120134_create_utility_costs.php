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
        Schema::create('utility_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('total_utility_cost_id')->constrained(table: 'total_utility_costs', column: 'id', indexName: 'total_utility_cost_id')->onDelete('cascade');
            $table->string('name');
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utility_costs');
    }
};
