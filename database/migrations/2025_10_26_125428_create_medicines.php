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
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('manufacturer');
            $table->enum('form', ['Tablets', 'Capsules', 'Powders and Granules', 'Lozenges', 'Suppositories', 'Solutions', 'Elixirs', 'Suspensions', 'Drops', 'Ointments', 'Creams', 'Gels', 'Pastes', 'Inhalers', 'Aerosols', 'Nebulizers', 'Implants', 'Transdermal Patches', 'Oral Films', 'Other']);
            $table->enum('delivery_systems', ['Oral', 'Parenteral', 'Topical', 'Inhalation', 'Transdermal']);
            $table->integer('strength');
            $table->enum('strength_units', ['mg', 'ml', 'µg', 'g']);
            $table->string('batch_number')->unique();
            $table->unsignedInteger('quantity_in_stock');
            $table->date('expiry_date');
            $table->decimal('purchase_price', 8, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
