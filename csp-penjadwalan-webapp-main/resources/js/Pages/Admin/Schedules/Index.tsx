import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader, Card, Button, Badge } from '@/Components/ReusableUI';
import Icon from '@/Components/Icon';
import useTranslation from '@/Hooks/useTranslation';

interface ScheduleItem {
    schedule_id: number;
    student_class: { class_name: string; };
    subject: { subject_name: string; };
    teacher: { full_name: string; };
    room: { room_name: string; };
    start_time: string;
    end_time: string;
}

interface IndexProps {
    auth: any;
    schedules: { [key: number]: ScheduleItem[] };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
};

const ScheduleIndex: React.FC<IndexProps> = ({ auth, schedules }) => {
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        if (confirm('Are you sure you want to run the CSP Engine? This will overwrite the current schedule and may take a few seconds.')) {
            setIsGenerating(true);
            router.post(route('admin.schedules.generate'), {}, {
                onFinish: () => setIsGenerating(false),
            });
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={t('AI Schedule Generation')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('AI Schedule Generation')}
                    subtitle={t('Use the Constraint Satisfaction Problem (CSP) Engine to automatically generate a conflict-free master timetable.')}
                    actionLabel={isGenerating ? t('Generating...') : t('Run CSP Engine')}
                    onAction={isGenerating ? undefined : handleGenerate}
                    actionIcon={isGenerating ? "hourglass_empty" : "smart_toy"}
                />

                <Card className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <h3 className="text-lg font-bold">{t('Generated Master Timetable')}</h3>
                    </div>
                    
                    {Object.keys(schedules).length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Icon name="calendar_today" className="text-6xl mb-4 text-gray-300" />
                            <p className="text-lg">No schedules generated yet.</p>
                            <p className="text-sm">Click "Run CSP Engine" to build the timetable.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="min-w-[1000px] flex gap-4">
                                {DAYS.map((dayName, index) => {
                                    const dayNum = index + 1;
                                    const daySchedules = schedules[dayNum] || [];

                                    return (
                                        <div key={dayNum} className="flex-1 min-w-[250px] flex flex-col gap-3">
                                            <div className="text-center font-bold py-2 border-b-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                                {dayName}
                                            </div>
                                            
                                            <div className="flex flex-col gap-3 h-[600px] overflow-y-auto pr-2">
                                                {daySchedules.length > 0 ? (
                                                    daySchedules.map(sch => (
                                                        <div key={sch.schedule_id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-sm flex flex-col gap-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <Badge variant="primary">{sch.student_class.class_name}</Badge>
                                                                <span className="text-xs font-bold text-gray-500">
                                                                    {formatTime(sch.start_time)} - {formatTime(sch.end_time)}
                                                                </span>
                                                            </div>
                                                            <div className="font-semibold text-gray-900 dark:text-white leading-tight">
                                                                {sch.subject.subject_name}
                                                            </div>
                                                            <div className="text-xs flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                                <Icon name="person" className="text-[14px]" />
                                                                <span className="truncate">{sch.teacher.full_name}</span>
                                                            </div>
                                                            <div className="text-xs flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                                <Icon name="room" className="text-[14px]" />
                                                                <span className="truncate">{sch.room.room_name}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                        No classes
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ScheduleIndex;
