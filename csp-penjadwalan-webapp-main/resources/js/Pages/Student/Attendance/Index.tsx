import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import Icon from '@/Components/Icon';
import { PageHeader, Card, Table, Thead, Tbody, Th, Td, Badge, EmptyState } from '@/Components/ReusableUI';
import useTranslation from '@/Hooks/useTranslation';

interface AttendanceSummary {
    assignment: {
        assignment_id: number;
        subject: {
            subject_name: string;
        };
        teacher: {
            full_name: string;
        };
    };
    total_sessions: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
}

interface IndexProps {
    auth: any;
    summary: AttendanceSummary[];
    studentClass?: {
        class_name: string;
    };
}

const StudentAttendanceIndex: React.FC<IndexProps> = ({ auth, summary, studentClass }) => {
    const { t } = useTranslation();

    const getPercentageColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200';
        if (percentage >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <StudentLayout user={auth.user}>
            <Head title={t('Kehadiran Saya')} />

            <div className="flex flex-col gap-6 animate-fade-in-up">
                <PageHeader 
                    title={t('Kehadiran Saya')} 
                    subtitle={studentClass ? `Kelas: ${studentClass.class_name}` : 'Belum terdaftar di kelas manapun.'}
                />

                <Card className="overflow-hidden">
                    <Table>
                        <Thead>
                            <Th>Mata Pelajaran</Th>
                            <Th>Guru</Th>
                            <Th className="text-center">Total Pertemuan</Th>
                            <Th className="text-center">Hadir</Th>
                            <Th className="text-center">Sakit/Alpa</Th>
                            <Th className="text-center">Izin</Th>
                            <Th className="text-center">Persentase</Th>
                            <Th className="text-right">Aksi</Th>
                        </Thead>
                        <Tbody>
                            {summary.length > 0 ? summary.map((item) => (
                                <tr key={item.assignment.assignment_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <Td className="font-bold text-gray-900 dark:text-white">
                                        {item.assignment.subject?.subject_name}
                                    </Td>
                                    <Td className="text-gray-600 dark:text-gray-400">
                                        {item.assignment.teacher?.full_name}
                                    </Td>
                                    <Td className="text-center">{item.total_sessions}</Td>
                                    <Td className="text-center font-medium text-green-600">{item.present}</Td>
                                    <Td className="text-center font-medium text-red-600">{item.absent}</Td>
                                    <Td className="text-center font-medium text-blue-600">{item.excused}</Td>
                                    <Td className="text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPercentageColor(item.percentage)}`}>
                                            {item.percentage}%
                                        </span>
                                    </Td>
                                    <Td className="text-right">
                                        <Link href={route('student.attendance.show', item.assignment.assignment_id)}>
                                            <button className="text-primary hover:text-primary-dark font-medium text-sm flex items-center justify-end gap-1 ml-auto">
                                                Detail <Icon name="chevron_right" className="text-xs" />
                                            </button>
                                        </Link>
                                    </Td>
                                </tr>
                            )) : (
                                <EmptyState 
                                    message="Belum ada data kehadiran." 
                                    colSpan={8} 
                                />
                            )}
                        </Tbody>
                    </Table>
                </Card>
            </div>
        </StudentLayout>
    );
};

export default StudentAttendanceIndex;
