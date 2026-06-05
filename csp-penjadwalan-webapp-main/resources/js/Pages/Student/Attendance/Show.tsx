import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import Icon from '@/Components/Icon';
import { PageHeader, Card, Table, Thead, Tbody, Th, Td, Badge, EmptyState } from '@/Components/ReusableUI';
import useTranslation from '@/Hooks/useTranslation';

interface SessionDetail {
    session: {
        session_id: number;
        session_number: number;
        session_date: string;
        topic: string;
    };
    attendance: {
        status: string;
        note?: string;
    } | null;
}

interface ShowProps {
    auth: any;
    assignment: {
        assignment_id: number;
        subject: {
            subject_name: string;
        };
        teacher: {
            full_name: string;
        };
        student_class: {
            class_name: string;
        };
    };
    sessionDetails: SessionDetail[];
}

const StudentAttendanceShow: React.FC<ShowProps> = ({ auth, assignment, sessionDetails }) => {
    const { t } = useTranslation();

    const getStatusBadge = (status?: string) => {
        if (!status) return <span className="text-gray-400 italic">Belum Diisi</span>;
        
        switch (status) {
            case 'present':
                return <Badge variant="success">Hadir</Badge>;
            case 'absent':
                return <Badge variant="danger">Sakit / Alpa</Badge>;
            case 'late':
                return <Badge variant="warning">Terlambat</Badge>;
            case 'excused':
                return <Badge variant="info">Izin</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <StudentLayout user={auth.user}>
            <Head title={`${t('Kehadiran')} - ${assignment.subject?.subject_name}`} />

            <div className="flex flex-col gap-6 animate-fade-in-up">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-[-1rem]">
                    <Link href={route('student.attendance.index')} className="hover:text-primary transition-colors flex items-center gap-1">
                        <Icon name="arrow_back" className="text-xs" /> {t('Kembali ke Rekap Kehadiran')}
                    </Link>
                </div>

                <PageHeader 
                    title={assignment.subject?.subject_name} 
                    subtitle={`Guru: ${assignment.teacher?.full_name} | Kelas: ${assignment.student_class?.class_name}`}
                />

                <Card className="overflow-hidden">
                    <Table>
                        <Thead>
                            <Th className="w-24 text-center">Pertemuan</Th>
                            <Th className="w-48">Tanggal</Th>
                            <Th>Materi / Topik Pembahasan</Th>
                            <Th className="w-32 text-center">Status</Th>
                            <Th>Catatan Guru</Th>
                        </Thead>
                        <Tbody>
                            {sessionDetails.length > 0 ? sessionDetails.map((detail) => (
                                <tr key={detail.session.session_id || detail.session.session_date} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${detail.session.session_type === 'holiday' ? 'opacity-60 bg-gray-50 dark:bg-gray-800/30' : ''}`}>
                                    <Td className="text-center font-bold text-gray-900 dark:text-white">
                                        {detail.session.session_number ? `Ke-${detail.session.session_number}` : '-'}
                                    </Td>
                                    <Td>
                                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <Icon name="calendar_today" className="text-sm" />
                                            {new Date(detail.session.session_date).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </Td>
                                    <Td className="text-gray-600 dark:text-gray-300">
                                        {detail.session.session_type === 'uts' && <Badge variant="warning" className="mr-2">UTS</Badge>}
                                        {detail.session.session_type === 'uas' && <Badge variant="danger" className="mr-2">UAS</Badge>}
                                        {detail.session.session_type === 'holiday' && <Badge variant="secondary" className="mr-2">Libur</Badge>}
                                        {detail.session.topic}
                                    </Td>
                                    <Td className="text-center">
                                        {detail.session.session_type === 'holiday' ? (
                                            <span className="text-sm text-gray-400 italic">Libur</span>
                                        ) : detail.session.is_virtual ? (
                                            <Badge variant="secondary">Belum Diisi</Badge>
                                        ) : getStatusBadge(detail.attendance?.status)}
                                    </Td>
                                    <Td className="text-sm text-gray-500 italic">
                                        {detail.attendance?.note || '-'}
                                    </Td>
                                </tr>
                            )) : (
                                <EmptyState 
                                    message="Belum ada jadwal pertemuan untuk semester ini." 
                                    colSpan={5} 
                                />
                            )}
                        </Tbody>
                    </Table>
                </Card>
            </div>
        </StudentLayout>
    );
};

export default StudentAttendanceShow;
