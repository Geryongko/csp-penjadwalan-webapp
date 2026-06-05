import React from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import Icon from '@/Components/Icon';
import { Card, Table, Thead, Tbody, Th, Td, EmptyState, Badge } from '@/Components/ReusableUI';
import useTranslation from '@/Hooks/useTranslation';

interface DashboardProps {
    auth: any;
    teacher: any;
    todaySchedule: any[];
    assignments: any[];
}

const TeacherDashboard: React.FC<DashboardProps> = ({ auth, teacher, todaySchedule, assignments }) => {
  const profile = teacher.lecturer_profile;
  const { t } = useTranslation();

  return (
    <TeacherLayout user={teacher}>
      <Head title={t('Dashboard')} />

      <div className="space-y-8 animate-fade-in-up">

        <div className="bg-white dark:bg-[#19222c] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
           <div
              className="size-20 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center border-2 border-primary flex-shrink-0 flex items-center justify-center text-3xl font-bold text-gray-400"
              style={teacher.profile_picture ? { backgroundImage: `url(${teacher.profile_picture})` } : {}}
           >
              {!teacher.profile_picture && teacher.full_name.charAt(0)}
           </div>

           <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Welcome back')}, {teacher.full_name}</h1>
              <p className="text-gray-500 dark:text-gray-400">
                  {profile?.lecturer_number || 'NIP/NUPTK not set'} • {profile?.position || 'Teacher'}
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="p-0 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Icon name="event" className="text-primary" /> {t('My Schedule Today')}
                    </h3>
                </div>
                <div className="flex-1 overflow-auto">
                    <Table>
                        <Thead>
                            <Th>{t('Time')}</Th>
                            <Th>{t('Class')}</Th>
                            <Th>{t('Subject')}</Th>
                            <Th>{t('Room')}</Th>
                        </Thead>
                        <Tbody>
                            {todaySchedule && todaySchedule.length > 0 ? todaySchedule.map(schedule => (
                                <tr key={schedule.schedule_id}>
                                    <Td className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                        {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                    </Td>
                                    <Td><Badge variant="info">{schedule.student_class?.class_name}</Badge></Td>
                                    <Td>{schedule.subject?.subject_name}</Td>
                                    <Td>{schedule.room?.room_name}</Td>
                                </tr>
                            )) : (
                                <EmptyState message={t('No classes scheduled for today.')} colSpan={4} />
                            )}
                        </Tbody>
                    </Table>
                </div>
           </Card>
           
           <Card className="p-0 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Icon name="class" className="text-primary" /> {t('My Classes')}
                    </h3>
                    <Link href={route('teacher.attendance.index')} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                        {t('View All')} <Icon name="arrow_forward" className="text-xs" />
                    </Link>
                </div>
                <div className="flex-1 overflow-auto">
                    <Table>
                        <Thead>
                            <Th>{t('Class')}</Th>
                            <Th>{t('Subject')}</Th>
                            <Th>{t('Academic Year')}</Th>
                        </Thead>
                        <Tbody>
                            {assignments && assignments.length > 0 ? assignments.map(assignment => (
                                <tr key={assignment.assignment_id}>
                                    <Td><Badge variant="info">{assignment.student_class?.class_name}</Badge></Td>
                                    <Td className="font-medium text-gray-900 dark:text-white">{assignment.subject?.subject_name}</Td>
                                    <Td>{assignment.academic_year}</Td>
                                </tr>
                            )) : (
                                <EmptyState message={t('You are not assigned to teach any classes.')} colSpan={3} />
                            )}
                        </Tbody>
                    </Table>
                </div>
           </Card>
        </div>

      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
