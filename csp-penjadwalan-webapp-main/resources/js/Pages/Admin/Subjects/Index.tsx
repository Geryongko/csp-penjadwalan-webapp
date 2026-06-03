import React, { useState, useCallback, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AdminLayout from '@/Layouts/AdminLayout';
import { Subject, Program } from '../../../types';
import Icon from '../../../Components/Icon';
import {
  PageHeader,
  SearchFilterBar,
  Table, Thead, Tbody, Th, Td, EmptyState,
  Button,
  Modal,
  ConfirmationModal,
  FeedbackModal,
  Input, Label, Select, Badge
} from '../../../Components/ReusableUI';

interface IndexProps {
  auth: any;
  subjects: {
    data: Subject[];
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    from: number;
    total: number;
  };
  programs: Program[];
  filters: {
    search?: string;
    program_id?: string;
  };
  flash: {
    success?: string;
    error?: string;
  };
}

const SubjectIndex: React.FC<IndexProps> = ({ auth, subjects, programs, filters, flash = {} }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [programFilter, setProgramFilter] = useState(filters.program_id || '');

  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    status: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    status: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    if (flash?.success) {
      setFeedback({
        isOpen: true,
        status: 'success',
        title: 'Success!',
        message: flash.success
      });
    }
    else if (flash?.error) {
      setFeedback({
        isOpen: true,
        status: 'error',
        title: 'Error!',
        message: flash.error
      });
    }
  }, [flash]);

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    subject_code: '',
    subject_name: '',
    jp: 2,
    program_id: '',
    description: '',
  });

  const handleOpenAddModal = () => {
    setModalMode('add');
    reset();
    clearErrors();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject: Subject) => {
    setModalMode('edit');
    setData({
        subject_code: subject.subject_code,
        subject_name: subject.subject_name,
        jp: subject.jp,
        program_id: subject.program_id ? String(subject.program_id) : '',
        description: subject.description || '',
    });
    clearErrors();
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'add') {
      post(route('admin.subjects.store'), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
        preserveScroll: true
      });
    } else if (selectedSubject) {
      put(route('admin.subjects.update', selectedSubject.subject_id), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
        preserveScroll: true
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedSubject) {
      destroy(route('admin.subjects.destroy', selectedSubject.subject_id), {
        onSuccess: () => setIsDeleteModalOpen(false),
        preserveScroll: true
      });
    }
  };

  const applyFilters = useCallback(
    debounce((search: string, program: string) => {
      router.get(
        route('admin.subjects.index'),
        { search, program_id: program },
        { preserveState: true, replace: true }
      );
    }, 500),
    []
  );

  const onSearchChange = (val: string) => {
    setSearchQuery(val);
    applyFilters(val, programFilter);
  };

  const onProgramFilterChange = (val: string) => {
    setProgramFilter(val);
    applyFilters(searchQuery, val);
  };

  return (
    <AdminLayout user={auth.user}>
      <Head title="Manage Subjects" />

      <div className="flex flex-col gap-6 animate-fade-in-up relative">
        <PageHeader
          title="Subjects Management"
          subtitle="Manage the list of subjects (mata pelajaran)."
          actionLabel="Add Subject"
          onAction={handleOpenAddModal}
        />

        <SearchFilterBar
          searchValue={searchQuery}
          onSearchChange={onSearchChange}
          placeholder="Search by code or name..."
        >
            <div className="sm:w-64">
               <Select
                   value={programFilter}
                   onChange={(e) => onProgramFilterChange(e.target.value)}
                   className="bg-gray-50 dark:bg-background-dark h-12"
               >
                 <option value="">All Programs</option>
                 {programs.map(program => (
                   <option key={program.program_id} value={program.program_id}>
                     {program.program_name}
                   </option>
                 ))}
               </Select>
            </div>
        </SearchFilterBar>

        <Table>
          <Thead>
              <Th>#</Th>
              <Th>Subject Code</Th>
              <Th>Subject Name</Th>
              <Th>JP</Th>
              <Th>Program</Th>
              <Th>Actions</Th>
          </Thead>
          <Tbody>
            {subjects.data.length > 0 ? (
              subjects.data.map((subject, index) => (
                <tr key={subject.subject_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50 transition-colors">
                  <Td className="text-gray-500 text-sm">
                      {subjects.from + index}
                  </Td>
                  <Td className="font-semibold text-primary">{subject.subject_code}</Td>
                  <Td className="text-gray-900 dark:text-white font-medium">{subject.subject_name}</Td>
                  <Td>{subject.jp} Jam</Td>
                  <Td>
                      <Badge variant={subject.program ? 'primary' : 'gray'}>
                          {subject.program?.program_name || 'Umum'}
                      </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleOpenEditModal(subject)}
                        className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Icon name="edit" className="text-lg" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(subject)}
                        className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Icon name="delete" className="text-lg" />
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            ) : (
              <EmptyState message="No subjects found matching your criteria." colSpan={6} />
            )}
          </Tbody>
        </Table>

        {subjects.links.length > 3 && (
            <div className="flex items-center justify-center p-4 gap-1 flex-wrap">
                {subjects.links.map((link, key) => (
                    link.url === null ? (
                        <div key={key} className="px-3 py-1 text-sm text-gray-400 border rounded-lg" dangerouslySetInnerHTML={{ __html: link.label }} />
                    ) : (
                        <Button
                            key={key}
                            variant={link.active ? 'primary' : 'ghost'}
                            className={`h-9 px-3 ${link.active ? 'pointer-events-none' : ''}`}
                            onClick={() => router.get(link.url!)}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Button>
                    )
                ))}
            </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'Add New Subject' : 'Edit Subject'}
          footer={
              <>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={processing}>Cancel</Button>
                  <Button onClick={handleSubmit} isLoading={processing}>
                      {modalMode === 'add' ? 'Save Subject' : 'Update Subject'}
                  </Button>
              </>
          }
        >
          <div className="space-y-4">
              {modalMode === 'edit' && (
                  <div className="space-y-2">
                      <Label htmlFor="subject_code">Subject Code</Label>
                      <Input
                        type="text"
                        id="subject_code"
                        value={data.subject_code}
                        onChange={(e) => setData('subject_code', e.target.value)}
                        required
                      />
                      {errors.subject_code && <p className="text-sm text-red-500">{errors.subject_code}</p>}
                  </div>
              )}
              
              <div className="space-y-2">
                  <Label htmlFor="subject_name">Subject Name</Label>
                  <Input
                    type="text"
                    id="subject_name"
                    value={data.subject_name}
                    onChange={(e) => setData('subject_name', e.target.value)}
                    placeholder="e.g. Matematika Wajib"
                    autoFocus
                    required
                  />
                  {errors.subject_name && <p className="text-sm text-red-500">{errors.subject_name}</p>}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="jp">Jam Pelajaran (JP)</Label>
                  <Input
                    type="number"
                    id="jp"
                    min="1"
                    max="10"
                    value={data.jp}
                    onChange={(e) => setData('jp', Number(e.target.value))}
                    required
                  />
                  {errors.jp && <p className="text-sm text-red-500">{errors.jp}</p>}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="program_id">Program (Optional)</Label>
                  <Select
                      id="program_id"
                      value={data.program_id}
                      onChange={(e) => setData('program_id', e.target.value)}
                  >
                      <option value="">Umum (All Programs)</option>
                      {programs.map(program => (
                          <option key={program.program_id} value={program.program_id}>
                              {program.program_name}
                          </option>
                      ))}
                  </Select>
                  {errors.program_id && <p className="text-sm text-red-500">{errors.program_id}</p>}
              </div>
          </div>
        </Modal>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Subject?"
          message={<>Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedSubject?.subject_name}</span>?</>}
          confirmLabel={processing ? "Deleting..." : "Delete"}
          variant="danger"
        />

        <FeedbackModal
            isOpen={feedback.isOpen}
            onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
            status={feedback.status}
            title={feedback.title}
            message={feedback.message}
        />
      </div>
    </AdminLayout>
  );
};

export default SubjectIndex;
