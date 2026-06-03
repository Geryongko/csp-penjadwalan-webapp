import React from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { Card } from '@/Components/ReusableUI';
import useTranslation from '@/Hooks/useTranslation';

interface DashboardProps {
    auth: any;
    teacher: any;
}

const TeacherDashboard: React.FC<DashboardProps> = ({ auth, teacher }) => {
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
           <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Schedule Today</h3>
                <p className="text-gray-500 dark:text-gray-400">No classes scheduled for today.</p>
           </Card>
           
           <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Classes (Rombel)</h3>
                <p className="text-gray-500 dark:text-gray-400">You are not assigned as a homeroom teacher yet.</p>
           </Card>
        </div>

      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
