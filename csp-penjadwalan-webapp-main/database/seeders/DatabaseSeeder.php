<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Program;
use App\Models\Semester;
use App\Models\Room;
use App\Models\Subject;
use App\Models\StudentClass;
use App\Models\Curriculum;
use App\Models\Enrollment;
use App\Models\Schedule;
use App\Models\TimeSlot;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Prevent foreign key check issues while truncating
        Schema_disable_checks_if_needed();

        // 0. Create Time Slots (1 JP = 45 mins)
        // Let's create 8 periods + 2 breaks
        $slots = [
            ['slot_number' => 1, 'start_time' => '07:30:00', 'end_time' => '08:15:00', 'is_break' => false, 'name' => 'Jam ke-1'],
            ['slot_number' => 2, 'start_time' => '08:15:00', 'end_time' => '09:00:00', 'is_break' => false, 'name' => 'Jam ke-2'],
            ['slot_number' => 3, 'start_time' => '09:00:00', 'end_time' => '09:45:00', 'is_break' => false, 'name' => 'Jam ke-3'],
            ['slot_number' => 0, 'start_time' => '09:45:00', 'end_time' => '10:00:00', 'is_break' => true, 'name' => 'Istirahat 1'],
            ['slot_number' => 4, 'start_time' => '10:00:00', 'end_time' => '10:45:00', 'is_break' => false, 'name' => 'Jam ke-4'],
            ['slot_number' => 5, 'start_time' => '10:45:00', 'end_time' => '11:30:00', 'is_break' => false, 'name' => 'Jam ke-5'],
            ['slot_number' => 6, 'start_time' => '11:30:00', 'end_time' => '12:15:00', 'is_break' => false, 'name' => 'Jam ke-6'],
            ['slot_number' => 0, 'start_time' => '12:15:00', 'end_time' => '13:00:00', 'is_break' => true, 'name' => 'Istirahat 2 (ISHOMA)'],
            ['slot_number' => 7, 'start_time' => '13:00:00', 'end_time' => '13:45:00', 'is_break' => false, 'name' => 'Jam ke-7'],
            ['slot_number' => 8, 'start_time' => '13:45:00', 'end_time' => '14:30:00', 'is_break' => false, 'name' => 'Jam ke-8'],
        ];
        foreach ($slots as $slot) {
            TimeSlot::create($slot);
        }

        // 1. Create Semesters
        $semActive = Semester::create([
            'semester_name' => 'Ganjil 2026/2027',
            'academic_year' => '2026/2027',
            'term' => 'Ganjil',
            'start_date' => '2026-07-15',
            'end_date' => '2026-12-20',
            'is_active' => true,
        ]);

        $semInactive = Semester::create([
            'semester_name' => 'Genap 2025/2026',
            'academic_year' => '2025/2026',
            'term' => 'Genap',
            'start_date' => '2026-01-05',
            'end_date' => '2026-06-20',
            'is_active' => false,
        ]);

        // 2. Create Programs (Peminatan)
        $mipa = Program::create(['program_name' => 'MIPA']);
        $ips = Program::create(['program_name' => 'IPS']);

        // 3. Create Rooms
        $roomsData = [
            ['room_name' => 'R. Kelas X-1', 'building' => 'Gedung A', 'floor' => '1', 'capacity' => 36],
            ['room_name' => 'R. Kelas X-2', 'building' => 'Gedung A', 'floor' => '1', 'capacity' => 36],
            ['room_name' => 'R. Kelas XI-MIPA-1', 'building' => 'Gedung B', 'floor' => '2', 'capacity' => 36],
            ['room_name' => 'R. Kelas XI-IPS-1', 'building' => 'Gedung B', 'floor' => '2', 'capacity' => 36],
            ['room_name' => 'Lab Fisika', 'building' => 'Gedung Lab', 'floor' => '1', 'capacity' => 40],
            ['room_name' => 'Lab Biologi', 'building' => 'Gedung Lab', 'floor' => '1', 'capacity' => 40],
            ['room_name' => 'Lab Komputer', 'building' => 'Gedung Lab', 'floor' => '2', 'capacity' => 40],
        ];
        
        $rooms = [];
        foreach ($roomsData as $r) {
            $rooms[] = Room::create($r);
        }

        // 4. Create Users (Admin, Teachers, Students)
        // Admin
        $admin = User::create([
            'full_name' => 'Administrator SMA',
            'email' => 'admin@lms.com',
            'password_hash' => Hash::make('password'),
            'role_id' => 1
        ]);

        // Teachers (Guru)
        $teachersData = [
            ['name' => 'Budi Utomo, S.Pd.', 'email' => 'budi@lms.com', 'number' => 'G001', 'pos' => 'Guru Matematika'],
            ['name' => 'Siti Aminah, M.Pd.', 'email' => 'siti@lms.com', 'number' => 'G002', 'pos' => 'Guru Fisika'],
            ['name' => 'Ahmad Fauzi, S.Si.', 'email' => 'ahmad@lms.com', 'number' => 'G003', 'pos' => 'Guru Kimia'],
            ['name' => 'Sri Wahyuni, S.Pd.', 'email' => 'sri@lms.com', 'number' => 'G004', 'pos' => 'Guru Biologi'],
            ['name' => 'Hendro Prasetyo, M.Hum.', 'email' => 'hendro@lms.com', 'number' => 'G005', 'pos' => 'Guru Sejarah'],
            ['name' => 'Rina Kartika, S.E.', 'email' => 'rina@lms.com', 'number' => 'G006', 'pos' => 'Guru Ekonomi'],
        ];

        // We also create the legacy dosen@lms.com teacher for login compatibility
        $legacyTeacher = User::create([
            'full_name' => 'Dr. Alan Turing',
            'email' => 'dosen@lms.com',
            'password_hash' => Hash::make('password'),
            'role_id' => 2
        ]);
        $legacyTeacher->lecturerProfile()->create([
            'lecturer_number' => 'D001',
            'title' => 'Dr.',
            'position' => 'Guru Komputer',
            'office_room' => 'R. Guru A'
        ]);

        $teachers = [];
        foreach ($teachersData as $tData) {
            $tUser = User::create([
                'full_name' => $tData['name'],
                'email' => $tData['email'],
                'password_hash' => Hash::make('password'),
                'role_id' => 2
            ]);
            $tUser->lecturerProfile()->create([
                'lecturer_number' => $tData['number'],
                'title' => '',
                'position' => $tData['pos'],
                'office_room' => 'R. Guru Utama'
            ]);
            $teachers[] = $tUser;
        }

        // Students (Siswa)
        // Legacy student for login compatibility
        $legacyStudent = User::create([
            'full_name' => 'John Doe',
            'email' => 'student@lms.com',
            'password_hash' => Hash::make('password'),
            'role_id' => 3
        ]);
        $legacyStudent->studentProfile()->create([
            'student_number' => '20260001',
            'program_id' => $mipa->program_id,
            'semester_id' => $semActive->semester_id,
            'batch_year' => 2026,
            'gpa' => 3.50
        ]);

        // More students
        $studentsData = [
            ['name' => 'Adi Wijaya', 'email' => 'adi@lms.com', 'number' => '20260002', 'prog' => $mipa->program_id],
            ['name' => 'Budi Santoso', 'email' => 'budi_s@lms.com', 'number' => '20260003', 'prog' => $mipa->program_id],
            ['name' => 'Cici Paramida', 'email' => 'cici@lms.com', 'number' => '20260004', 'prog' => $ips->program_id],
            ['name' => 'Dewi Lestari', 'email' => 'dewi@lms.com', 'number' => '20260005', 'prog' => $ips->program_id],
        ];
        foreach ($studentsData as $sData) {
            $sUser = User::create([
                'full_name' => $sData['name'],
                'email' => $sData['email'],
                'password_hash' => Hash::make('password'),
                'role_id' => 3
            ]);
            $sUser->studentProfile()->create([
                'student_number' => $sData['number'],
                'program_id' => $sData['prog'],
                'semester_id' => $semActive->semester_id,
                'batch_year' => 2026,
                'gpa' => 3.00
            ]);
        }

        // 5. Create StudentClasses (Wali kelas is one of the teachers)
        $class1 = StudentClass::create([
            'class_name' => 'X MIPA 1',
            'grade_level' => 10,
            'program_id' => $mipa->program_id,
            'homeroom_teacher_id' => $teachers[0]->user_id
        ]);

        $class2 = StudentClass::create([
            'class_name' => 'X IPS 1',
            'grade_level' => 10,
            'program_id' => $ips->program_id,
            'homeroom_teacher_id' => $teachers[4]->user_id
        ]);

        $class3 = StudentClass::create([
            'class_name' => 'XI MIPA 1',
            'grade_level' => 11,
            'program_id' => $mipa->program_id,
            'homeroom_teacher_id' => $teachers[1]->user_id
        ]);

        // Enroll legacy student to X MIPA 1
        Enrollment::create([
            'student_class_id' => $class1->student_class_id,
            'student_id' => $legacyStudent->user_id,
            'enrollment_date' => '2026-07-15',
            'status' => 'active'
        ]);

        // 6. Create Subjects (Mata Pelajaran)
        // General Subjects (no program_id)
        $subAgama = Subject::create(['subject_code' => 'PABP-10', 'subject_name' => 'Pendidikan Agama & Budi Pekerti', 'jp' => 3, 'program_id' => null, 'description' => 'Mata pelajaran umum agama']);
        $subIndo = Subject::create(['subject_code' => 'BIND-10', 'subject_name' => 'Bahasa Indonesia', 'jp' => 4, 'program_id' => null, 'description' => 'Mata pelajaran umum bahasa']);
        $subInggris = Subject::create(['subject_code' => 'BING-10', 'subject_name' => 'Bahasa Inggris', 'jp' => 4, 'program_id' => null, 'description' => 'Mata pelajaran umum bahasa']);
        $subPjok = Subject::create(['subject_code' => 'PJOK-10', 'subject_name' => 'Pendidikan Jasmani Olahraga & Kesehatan', 'jp' => 3, 'program_id' => null, 'description' => 'Olahraga']);

        // MIPA Subjects
        $subMatMinat = Subject::create(['subject_code' => 'MAT-MIPA', 'subject_name' => 'Matematika Peminatan', 'jp' => 4, 'program_id' => $mipa->program_id, 'description' => 'Matematika untuk kelas MIPA']);
        $subFisika = Subject::create(['subject_code' => 'FIS-MIPA', 'subject_name' => 'Fisika', 'jp' => 4, 'program_id' => $mipa->program_id, 'description' => 'Fisika untuk kelas MIPA']);
        $subKimia = Subject::create(['subject_code' => 'KIM-MIPA', 'subject_name' => 'Kimia', 'jp' => 4, 'program_id' => $mipa->program_id, 'description' => 'Kimia untuk kelas MIPA']);
        $subBiologi = Subject::create(['subject_code' => 'BIO-MIPA', 'subject_name' => 'Biologi', 'jp' => 4, 'program_id' => $mipa->program_id, 'description' => 'Biologi untuk kelas MIPA']);

        // IPS Subjects
        $subEkonomi = Subject::create(['subject_code' => 'EKO-IPS', 'subject_name' => 'Ekonomi', 'jp' => 4, 'program_id' => $ips->program_id, 'description' => 'Ekonomi untuk kelas IPS']);
        $subGeografi = Subject::create(['subject_code' => 'GEO-IPS', 'subject_name' => 'Geografi', 'jp' => 4, 'program_id' => $ips->program_id, 'description' => 'Geografi untuk kelas IPS']);
        $subSosiologi = Subject::create(['subject_code' => 'SOS-IPS', 'subject_name' => 'Sosiologi', 'jp' => 4, 'program_id' => $ips->program_id, 'description' => 'Sosiologi untuk kelas IPS']);
        $subSejarah = Subject::create(['subject_code' => 'SEJ-IPS', 'subject_name' => 'Sejarah Peminatan', 'jp' => 4, 'program_id' => $ips->program_id, 'description' => 'Sejarah untuk kelas IPS']);

        // 7. Create Curriculums
        // Semester 1 MIPA
        Curriculum::create(['program_id' => $mipa->program_id, 'subject_id' => $subAgama->subject_id, 'semester' => 1, 'category' => 'MKU']);
        Curriculum::create(['program_id' => $mipa->program_id, 'subject_id' => $subIndo->subject_id, 'semester' => 1, 'category' => 'MKU']);
        Curriculum::create(['program_id' => $mipa->program_id, 'subject_id' => $subMatMinat->subject_id, 'semester' => 1, 'category' => 'WAJIB_PRODI']);
        Curriculum::create(['program_id' => $mipa->program_id, 'subject_id' => $subFisika->subject_id, 'semester' => 1, 'category' => 'WAJIB_PRODI']);
        Curriculum::create(['program_id' => $mipa->program_id, 'subject_id' => $subKimia->subject_id, 'semester' => 1, 'category' => 'WAJIB_PRODI']);
        Curriculum::create(['program_id' => $mipa->program_id, 'subject_id' => $subBiologi->subject_id, 'semester' => 1, 'category' => 'WAJIB_PRODI']);

        // Semester 1 IPS
        Curriculum::create(['program_id' => $ips->program_id, 'subject_id' => $subAgama->subject_id, 'semester' => 1, 'category' => 'MKU']);
        Curriculum::create(['program_id' => $ips->program_id, 'subject_id' => $subIndo->subject_id, 'semester' => 1, 'category' => 'MKU']);
        Curriculum::create(['program_id' => $ips->program_id, 'subject_id' => $subEkonomi->subject_id, 'semester' => 1, 'category' => 'WAJIB_PRODI']);
        Curriculum::create(['program_id' => $ips->program_id, 'subject_id' => $subGeografi->subject_id, 'semester' => 1, 'category' => 'WAJIB_PRODI']);
        Curriculum::create(['program_id' => $ips->program_id, 'subject_id' => $subSosiologi->subject_id, 'semester' => 1, 'category' => 'WAJIB_PRODI']);
        Curriculum::create(['program_id' => $ips->program_id, 'subject_id' => $subSejarah->subject_id, 'semester' => 1, 'category' => 'WAJIB_PRODI']);

        // 8. Create Dummy Schedules for Class X MIPA 1
        $monday = 1;
        $tuesday = 2;
        $wednesday = 3;
        $thursday = 4;
        $friday = 5;

        // Monday
        Schedule::create([
            'student_class_id' => $class1->student_class_id,
            'subject_id' => $subIndo->subject_id,
            'teacher_id' => $teachers[0]->user_id, // assuming someone teaches Indo
            'room_id' => $rooms[0]->room_id,
            'day_of_week' => $monday,
            'start_time' => '07:30:00',
            'end_time' => '09:00:00'
        ]);
        Schedule::create([
            'student_class_id' => $class1->student_class_id,
            'subject_id' => $subMatMinat->subject_id,
            'teacher_id' => $teachers[0]->user_id, // Budi (Matematika)
            'room_id' => $rooms[0]->room_id,
            'day_of_week' => $monday,
            'start_time' => '09:15:00',
            'end_time' => '10:45:00'
        ]);

        // Tuesday
        Schedule::create([
            'student_class_id' => $class1->student_class_id,
            'subject_id' => $subFisika->subject_id,
            'teacher_id' => $teachers[1]->user_id, // Siti (Fisika)
            'room_id' => $rooms[4]->room_id, // Lab Fisika
            'day_of_week' => $tuesday,
            'start_time' => '07:30:00',
            'end_time' => '09:00:00'
        ]);

        // Wednesday
        Schedule::create([
            'student_class_id' => $class1->student_class_id,
            'subject_id' => $subKimia->subject_id,
            'teacher_id' => $teachers[2]->user_id, // Ahmad (Kimia)
            'room_id' => $rooms[0]->room_id,
            'day_of_week' => $wednesday,
            'start_time' => '07:30:00',
            'end_time' => '09:00:00'
        ]);

        // Thursday
        Schedule::create([
            'student_class_id' => $class1->student_class_id,
            'subject_id' => $subBiologi->subject_id,
            'teacher_id' => $teachers[3]->user_id, // Sri (Biologi)
            'room_id' => $rooms[5]->room_id, // Lab Biologi
            'day_of_week' => $thursday,
            'start_time' => '07:30:00',
            'end_time' => '09:00:00'
        ]);

        // Friday
        Schedule::create([
            'student_class_id' => $class1->student_class_id,
            'subject_id' => $subAgama->subject_id,
            'teacher_id' => $legacyTeacher->user_id,
            'room_id' => $rooms[0]->room_id,
            'day_of_week' => $friday,
            'start_time' => '07:30:00',
            'end_time' => '09:00:00'
        ]);
        Schedule::create([
            'student_class_id' => $class1->student_class_id,
            'subject_id' => $subPjok->subject_id,
            'teacher_id' => $legacyTeacher->user_id,
            'room_id' => $rooms[0]->room_id,
            'day_of_week' => $friday,
            'start_time' => '09:15:00',
            'end_time' => '10:45:00'
        ]);
    }
}

function Schema_disable_checks_if_needed() {
    $driver = DB::getDriverName();
    if ($driver == 'sqlite') {
        DB::statement('PRAGMA foreign_keys = OFF');
    } elseif ($driver == 'mysql') {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
    } elseif ($driver == 'pgsql') {
        DB::statement("SET CONSTRAINTS ALL DEFERRED");
    }
}
