import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader, Card, Badge } from '../../../Components/ReusableUI';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import Icon from '../../../Components/Icon';

interface BillingsProps {
    billings: any;
    costComponents: any[];
    classes: any[];
}

const BillingsIndex: React.FC<BillingsProps> = ({ billings, costComponents, classes }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        cost_component_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        student_class_id: '',
        due_date: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.billings.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    return (
        <AdminLayout>
            <Head title="Student Billings" />
            <div className="flex flex-col gap-6 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <PageHeader 
                        title="Student Billings" 
                        subtitle="Generate and manage monthly tuition bills."
                    />
                    <PrimaryButton onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                        <Icon name="receipt" />
                        <span>Generate Bills</span>
                    </PrimaryButton>
                </div>

                {/* Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-background-dark/30 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {billings.data.map((billing: any) => (
                                    <tr key={billing.billing_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50">
                                        <td className="px-6 py-4 text-sm font-bold text-primary">
                                            {billing.student?.full_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {billing.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {formatCurrency(billing.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(billing.due_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={billing.status === 'paid' ? 'success' : (billing.status === 'overdue' ? 'danger' : 'warning')}>
                                                {billing.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {billings.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No bills generated yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="md">
                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Generate Monthly Bills</h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Create new invoices for students.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <InputLabel value="Cost Component (e.g. SPP)" />
                                <select
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary focus:ring-primary rounded-md shadow-sm"
                                    onChange={(e) => setData('cost_component_id', e.target.value)}
                                    value={data.cost_component_id}
                                    required
                                >
                                    <option value="" disabled>Select cost component...</option>
                                    {costComponents.map(opt => (
                                        <option key={opt.cost_component_id} value={opt.cost_component_id}>
                                            {opt.component_name} - {formatCurrency(opt.amount)}
                                        </option>
                                    ))}
                                </select>
                                {errors.cost_component_id && <p className="text-red-500 text-xs mt-1">{errors.cost_component_id}</p>}
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <InputLabel value="Month" />
                                    <select
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary focus:ring-primary rounded-md shadow-sm"
                                        onChange={(e) => setData('month', parseInt(e.target.value))}
                                        value={data.month}
                                        required
                                    >
                                        {months.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <InputLabel value="Year" />
                                    <input
                                        type="number"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary focus:ring-primary rounded-md shadow-sm"
                                        onChange={(e) => setData('year', parseInt(e.target.value))}
                                        value={data.year}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Target Class (Leave blank for ALL students)" />
                                <select
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary focus:ring-primary rounded-md shadow-sm"
                                    onChange={(e) => setData('student_class_id', e.target.value)}
                                    value={data.student_class_id}
                                >
                                    <option value="">All Students</option>
                                    {classes.map(opt => (
                                        <option key={opt.student_class_id} value={opt.student_class_id}>
                                            {opt.class_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel value="Due Date" />
                                <input
                                    type="date"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary focus:ring-primary rounded-md shadow-sm"
                                    onChange={(e) => setData('due_date', e.target.value)}
                                    value={data.due_date}
                                    required
                                />
                                {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing} type="submit">Generate Bills</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default BillingsIndex;
