import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import Icon from '@/Components/Icon';
import { PageHeader, Card, Table, Thead, Tbody, Th, Td, Button, Input } from '@/Components/ReusableUI';
import useTranslation from '@/Hooks/useTranslation';
import { TeachingAssignment } from '@/types';

interface AttendanceRecord {
    attendance_id: number;
    student_id: number;
    status: 'present' | 'absent' | 'late' | 'excused';
    note: string | null;
    student: {
        user_id: number;
        full_name: string;
        student_profile?: {
            student_number: string;
        };
    };
}

interface FormProps {
    auth: any;
    assignment: TeachingAssignment;
    session: any;
    attendances: AttendanceRecord[];
}

const AttendanceForm: React.FC<FormProps> = ({ auth, assignment, session, attendances }) => {
    const { t } = useTranslation();

    const { data, setData, put, processing } = useForm({
        topic: session.topic || '',
        session_type: session.session_type || 'regular',
        attendances: attendances.map(a => ({
            attendance_id: a.attendance_id,
            status: a.status,
            note: a.note || ''
        }))
    });

    const handleStatusChange = (index: number, status: 'present' | 'absent' | 'late' | 'excused') => {
        const newAttendances = [...data.attendances];
        newAttendances[index].status = status;
        setData('attendances', newAttendances);
    };

    const handleNoteChange = (index: number, note: string) => {
        const newAttendances = [...data.attendances];
        newAttendances[index].note = note;
        setData('attendances', newAttendances);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('teacher.attendance.updateAttendance', { assignmentId: assignment.assignment_id, sessionId: session.session_id }));
    };

    const statusOptions = [
        { value: 'present', label: 'Hadir', color: 'bg-green-100 text-green-700 border-green-300' },
        { value: 'excused', label: 'Izin', color: 'bg-blue-100 text-blue-700 border-blue-300' },
        { value: 'absent', label: 'Sakit / Alpa', color: 'bg-red-100 text-red-700 border-red-300' },
        { value: 'late', label: 'Terlambat', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    ];

    return (
        <TeacherLayout user={auth.user}>
            <Head title={`${t('Presensi')} - Pertemuan ${session.session_number}`} />

            <div className="flex flex-col gap-6 animate-fade-in-up">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-[-1rem]">
                    <Link href={route('teacher.attendance.show', assignment.assignment_id)} className="hover:text-primary transition-colors flex items-center gap-1">
                        <Icon name="arrow_back" className="text-xs" /> {t('Kembali ke Daftar Pertemuan')}
                    </Link>
                </div>

                <PageHeader 
                    title={`Isi Presensi: Pertemuan ${session.session_number}`} 
                    subtitle={`${assignment.subject?.subject_name} - ${assignment.student_class?.class_name} | Tanggal: ${new Date(session.session_date).toLocaleDateString('id-ID')}`}
                    actionLabel="Simpan Presensi"
                    actionIcon="save"
                    onAction={handleSubmit}
                    isActionLoading={processing}
                />

                <Card className="overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Jenis Pertemuan</label>
                                <select 
                                    className="w-full max-w-xs border-gray-300 focus:border-primary focus:ring-primary rounded-md shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={data.session_type}
                                    onChange={e => setData('session_type', e.target.value)}
                                >
                                    <option value="regular">Regular (Tatap Muka Biasa)</option>
                                    <option value="uts">Ujian Tengah Semester (UTS)</option>
                                    <option value="uas">Ujian Akhir Semester (UAS)</option>
                                    <option value="holiday">Libur / Dibatalkan</option>
                                </select>
                            </div>
                            <div className="flex-[2]">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Materi / Topik Pembahasan Hari Ini</label>
                                <Input 
                                    type="text"
                                    value={data.topic}
                                    onChange={e => setData('topic', e.target.value)}
                                    placeholder="Contoh: Pengantar Aljabar Linier"
                                    className="w-full"
                                    required
                                />
                            </div>
                        </div>

                        {data.session_type !== 'holiday' ? (
                            <Table>
                                <Thead>
                                    <Th className="w-12 text-center">No</Th>
                                    <Th>NIM / NIS</Th>
                                    <Th>Nama Siswa</Th>
                                    <Th>Status Kehadiran</Th>
                                    <Th>Keterangan (Opsional)</Th>
                                </Thead>
                                <Tbody>
                                    {attendances.map((record, index) => (
                                        <tr key={record.attendance_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <Td className="text-center text-gray-500 font-medium">{index + 1}</Td>
                                            <Td className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                                {record.student.student_profile?.student_number || '-'}
                                            </Td>
                                            <Td className="font-bold text-gray-900 dark:text-white">
                                                {record.student.full_name}
                                            </Td>
                                            <Td>
                                                <div className="flex flex-wrap gap-2">
                                                    {statusOptions.map(option => {
                                                        const isSelected = data.attendances[index].status === option.value;
                                                        return (
                                                            <button
                                                                key={option.value}
                                                                type="button"
                                                                onClick={() => handleStatusChange(index, option.value as any)}
                                                                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                                                                    isSelected 
                                                                        ? `${option.color} ring-2 ring-offset-1 ring-${option.color.split('-')[1]}-500 shadow-sm` 
                                                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                {option.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </Td>
                                            <Td>
                                                <Input 
                                                    type="text" 
                                                    value={data.attendances[index].note} 
                                                    onChange={e => handleNoteChange(index, e.target.value)}
                                                    placeholder="Tambahkan catatan..."
                                                    className="h-8 text-sm"
                                                />
                                            </Td>
                                        </tr>
                                    ))}
                                </Tbody>
                            </Table>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <Icon name="event_busy" className="text-4xl text-gray-400 mb-2" />
                                <p>Hari libur atau pertemuan dibatalkan. Tidak perlu mengisi presensi siswa.</p>
                            </div>
                        )}
                        
                        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex justify-between items-center">
                            <p className="text-sm text-gray-500">Pastikan semua data sudah benar sebelum menyimpan.</p>
                            <Button type="submit" isLoading={processing} size="lg">
                                <Icon name="save" /> {data.session_type === 'holiday' ? 'Simpan Status Libur' : 'Simpan Data Presensi'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </TeacherLayout>
    );
};

export default AttendanceForm;
