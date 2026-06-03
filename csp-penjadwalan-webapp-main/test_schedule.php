<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$ipsClass = \App\Models\StudentClass::where('class_name', 'X IPS 1')->first();
$mipa11Class = \App\Models\StudentClass::where('class_name', 'XI MIPA 1')->first();
$mipa10Class = \App\Models\StudentClass::where('class_name', 'X MIPA 1')->first();

foreach(\App\Models\TeachingAssignment::with(['teacher', 'subject'])->get() as $a) {
    echo $a->teacher->full_name . " teaches " . $a->subject->subject_name . "\n";
}



