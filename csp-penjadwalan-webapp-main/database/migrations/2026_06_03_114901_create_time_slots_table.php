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
        Schema::create('time_slots', function (Blueprint $table) {
            $table->id('time_slot_id');
            $table->integer('slot_number'); // e.g. 1st period, 2nd period
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_break')->default(false); // Istirahat
            $table->string('name')->nullable(); // Optional: "Istirahat 1", "Upacara"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_slots');
    }
};
