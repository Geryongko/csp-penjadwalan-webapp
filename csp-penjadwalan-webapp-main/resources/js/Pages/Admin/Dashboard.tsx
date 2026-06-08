import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatsCard from './StatsCard';
import { PageHeader, Card, Badge } from '../../Components/ReusableUI';
import Icon from '../../Components/Icon';
import useTranslation from '@/Hooks/useTranslation';



interface DashboardProps {
    auth: any;
    stats: {
        students: { total: number; new_this_month: number; };
        lecturers: { total: number; };
        subjects: { total: number; };
    };

}

const Dashboard: React.FC<DashboardProps> = ({ auth, stats }) => {
  const { t } = useTranslation();

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusVariant = (status: string) => {
      switch (status) {
          case 'settlement': case 'capture': case 'paid': return 'success';
          case 'pending': return 'warning';
          case 'deny': case 'expire': case 'cancel': return 'error';
          default: return 'gray';
      }
  };

  return (
    <AdminLayout user={auth.user}>
      <Head title={t('Dashboard')} />

      <div className="space-y-8 animate-fade-in-up">
        <PageHeader
          title={t('Dashboard')}
          subtitle={`${t('Welcome back')}, ${auth.user.full_name}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title={t('Total Students')}
            value={stats.students.total.toLocaleString()}
            trend={stats.students.new_this_month > 0
                ? `+${stats.students.new_this_month} ${t('this month')}`
                : t('No new students')}
            trendType={stats.students.new_this_month > 0 ? "positive" : "neutral"}
            icon="school"
            color="info"
          />
          <StatsCard
            title={t('Total Instructors')}
            value={stats.lecturers.total.toLocaleString()}
            trend={t('Active Faculty')}
            trendType="neutral"
            icon="cast_for_education"
            color="warning"
          />
          <StatsCard
            title={t('Active Subjects')}
            value={stats.subjects?.total?.toString() || "0"}
            trend={t('Current Curriculum')}
            trendType="neutral"
            icon="menu_book"
            color="primary"
          />
        </div>


      </div>
    </AdminLayout>
  );
};

export default Dashboard;
