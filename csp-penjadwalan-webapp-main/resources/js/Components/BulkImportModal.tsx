import React, { useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import * as XLSX from 'xlsx';
import { Button, Modal, Select, Label, Input, Table, Thead, Tbody, Th, Td } from './ReusableUI';
import Icon from './Icon';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentClasses: any[];
    semesters: any[];
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, studentClasses, semesters }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        student_class_id: '',
        semester_id: '',
        batch_year: new Date().getFullYear().toString(),
        students: [] as any[]
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError(null);
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rawData = XLSX.utils.sheet_to_json(ws);

                if (rawData.length === 0) {
                    setFileError("The file is empty or formatted incorrectly.");
                    return;
                }

                // Map raw data to our expected format
                const formattedData = rawData.map((row: any) => ({
                    full_name: row['Full Name'] || row['Nama Lengkap'] || '',
                    email: row['Email'] || '',
                    phone_number: row['Phone Number'] || row['Nomor Telepon'] || '',
                    birth_date: row['Birth Date'] || row['Tanggal Lahir'] || '',
                }));

                const invalidRows = formattedData.filter(d => !d.full_name || !d.email);
                if (invalidRows.length > 0) {
                     setFileError(`Found ${invalidRows.length} rows missing 'Full Name' or 'Email'. Please fix the file and try again.`);
                     return;
                }

                setParsedData(formattedData);
                setData('students', formattedData);
                setStep(2);
            } catch (error) {
                setFileError("Error parsing file. Please make sure it's a valid Excel or CSV file.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                "Full Name": "Budi Santoso",
                "Email": "budi@example.com",
                "Phone Number": "081234567890",
                "Birth Date": "2005-01-15"
            },
            {
                "Full Name": "Siti Aminah",
                "Email": "siti@example.com",
                "Phone Number": "081298765432",
                "Birth Date": "2005-12-01"
            }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Student_Import_Template.xlsx");
    };

    const handleEditCell = (index: number, field: string, value: string) => {
        const newData = [...parsedData];
        newData[index][field] = value;
        setParsedData(newData);
        setData('students', newData);
    };

    const handleSubmit = () => {
        post(route('admin.users.bulk'), {
            onSuccess: () => {
                reset();
                setStep(1);
                setParsedData([]);
                onClose();
            }
        });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Import Students via Excel/CSV" 
            maxWidth="max-w-4xl"
            footer={
                <>
                    {step === 1 ? (
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={handleSubmit} isLoading={processing}>Import {parsedData.length} Students</Button>
                        </>
                    )}
                </>
            }
        >
            {step === 1 && (
                <div className="space-y-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm flex gap-3">
                        <Icon name="info" />
                        <div>
                            <p className="font-bold mb-1">How to import:</p>
                            <ol className="list-decimal ml-4 space-y-1">
                                <li>Select the Class (Rombel), Semester, and Tahun Masuk for these students.</li>
                                <li>Upload an Excel (.xlsx) or CSV file containing the students' details.</li>
                                <li>The file must have exactly these column headers: <strong>Full Name, Email, Phone Number, Birth Date</strong>.</li>
                                <li>All students will be given the default password: <strong>password</strong></li>
                            </ol>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6 dark:border-gray-700">
                        <div className="space-y-2">
                            <Label>Class (Rombel)</Label>
                            <Select value={data.student_class_id} onChange={e => setData('student_class_id', e.target.value)}>
                                <option value="" disabled>Select Class...</option>
                                {studentClasses.map(c => <option key={c.student_class_id} value={c.student_class_id}>{c.class_name}</option>)}
                            </Select>
                            {errors.student_class_id && <p className="text-sm text-red-500">{errors.student_class_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select value={data.semester_id} onChange={e => setData('semester_id', e.target.value)}>
                                <option value="" disabled>Select Semester...</option>
                                {semesters.map(s => <option key={s.semester_id} value={s.semester_id}>{s.semester_name}</option>)}
                            </Select>
                            {errors.semester_id && <p className="text-sm text-red-500">{errors.semester_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Tahun Masuk</Label>
                            <Input type="number" value={data.batch_year} onChange={e => setData('batch_year', e.target.value)} />
                            {errors.batch_year && <p className="text-sm text-red-500">{errors.batch_year}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <Icon name="upload_file" className="text-6xl text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 mb-4 font-medium">Upload your Excel or CSV file</p>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleFileChange}
                        />
                        <div className="flex gap-4">
                            <Button variant="secondary" onClick={downloadTemplate}>
                                <Icon name="download" /> Download Template
                            </Button>
                            <Button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!data.student_class_id || !data.semester_id || !data.batch_year}
                            >
                                <Icon name="folder_open" /> Browse File
                            </Button>
                        </div>
                        {(!data.student_class_id || !data.semester_id || !data.batch_year) && (
                            <p className="text-xs text-orange-500 mt-4">Please select Class, Semester, and Tahun Masuk before uploading.</p>
                        )}
                        {fileError && <p className="text-sm text-red-500 mt-4 font-medium p-2 bg-red-50 rounded-lg">{fileError}</p>}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Icon name="visibility" className="text-primary" /> Data Preview
                        </h3>
                        <span className="text-sm text-gray-500">Found {parsedData.length} records</span>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <Table>
                            <Thead>
                                <Th>Full Name</Th>
                                <Th>Email</Th>
                                <Th>Phone Number</Th>
                                <Th>Birth Date (YYYY-MM-DD)</Th>
                            </Thead>
                            <Tbody>
                                {parsedData.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Td className="p-1">
                                            <Input value={row.full_name} onChange={(e) => handleEditCell(i, 'full_name', e.target.value)} className="h-9 text-sm w-full border-transparent hover:border-gray-300 focus:border-primary" />
                                        </Td>
                                        <Td className="p-1">
                                            <Input type="email" value={row.email} onChange={(e) => handleEditCell(i, 'email', e.target.value)} className="h-9 text-sm w-full border-transparent hover:border-gray-300 focus:border-primary" />
                                        </Td>
                                        <Td className="p-1">
                                            <Input value={row.phone_number} onChange={(e) => handleEditCell(i, 'phone_number', e.target.value)} className="h-9 text-sm w-full border-transparent hover:border-gray-300 focus:border-primary" />
                                        </Td>
                                        <Td className="p-1">
                                            <Input type="date" value={row.birth_date} onChange={(e) => handleEditCell(i, 'birth_date', e.target.value)} className="h-9 text-sm w-full border-transparent hover:border-gray-300 focus:border-primary" />
                                        </Td>
                                    </tr>
                                ))}
                            </Tbody>
                        </Table>
                    </div>
                    {errors.bulk_import && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm max-h-40 overflow-y-auto">
                            <p className="font-bold mb-2">Import Errors:</p>
                            <ul className="list-disc pl-5">
                                {(errors.bulk_import as unknown as string[]).map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default BulkImportModal;
