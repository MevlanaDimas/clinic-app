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
        Schema::create('purchase_delivery_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_item_id')->constrained(table: 'request_items', column: 'id', indexName: 'request_item_id')->onDelete('cascade');
            $table->enum('status', ['pending', 'on_delivery', 'delivered', 'rejected', 'returned'])->default('pending');
            $table->string('delivery_service')->nullable();
            $table->string('tracking_number')->nullable();
            $table->unsignedInteger('estimated_delivery_time_in_days')->nullable();
            $table->text('rejected_reason')->nullable();
            $table->text('returned_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_delivery_statuses');
    }
};
