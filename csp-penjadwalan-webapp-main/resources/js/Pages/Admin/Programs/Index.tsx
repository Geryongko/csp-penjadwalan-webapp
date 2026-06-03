import React, { useState, useCallback, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AdminLayout from '@/Layouts/AdminLayout';
import { Program } from '../../../types';
import Icon from '../../../Components/Icon';
import {
  PageHeader,
  SearchFilterBar,
  Table, Thead, Tbody, Th, Td, EmptyState,
  Button,
  Modal,
  ConfirmationModal,
  FeedbackModal,
  Input, Label, Badge
} from '../../../Components/ReusableUI';

interface IndexProps {
  auth: any;
  programs: {
    data: Program[];
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    from: number;
    total: number;
  };
  filters: {
    search?: string;
  };
  flash: {
    success?: string;
    error?: string;
  };
}

const ProgramIndex: React.FC<IndexProps> = ({ auth, programs, filters, flash = {} }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');

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
    program_name: '',
  });

  const handleOpenAddModal = () => {
    setModalMode('add');
    reset();
    clearErrors();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (program: Program) => {
    setModalMode('edit');
    setData({
        program_name: program.program_name,
    });
    clearErrors();
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (program: Program) => {
    setSelectedProgram(program);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'add') {
      post(route('admin.programs.store'), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
        preserveScroll: true
      });
    } else if (selectedProgram) {
      put(route('admin.programs.update', selectedProgram.program_id), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
        preserveScroll: true
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedProgram) {
      destroy(route('admin.programs.destroy', selectedProgram.program_id), {
        onSuccess: () => setIsDeleteModalOpen(false),
        preserveScroll: true
      });
    }
  };

  const applyFilters = useCallback(
    debounce((search: string) => {
      router.get(
        route('admin.programs.index'),
        { search },
        { preserveState: true, replace: true }
      );
    }, 500),
    []
  );

  const onSearchChange = (val: string) => {
    setSearchQuery(val);
    applyFilters(val);
  };

  return (
    <AdminLayout user={auth.user}>
      <Head title="Manage Programs" />

      <div className="flex flex-col gap-6 animate-fade-in-up relative">
        <PageHeader
          title="Programs Management"
          subtitle="Manage the list of programs (jurusan peminatan)."
          actionLabel="Add Program"
          onAction={handleOpenAddModal}
        />

        <SearchFilterBar
          searchValue={searchQuery}
          onSearchChange={onSearchChange}
          placeholder="Search programs..."
        >
        </SearchFilterBar>

        <Table>
          <Thead>
              <Th>#</Th>
              <Th>Program Name</Th>
              <Th>Actions</Th>
          </Thead>
          <Tbody>
            {programs.data.length > 0 ? (
              programs.data.map((program, index) => (
                <tr key={program.program_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50 transition-colors">
                  <Td className="text-gray-500 text-sm">
                      {programs.from + index}
                  </Td>
                  <Td className="text-gray-900 dark:text-white font-medium">{program.program_name}</Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleOpenEditModal(program)}
                        className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Icon name="edit" className="text-lg" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(program)}
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
              <EmptyState message="No programs found matching your criteria." colSpan={3} />
            )}
          </Tbody>
        </Table>

        {programs.links.length > 3 && (
            <div className="flex items-center justify-center p-4 gap-1 flex-wrap">
                {programs.links.map((link, key) => (
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
          title={modalMode === 'add' ? 'Add New Program' : 'Edit Program'}
          footer={
              <>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={processing}>Cancel</Button>
                  <Button onClick={handleSubmit} isLoading={processing}>
                      {modalMode === 'add' ? 'Save Program' : 'Update Program'}
                  </Button>
              </>
          }
        >
          <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="program_name">Program Name</Label>
                  <Input
                    type="text"
                    id="program_name"
                    value={data.program_name}
                    onChange={(e) => setData('program_name', e.target.value)}
                    placeholder="e.g. MIPA / IPS"
                    autoFocus
                    required
                  />
                  {errors.program_name && <p className="text-sm text-red-500">{errors.program_name}</p>}
              </div>
          </div>
        </Modal>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Program?"
          message={<>Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedProgram?.program_name}</span>?</>}
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

export default ProgramIndex;
