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
        Schema::table('cost_components', function (Blueprint $table) {
            $table->string('billing_type')->change();
        });
    }

    public function down(): void
    {
        Schema::table('cost_components', function (Blueprint $table) {
            // Revert back to enum if needed, or leave as string
            // It's safer to leave as string to avoid dropping values in down()
        });
    }
};
