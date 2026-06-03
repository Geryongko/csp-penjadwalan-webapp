import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader, Card, Badge } from '../../../Components/ReusableUI';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import Icon from '../../../Components/Icon';

interface TeachingAssignmentProps {
    assignments: any[];
    teachers: any[];
    subjects: any[];
    classes: any[];
}

const TeachingAssignmentsIndex: React.FC<TeachingAssignmentProps> = ({ assignments, teachers, subjects, classes }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, put, processing, errors, reset, delete: destroy, clearErrors } = useForm({
        teacher_id: '',
        subject_id: '',
        student_class_id: ''
    });

    const filteredAssignments = useMemo(() => {
        return assignments.filter(assignment => 
            assignment.teacher?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.subject?.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.student_class?.class_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [assignments, searchQuery]);

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingId(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (assignment: any) => {
        clearErrors();
        setData({
            teacher_id: assignment.teacher_id,
            subject_id: assignment.subject_id,
            student_class_id: assignment.student_class_id
        });
        setEditingId(assignment.assignment_id);
        setIsCreateModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('admin.teaching-assignments.update', editingId), {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                }
            });
        } else {
            post(route('admin.teaching-assignments.store'), {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            destroy(route('admin.teaching-assignments.destroy', id));
        }
    };

    // Prepare options for react-select
    const teacherOptions = teachers.map(t => ({ value: t.user_id, label: t.full_name }));
    const subjectOptions = subjects.map(s => ({ value: s.subject_id, label: `${s.subject_name} (${s.subject_code})` }));
    const classOptions = classes.map(c => ({ value: c.student_class_id, label: c.class_name }));

    return (
        <AdminLayout>
            <Head title="Teaching Assignments" />
            <div className="flex flex-col gap-6 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <PageHeader 
                        title="Teaching Assignments" 
                        subtitle="Assign teachers to subjects for specific classes."
                    />
                    <PrimaryButton onClick={openCreateModal} className="flex items-center gap-2">
                        <Icon name="add" />
                        <span>Add Assignment</span>
                    </PrimaryButton>
                </div>

                {/* Search */}
                <Card className="p-4 flex items-center gap-3">
                    <Icon name="search" className="text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search by teacher, subject, or class..."
                        className="w-full bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Card>

                {/* Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-background-dark/30 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Class</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Teacher</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Academic Year</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredAssignments.map((assignment) => (
                                    <tr key={assignment.assignment_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50">
                                        <td className="px-6 py-4 text-sm font-bold text-primary">
                                            {assignment.student_class?.class_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {assignment.subject?.subject_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                <Icon name="person" className="text-gray-400" />
                                                {assignment.teacher?.full_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {assignment.academic_year}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => openEditModal(assignment)}
                                                    className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="Edit Assignment"
                                                >
                                                    <Icon name="edit" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(assignment.assignment_id)}
                                                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete Assignment"
                                                >
                                                    <Icon name="delete" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAssignments.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No teaching assignments found.
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
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                {editingId ? 'Edit Assignment' : 'Assign Teacher'}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {editingId ? 'Update the mapping for this class.' : 'Map a teacher to a specific subject for a class.'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <InputLabel value="Class" />
                                <select
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary focus:ring-primary rounded-md shadow-sm"
                                    onChange={(e) => setData('student_class_id', e.target.value)}
                                    value={data.student_class_id}
                                    required
                                >
                                    <option value="" disabled>Select a class...</option>
                                    {classOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.student_class_id && <p className="text-red-500 text-xs mt-1">{errors.student_class_id}</p>}
                            </div>

                            <div>
                                <InputLabel value="Subject" />
                                <select
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary focus:ring-primary rounded-md shadow-sm"
                                    onChange={(e) => setData('subject_id', e.target.value)}
                                    value={data.subject_id}
                                    required
                                >
                                    <option value="" disabled>Select a subject...</option>
                                    {subjectOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.subject_id && <p className="text-red-500 text-xs mt-1">{errors.subject_id}</p>}
                            </div>

                            <div>
                                <InputLabel value="Teacher" />
                                <select
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-primary focus:ring-primary rounded-md shadow-sm"
                                    onChange={(e) => setData('teacher_id', e.target.value)}
                                    value={data.teacher_id}
                                    required
                                >
                                    <option value="" disabled>Select a teacher...</option>
                                    {teacherOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.teacher_id && <p className="text-red-500 text-xs mt-1">{errors.teacher_id}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing} type="submit">Save Assignment</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default TeachingAssignmentsIndex;
