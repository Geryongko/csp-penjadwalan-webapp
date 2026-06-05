import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import Icon from '@/Components/Icon';
import { PageHeader, Card, Table, Thead, Tbody, Th, Td, Badge, Button, Modal, Input, Label, EmptyState } from '@/Components/ReusableUI';
import useTranslation from '@/Hooks/useTranslation';
import { TeachingAssignment } from '@/types';

interface ClassSession {
    session_id: number;
    session_date: string;
    session_number: number;
    topic: string;
    attendances_count?: number;
}

interface ShowProps {
    auth: any;
    assignment: TeachingAssignment;
    sessions: ClassSession[];
    totalStudents: number;
}

const AttendanceShow: React.FC<ShowProps> = ({ auth, assignment, sessions, totalStudents }) => {
    const { t } = useTranslation();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        session_number: sessions.length + 1,
        session_date: new Date().toISOString().split('T')[0],
        topic: ''
    });

    const handleOpenAdd = () => {
        reset();
        setData('session_number', sessions.length + 1);
        setIsAddModalOpen(true);
    };

    const handleCreateSession = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('teacher.attendance.storeSession', assignment.assignment_id), {
            onSuccess: () => setIsAddModalOpen(false)
        });
    };

    return (
        <TeacherLayout user={auth.user}>
            <Head title={`${t('Presensi')} - ${assignment.subject?.subject_name}`} />

            <div className="flex flex-col gap-6 animate-fade-in-up">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-[-1rem]">
                    <Link href={route('teacher.attendance.index')} className="hover:text-primary transition-colors flex items-center gap-1">
                        <Icon name="arrow_back" className="text-xs" /> {t('Kembali ke Daftar Kelas')}
                    </Link>
                </div>

                <PageHeader 
                    title={assignment.subject?.subject_name || 'Subject'} 
                    subtitle={`Kelas: ${assignment.student_class?.class_name} | Total Siswa: ${totalStudents} | Tahun: ${assignment.academic_year}`}
                />

                <Card className="overflow-hidden">
                    <Table>
                        <Thead>
                            <Th>Pertemuan Ke-</Th>
                            <Th>Tanggal</Th>
                            <Th>Materi / Topik</Th>
                            <Th>Status Presensi</Th>
                            <Th className="text-right">Aksi</Th>
                        </Thead>
                        <Tbody>
                            {sessions.length > 0 ? sessions.map(session => {
                                const isComplete = session.attendances_count === totalStudents;
                                
                                const handleEditClick = (e: React.MouseEvent) => {
                                    e.preventDefault();
                                    if (session.is_virtual) {
                                        router.post(route('teacher.attendance.initSession', assignment.assignment_id), {
                                            session_date: session.session_date,
                                            session_number: session.session_number,
                                            topic: session.topic
                                        });
                                    } else {
                                        router.visit(route('teacher.attendance.editSession', { assignmentId: assignment.assignment_id, sessionId: session.session_id }));
                                    }
                                };

                                return (
                                    <tr key={session.session_date} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${session.session_type === 'holiday' ? 'opacity-60 bg-gray-50 dark:bg-gray-800/30' : ''}`}>
                                        <Td className="font-bold text-gray-900 dark:text-white">
                                            {session.session_number ? `Pertemuan ${session.session_number}` : '-'}
                                        </Td>
                                        <Td>
                                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                <Icon name="calendar_today" className="text-sm" />
                                                {new Date(session.session_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </Td>
                                        <Td className="text-gray-600 dark:text-gray-300 max-w-xs truncate" title={session.topic}>
                                            {session.session_type === 'uts' && <Badge variant="warning" className="mr-2">UTS</Badge>}
                                            {session.session_type === 'uas' && <Badge variant="danger" className="mr-2">UAS</Badge>}
                                            {session.session_type === 'holiday' && <Badge variant="secondary" className="mr-2">Libur</Badge>}
                                            {session.topic}
                                        </Td>
                                        <Td>
                                            {session.is_virtual ? (
                                                <Badge variant="secondary">Belum Diisi</Badge>
                                            ) : session.session_type === 'holiday' ? (
                                                <span className="text-sm text-gray-400 italic">Tidak ada presensi</span>
                                            ) : (
                                                <Badge variant={isComplete ? 'success' : 'warning'}>
                                                    {session.attendances_count} / {totalStudents} Siswa
                                                </Badge>
                                            )}
                                        </Td>
                                        <Td className="text-right">
                                            <Button onClick={handleEditClick} variant="secondary" className="px-3 py-1.5 text-sm">
                                                <Icon name="edit_document" /> {t(session.is_virtual ? 'Isi Presensi' : 'Edit Presensi')}
                                            </Button>
                                        </Td>
                                    </tr>
                                );
                            }) : (
                                <EmptyState 
                                    message="Belum ada pertemuan yang digenerate untuk semester ini." 
                                    colSpan={5} 
                                />
                            )}
                        </Tbody>
                    </Table>
                </Card>
            </div>
        </TeacherLayout>
    );
};

export default AttendanceShow;
