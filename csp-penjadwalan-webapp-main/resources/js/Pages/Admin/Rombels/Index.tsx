import React, { useState, useCallback, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AdminLayout from '@/Layouts/AdminLayout';
import { Rombel, Program, User } from '../../../types';
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
  rombels: {
    data: Rombel[];
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    from: number;
    total: number;
  };
  programs: Program[];
  teachers: User[];
  filters: {
    search?: string;
    program_id?: string;
    grade_level?: string;
  };
  flash: {
    success?: string;
    error?: string;
  };
}

const RombelIndex: React.FC<IndexProps> = ({ auth, rombels, programs, teachers, filters, flash = {} }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRombel, setSelectedRombel] = useState<Rombel | null>(null);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [programFilter, setProgramFilter] = useState(filters.program_id || '');
  const [gradeFilter, setGradeFilter] = useState(filters.grade_level || '');

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
    rombel_name: '',
    grade_level: 10,
    program_id: '',
    homeroom_teacher_id: '',
  });

  const handleOpenAddModal = () => {
    setModalMode('add');
    reset();
    clearErrors();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rombel: Rombel) => {
    setModalMode('edit');
    setData({
        rombel_name: rombel.rombel_name,
        grade_level: rombel.grade_level,
        program_id: rombel.program_id ? String(rombel.program_id) : '',
        homeroom_teacher_id: rombel.homeroom_teacher_id ? String(rombel.homeroom_teacher_id) : '',
    });
    clearErrors();
    setSelectedRombel(rombel);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (rombel: Rombel) => {
    setSelectedRombel(rombel);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'add') {
      post(route('admin.rombels.store'), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
        preserveScroll: true
      });
    } else if (selectedRombel) {
      put(route('admin.rombels.update', selectedRombel.rombel_id), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
        preserveScroll: true
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedRombel) {
      destroy(route('admin.rombels.destroy', selectedRombel.rombel_id), {
        onSuccess: () => setIsDeleteModalOpen(false),
        preserveScroll: true
      });
    }
  };

  const applyFilters = useCallback(
    debounce((search: string, program: string, grade: string) => {
      router.get(
        route('admin.rombels.index'),
        { search, program_id: program, grade_level: grade },
        { preserveState: true, replace: true }
      );
    }, 500),
    []
  );

  const onSearchChange = (val: string) => {
    setSearchQuery(val);
    applyFilters(val, programFilter, gradeFilter);
  };

  const onProgramFilterChange = (val: string) => {
    setProgramFilter(val);
    applyFilters(searchQuery, val, gradeFilter);
  };

  const onGradeFilterChange = (val: string) => {
    setGradeFilter(val);
    applyFilters(searchQuery, programFilter, val);
  };

  return (
    <AdminLayout user={auth.user}>
      <Head title="Manage Rombels" />

      <div className="flex flex-col gap-6 animate-fade-in-up relative">
        <PageHeader
          title="Rombels Management"
          subtitle="Manage the list of classes (Rombongan Belajar)."
          actionLabel="Add Rombel"
          onAction={handleOpenAddModal}
        />

        <SearchFilterBar
          searchValue={searchQuery}
          onSearchChange={onSearchChange}
          placeholder="Search by rombel or teacher..."
        >
            <div className="flex gap-2 sm:w-80">
               <Select
                   value={gradeFilter}
                   onChange={(e) => onGradeFilterChange(e.target.value)}
                   className="bg-gray-50 dark:bg-background-dark h-12 flex-1"
               >
                 <option value="">All Grades</option>
                 <option value="10">Kelas 10</option>
                 <option value="11">Kelas 11</option>
                 <option value="12">Kelas 12</option>
               </Select>
               
               <Select
                   value={programFilter}
                   onChange={(e) => onProgramFilterChange(e.target.value)}
                   className="bg-gray-50 dark:bg-background-dark h-12 flex-1"
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
              <Th>Rombel Name</Th>
              <Th>Grade Level</Th>
              <Th>Program</Th>
              <Th>Homeroom Teacher</Th>
              <Th>Actions</Th>
          </Thead>
          <Tbody>
            {rombels.data.length > 0 ? (
              rombels.data.map((rombel, index) => (
                <tr key={rombel.rombel_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50 transition-colors">
                  <Td className="text-gray-500 text-sm">
                      {rombels.from + index}
                  </Td>
                  <Td className="font-semibold text-primary">{rombel.rombel_name}</Td>
                  <Td>Kelas {rombel.grade_level}</Td>
                  <Td>
                      <Badge variant={rombel.program ? 'primary' : 'gray'}>
                          {rombel.program?.program_name || 'Umum'}
                      </Badge>
                  </Td>
                  <Td className="text-gray-900 dark:text-white">
                      {rombel.homeroomTeacher?.full_name || '-'}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleOpenEditModal(rombel)}
                        className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Icon name="edit" className="text-lg" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(rombel)}
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
              <EmptyState message="No rombels found matching your criteria." colSpan={6} />
            )}
          </Tbody>
        </Table>

        {rombels.links.length > 3 && (
            <div className="flex items-center justify-center p-4 gap-1 flex-wrap">
                {rombels.links.map((link, key) => (
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
          title={modalMode === 'add' ? 'Add New Rombel' : 'Edit Rombel'}
          footer={
              <>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={processing}>Cancel</Button>
                  <Button onClick={handleSubmit} isLoading={processing}>
                      {modalMode === 'add' ? 'Save Rombel' : 'Update Rombel'}
                  </Button>
              </>
          }
        >
          <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="rombel_name">Rombel Name</Label>
                  <Input
                    type="text"
                    id="rombel_name"
                    value={data.rombel_name}
                    onChange={(e) => setData('rombel_name', e.target.value)}
                    placeholder="e.g. X MIPA 1"
                    autoFocus
                    required
                  />
                  {errors.rombel_name && <p className="text-sm text-red-500">{errors.rombel_name}</p>}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="grade_level">Grade Level</Label>
                  <Select
                      id="grade_level"
                      value={data.grade_level}
                      onChange={(e) => setData('grade_level', Number(e.target.value))}
                      required
                  >
                      <option value="10">Kelas 10</option>
                      <option value="11">Kelas 11</option>
                      <option value="12">Kelas 12</option>
                  </Select>
                  {errors.grade_level && <p className="text-sm text-red-500">{errors.grade_level}</p>}
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

              <div className="space-y-2">
                  <Label htmlFor="homeroom_teacher_id">Homeroom Teacher (Optional)</Label>
                  <Select
                      id="homeroom_teacher_id"
                      value={data.homeroom_teacher_id}
                      onChange={(e) => setData('homeroom_teacher_id', e.target.value)}
                  >
                      <option value="">None</option>
                      {teachers.map(teacher => (
                          <option key={teacher.user_id} value={teacher.user_id}>
                              {teacher.full_name}
                          </option>
                      ))}
                  </Select>
                  {errors.homeroom_teacher_id && <p className="text-sm text-red-500">{errors.homeroom_teacher_id}</p>}
              </div>
          </div>
        </Modal>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Rombel?"
          message={<>Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedRombel?.rombel_name}</span>?</>}
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

export default RombelIndex;
