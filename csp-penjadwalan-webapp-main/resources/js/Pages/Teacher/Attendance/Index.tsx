import React from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import Icon from '@/Components/Icon';
import { PageHeader, Card } from '@/Components/ReusableUI';
import useTranslation from '@/Hooks/useTranslation';
import { TeachingAssignment } from '@/types';

interface IndexProps {
    auth: any;
    assignments: TeachingAssignment[];
}

const AttendanceIndex: React.FC<IndexProps> = ({ auth, assignments }) => {
    const { t } = useTranslation();

    return (
        <TeacherLayout user={auth.user}>
            <Head title={t('Presensi Siswa')} />

            <div className="flex flex-col gap-6 animate-fade-in-up">
                <PageHeader 
                    title={t('Presensi Siswa')} 
                    subtitle={t('Pilih kelas untuk mengelola presensi / kehadiran siswa.')}
                    actionIcon="checklist"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.length > 0 ? assignments.map(assignment => (
                        <Link key={assignment.assignment_id} href={route('teacher.attendance.show', assignment.assignment_id)}>
                            <Card className="hover:shadow-xl transition-all cursor-pointer h-full border-2 border-transparent hover:border-primary group">
                                <div className="p-6 flex flex-col h-full gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Icon name="class" className="text-2xl" />
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-500">
                                            {assignment.academic_year}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                                            {assignment.subject?.subject_name}
                                        </h3>
                                        <p className="text-gray-500 flex items-center gap-2">
                                            <Icon name="group" className="text-sm" /> 
                                            {assignment.student_class?.class_name}
                                        </p>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm font-medium text-primary">
                                        <span>Kelola Presensi</span>
                                        <Icon name="arrow_forward" />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    )) : (
                        <div className="col-span-full p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <div className="size-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <Icon name="sentiment_dissatisfied" className="text-3xl text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('Belum Ada Kelas')}</h3>
                            <p className="text-gray-500">{t('Anda belum ditugaskan untuk mengajar kelas apapun pada semester ini.')}</p>
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
};

export default AttendanceIndex;
