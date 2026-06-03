import React from 'react';
import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { PageHeader, Card, Badge, Button } from '../../Components/ReusableUI';
import Icon from '../../Components/Icon';
import useTranslation from '../../Hooks/useTranslation';
import { format, parse } from 'date-fns';

interface ScheduleItem {
    schedule_id: number;
    subject: { subject_name: string; subject_code: string; };
    teacher: { full_name: string; };
    room: { room_name: string; };
    day_of_week: number;
    start_time: string;
    end_time: string;
}

interface DashboardProps {
    auth: any;
    student: any;
    dashboardData: {
        semester_level: number;
        active_semester_name: string;
        student_class_name: string;
    };
    todaySchedule: ScheduleItem[];
    weeklySchedule: { [key: number]: ScheduleItem[] };
    todayDayNumber: number;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const formatTime = (timeString: string) => {
    try {
        const parsed = parse(timeString, 'HH:mm:ss', new Date());
        return format(parsed, 'HH:mm');
    } catch {
        return timeString;
    }
};

const StudentDashboard: React.FC<DashboardProps> = ({ auth, student, dashboardData, todaySchedule, weeklySchedule, todayDayNumber }) => {
  const profile = student.student_profile;
  const { t } = useTranslation();

  return (
    <StudentLayout user={student}>
      <Head title={t('Dashboard')} />

      <div className="space-y-8 animate-fade-in-up">

        <div className="bg-white dark:bg-[#19222c] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
           <div
              className="size-20 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center border-2 border-primary flex-shrink-0 flex items-center justify-center text-3xl font-bold text-gray-400"
              style={student.profile_picture ? { backgroundImage: `url(${student.profile_picture})` } : {}}
           >
              {!student.profile_picture && student.full_name.charAt(0)}
           </div>

           <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Welcome back')}, {student.full_name}</h1>
              <p className="text-gray-500 dark:text-gray-400">
                  {profile?.student_number || 'No NIS'} • {dashboardData.student_class_name}
              </p>

              <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                  <Badge variant="primary">{dashboardData.active_semester_name}</Badge>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Today's Schedule */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Icon name="today" className="text-primary" />
                            {t("Today's Schedule")}
                        </h3>
                        <Badge variant="info">{DAYS[todayDayNumber - 1]}</Badge>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        {todaySchedule && todaySchedule.length > 0 ? (
                            todaySchedule.map(sch => (
                                <div key={sch.schedule_id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex items-start gap-4">
                                    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm w-16 flex-shrink-0">
                                        <span className="text-sm font-bold text-primary">{formatTime(sch.start_time)}</span>
                                        <span className="text-xs text-gray-400 font-medium">to</span>
                                        <span className="text-sm font-bold text-primary">{formatTime(sch.end_time)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={sch.subject.subject_name}>
                                            {sch.subject.subject_name}
                                        </h4>
                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                            <Icon name="person" className="text-sm" />
                                            <span className="truncate" title={sch.teacher.full_name}>{sch.teacher.full_name}</span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                            <Icon name="room" className="text-sm" />
                                            <span className="truncate">{sch.room.room_name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
                                <Icon name="sentiment_satisfied" className="text-5xl text-gray-300 dark:text-gray-600 mb-3" />
                                <p>No classes scheduled for today.</p>
                                <p className="text-sm mt-1">Enjoy your free time!</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Right Column: Weekly Schedule */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Icon name="calendar_month" className="text-primary" />
                            {t("Weekly Timetable")}
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[700px] grid grid-cols-5 gap-4">
                            {DAYS.map((dayName, index) => {
                                const dayNum = index + 1;
                                const daySchedules = weeklySchedule[dayNum] || [];
                                const isToday = dayNum === todayDayNumber;

                                return (
                                    <div key={dayNum} className={`flex flex-col gap-3 ${isToday ? 'bg-primary/5 dark:bg-primary/10 rounded-xl p-2 -m-2 border border-primary/20' : ''}`}>
                                        <div className={`text-center font-bold py-2 border-b-2 ${isToday ? 'text-primary border-primary' : 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
                                            {dayName}
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            {daySchedules.length > 0 ? (
                                                daySchedules.map(sch => (
                                                    <div key={sch.schedule_id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-sm hover:border-primary/50 transition-colors">
                                                        <div className="font-semibold text-gray-900 dark:text-white mb-1 leading-tight line-clamp-2">
                                                            {sch.subject.subject_name}
                                                        </div>
                                                        <div className="text-xs font-medium text-primary mb-1">
                                                            {formatTime(sch.start_time)} - {formatTime(sch.end_time)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {sch.room.room_name}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-xs text-gray-400 dark:text-gray-600 italic">
                                                    Empty
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            </div>
            
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
