import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Program, Subject, Curriculum } from '../../../types';
import Icon from '../../../Components/Icon';
import {
  PageHeader, Card, Button, Modal, ConfirmationModal, FeedbackModal, Select, Input, Label, Badge
} from '../../../Components/ReusableUI';

interface IndexProps {
  auth: any;
  view_mode: 'list_programs' | 'detail_curriculum';
  programs?: Program[];
  allPrograms?: Program[];
  allSubjects?: Subject[];
  filters?: { search?: string };
  curriculums?: Curriculum[];
  selected_program?: Program;
  subjects?: Subject[];
  flash: { success?: string; error?: string };
}

const CurriculumIndex: React.FC<IndexProps> = ({
  auth, view_mode, programs = [], allPrograms = [], allSubjects = [],
  filters = {}, curriculums = [], selected_program, subjects = [], flash
}) => {

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<{isOpen: boolean, status: 'success'|'error', title: string, message: string}>({
      isOpen: false, status: 'success', title: '', message: ''
  });

  useEffect(() => {
      if (flash?.success) setFeedback({ isOpen: true, status: 'success', title: 'Success', message: flash.success });
      else if (flash?.error) setFeedback({ isOpen: true, status: 'error', title: 'Error', message: flash.error });
  }, [flash]);

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
      program_id: selected_program ? String(selected_program.program_id) : '',
      subject_id: '',
      semester: 1,
      category: 'WAJIB_PRODI',
  });

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      router.get(route('admin.curriculums.index'), { search: searchQuery }, { preserveState: true });
  };

  const handleOpenModal = () => {
      reset();
      if (selected_program) setData('program_id', String(selected_program.program_id));
      clearErrors();
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      post(route('admin.curriculums.store'), {
          onSuccess: () => {
              setIsModalOpen(false);
              reset();
          }
      });
  };

  const handleOpenDelete = (id: number) => {
      setSelectedCurriculumId(id);
      setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
      if (selectedCurriculumId) {
          router.delete(route('admin.curriculums.destroy', selectedCurriculumId), {
              onSuccess: () => setIsDeleteModalOpen(false)
          });
      }
  };

  return (
    <AdminLayout user={auth.user}>
      <Head title="Curriculum Management" />
      <div className="flex flex-col gap-6 animate-fade-in-up">
        
        {view_mode === 'list_programs' ? (
            <>
                <PageHeader
                    title="Curriculum Overview"
                    subtitle="Select a program to manage its curriculum and subjects."
                    actionLabel="Add Subject to Program"
                    onAction={handleOpenModal}
                />
                
                <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                    <Input
                        type="text"
                        placeholder="Search programs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit">Search</Button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.map(program => (
                        <Card key={program.program_id} className="hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-primary/20"
                            onClick={() => router.get(route('admin.curriculums.index', { program_id: program.program_id }))}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Icon name="account_tree" className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{program.program_name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Manage curriculum structure</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {programs.length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-500">No programs found.</div>
                    )}
                </div>
            </>
        ) : (
            <>
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => router.get(route('admin.curriculums.index'))} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:text-primary transition-colors">
                        <Icon name="arrow_back" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Curriculum: {selected_program?.program_name}</h1>
                        <p className="text-gray-500 text-sm">Manage subjects across semesters for this program.</p>
                    </div>
                    <div className="ml-auto">
                        <Button onClick={handleOpenModal} icon="add">Add Subject</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(semester => {
                        const semsCurriculums = curriculums.filter(c => c.semester === semester);
                        if (semsCurriculums.length === 0) return null;
                        
                        return (
                            <Card key={semester} className="p-0 overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 font-bold flex justify-between items-center text-gray-800 dark:text-gray-200">
                                    <span>Semester {semester}</span>
                                    <Badge variant="primary">{semsCurriculums.length} Subjects</Badge>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 bg-white dark:bg-background-dark">
                                            <tr>
                                                <th className="px-6 py-3 font-semibold">Subject Code</th>
                                                <th className="px-6 py-3 font-semibold">Subject Name</th>
                                                <th className="px-6 py-3 font-semibold">JP</th>
                                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-background-dark">
                                            {semsCurriculums.map(c => (
                                                <tr key={c.curriculum_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-6 py-3 font-medium text-primary">{c.subject?.subject_code}</td>
                                                    <td className="px-6 py-3 text-gray-900 dark:text-gray-100 font-medium">{c.subject?.subject_name}</td>
                                                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{c.subject?.jp} Jam</td>
                                                    <td className="px-6 py-3 text-right">
                                                        <button onClick={() => handleOpenDelete(c.curriculum_id)} className="text-red-500 hover:text-red-600 text-sm font-medium">Remove</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Subject to Program" footer={
            <>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} isLoading={processing}>Save Assignment</Button>
            </>
        }>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Program</Label>
                    <Select value={data.program_id} onChange={e => setData('program_id', e.target.value)} required>
                        <option value="">Select a Program</option>
                        {view_mode === 'list_programs' ? allPrograms.map(p => (
                            <option key={p.program_id} value={p.program_id}>{p.program_name}</option>
                        )) : (
                            <option value={selected_program?.program_id}>{selected_program?.program_name}</option>
                        )}
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={data.subject_id} onChange={e => setData('subject_id', e.target.value)} required>
                        <option value="">Select a Subject</option>
                        {(view_mode === 'list_programs' ? allSubjects : subjects).map(s => (
                            <option key={s.subject_id} value={s.subject_id}>[{s.subject_code}] {s.subject_name} ({s.jp} JP)</option>
                        ))}
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select value={data.semester} onChange={e => setData('semester', Number(e.target.value))} required>
                        {[1, 2, 3, 4, 5, 6].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={data.category} onChange={e => setData('category', e.target.value)} required>
                        <option value="WAJIB">Mata Pelajaran Wajib</option>
                        <option value="PILIHAN">Mata Pelajaran Pilihan</option>
                        <option value="MULOK">Muatan Lokal</option>
                    </Select>
                </div>
            </div>
        </Modal>

        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Remove from Curriculum?"
            message="Are you sure you want to remove this subject from the program's curriculum? This action cannot be undone."
            variant="danger"
            confirmLabel="Yes, Remove"
        />

        <FeedbackModal {...feedback} onClose={() => setFeedback(prev => ({...prev, isOpen: false}))} />
      </div>
    </AdminLayout>
  );
};

export default CurriculumIndex;
