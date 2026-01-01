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
        Schema::table('medicines', function (Blueprint $table) {
            if(Schema::hasColumn('medicines', 'quantity_in_stock')){
                $table->dropColumn('quantity_in_stock');
            }
            if(Schema::hasColumn('medicines', 'name')){
                $table->dropColumn('name');
            }
            if(Schema::hasColumn('medicines', 'manufacturer')){
                $table->dropColumn('manufacturer');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            //
        });
    }
};
