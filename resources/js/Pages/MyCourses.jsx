import { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import axios from 'axios';

export default function MyCourses({ auth, courses, flash }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileStatuses, setFileStatuses] = useState([]); // Array of { file, status, error, text }
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        title: '', code: '', credit_unit: '', syllabus_text: '',
    });

    const isProfileComplete = !!(auth.user.school && auth.user.department);

    const openModal = () => setIsModalOpen(true);

    const closeModal = () => {
        setIsModalOpen(false);
        setFileStatuses([]);
        reset();
    };

    const handleFileChange = async (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length === 0) return;

        // Enforce max 5 total files
        const currentCount = fileStatuses.length;
        const allowedNewCount = Math.max(0, 5 - currentCount);
        const filesToProcess = newFiles.slice(0, allowedNewCount);

        if (newFiles.length > allowedNewCount) {
            alert('You can only upload a maximum of 5 files per course.');
        }

        const newStatuses = filesToProcess.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            file: file,
            status: 'extracting', // 'extracting', 'success', 'error'
            error: null,
            text: ''
        }));

        setFileStatuses(prev => [...prev, ...newStatuses]);

        // Process each file
        for (const statusObj of newStatuses) {
            try {
                let payload;
                let headers = {};

                // If file is > 1.5MB, use Base64 to bypass PHP's 2MB upload_max_filesize (8MB post_max_size usually allowed)
                if (statusObj.file.size > 1.5 * 1024 * 1024 && statusObj.file.size < 6 * 1024 * 1024) {
                    const base64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(statusObj.file);
                    });
                    payload = { 
                        base64_file: base64,
                        file_name: statusObj.file.name,
                        mime_type: statusObj.file.type || 'application/pdf'
                    };
                    headers = { 'Content-Type': 'application/json' };
                } else {
                    payload = new FormData();
                    payload.append('file', statusObj.file);
                    headers = { 'Content-Type': 'multipart/form-data' };
                }

                const response = await axios.post(route('courses.extract-text'), payload, { headers });

                if (response.data.success) {
                    setFileStatuses(prev => prev.map(item =>
                        item.id === statusObj.id
                            ? { ...item, status: 'success', text: response.data.text }
                            : item
                    ));
                } else {
                    throw new Error(response.data.message || 'Extraction failed');
                }
            } catch (err) {
                console.error("File extraction error:", err);
                setFileStatuses(prev => prev.map(item =>
                    item.id === statusObj.id
                        ? { ...item, status: 'error', error: err.response?.data?.message || err.message }
                        : item
                ));
            }
        }
    };

    const removeFile = (id) => {
        setFileStatuses(prev => prev.filter(item => item.id !== id));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isAllExtracted = fileStatuses.length > 0 && fileStatuses.every(f => f.status === 'success');
    const isExtracting = fileStatuses.some(f => f.status === 'extracting');

    const submit = (e) => {
        e.preventDefault();

        if (!isAllExtracted) return;

        // Combine all extracted text
        const combinedText = fileStatuses.map(f => f.text).join("\n\n---\n\n");
        
        // Use transform to ensure the combined text is sent correctly even if setData is async
        transform((data) => ({
            ...data,
            syllabus_text: combinedText,
        }));

        post(route('courses.store'), {
            onSuccess: () => closeModal()
        });
    };

    const renderCourseAction = (course) => {
        switch (course.status) {
            case 'Pre-Test Needed':
                return <Link href={route('courses.test.show', course.id)} className="w-full text-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-opacity-80 font-semibold">Take Pre-Test</Link>;
            case 'AI Analysis Failed':
                return (
                    <button 
                        onClick={() => router.post(route('courses.retry-analysis', course.id))}
                        className="w-full text-center px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-opacity-80 font-semibold transition"
                    >
                        <i className="fas fa-sync-alt mr-2"></i>Retry Analysis
                    </button>
                );
            case 'Analyzing Syllabus...':
                return <button disabled className="w-full text-center px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed font-semibold"><i className="fas fa-spinner fa-spin mr-2"></i>Analyzing...</button>;
            default:
                return <Link href={route('courses.show', course.id)} className="w-full text-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-opacity-80 font-semibold">View Progress</Link>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-brand-text leading-tight">My Courses</h2>}>
            <Head title="My Courses" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-end mb-4">
                        {isProfileComplete ? (
                            <PrimaryButton onClick={openModal} className="bg-brand-blue hover:bg-blue-700">
                                <i className="fas fa-plus mr-2"></i>Add New Course
                            </PrimaryButton>
                        ) : (
                            <Link href={route('profile.edit')} className="inline-flex items-center px-4 py-2 bg-brand-orange text-white rounded-md font-semibold text-xs uppercase tracking-widest hover:bg-opacity-80 transition ease-in-out duration-150">
                                <i className="fas fa-user-edit mr-2"></i>Update Profile to Add Courses
                            </Link>
                        )}
                    </div>
                    {flash.message && <div className="mb-4 p-4 bg-green-100 text-green-800 border border-green-300 rounded-lg">{flash.message}</div>}
                    {flash.error && <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg">{flash.error}</div>}
                    <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <div key={course.id} className="p-6 bg-brand-white rounded-lg shadow-md flex flex-col">
                                    <h5 className="text-lg font-bold text-brand-text">{course.title}</h5>
                                    <p className="text-sm text-brand-secondary mb-3">{course.code}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4"><div className="bg-brand-blue h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div></div>
                                    <p className="text-xs text-brand-secondary mb-4">Status: <span className="font-semibold">{course.status}</span></p>
                                    <div className="mt-auto">{renderCourseAction(course)}</div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full p-10 text-center bg-brand-white rounded-lg shadow-md">
                                <i className="fas fa-folder-open text-5xl text-gray-300 mb-4"></i>
                                <h4 className="text-xl font-bold text-brand-text">Your semester is empty!</h4>
                                <p className="text-brand-secondary">Click "Add New Course" to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-xl font-bold text-brand-text">Add a New Course</h2>
                    <p className="mt-1 text-sm text-brand-secondary mb-6">Upload up to 5 syllabi, PDFs, PowerPoint slides, or images. We'll automatically extract the text to determine your course topics.</p>

                    <div className="mt-4">
                        <InputLabel htmlFor="title" value="Course Title" />
                        <TextInput id="title" name="title" value={data.title} className="mt-1 block w-full" onChange={(e) => setData('title', e.target.value)} required />
                        <InputError message={errors.title} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="code" value="Course Code" />
                        <TextInput id="code" name="code" value={data.code} className="mt-1 block w-full" onChange={(e) => setData('code', e.target.value)} required />
                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="credit_unit" value="Credit Unit" />
                        <TextInput 
                            id="credit_unit" 
                            name="credit_unit" 
                            type="number" 
                            min="1" 
                            max="10"
                            value={data.credit_unit} 
                            className="mt-1 block w-full" 
                            onChange={(e) => setData('credit_unit', e.target.value)} 
                            required 
                        />
                        <InputError message={errors.credit_unit} className="mt-2" />
                    </div>

                    <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <InputLabel htmlFor="files" value="Course Files & Materials (Max 5)" className="font-bold text-gray-700" />

                        <input
                            type="file"
                            name="files"
                            id="files"
                            ref={fileInputRef}
                            multiple
                            accept=".pdf, .png, .jpg, .jpeg, .txt, .ppt, .pptx, .docx"
                            className="mt-2 block w-full text-sm text-brand-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 cursor-pointer"
                            onChange={handleFileChange}
                            disabled={fileStatuses.length >= 5 || isExtracting}
                        />
                        <p className="text-xs text-gray-500 mt-2">Supported: PDF, DOCX, PNG, JPG, TXT, PPTX (Max 15MB each)</p>

                        {fileStatuses.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {fileStatuses.map((file) => (
                                    <div key={file.id} className="flex flex-col p-3 bg-white border border-gray-200 rounded lg shadow-sm">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-3 w-3/4">
                                                <i className="fas fa-file-alt text-gray-400"></i>
                                                <span className="truncate flex-1 font-medium text-gray-700">{file.name}</span>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {file.status === 'extracting' && <span className="text-blue-500 text-xs font-bold animate-pulse"><i className="fas fa-spinner fa-spin mr-1"></i> Extracting...</span>}
                                                {file.status === 'success' && <span className="text-green-500 text-xs font-bold"><i className="fas fa-check-circle mr-1"></i> Ready</span>}
                                                {file.status === 'error' && <span className="text-red-500 text-xs font-bold"><i className="fas fa-exclamation-circle mr-1"></i> Failed</span>}

                                                <button type="button" onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        </div>
                                        {file.status === 'error' && (
                                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                                {file.error}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <InputError message={errors.syllabus_text} className="mt-2" />
                    </div>

                    <div className="mt-8 flex justify-end items-center">
                        <button type="button" onClick={closeModal} className="text-gray-500 hover:text-gray-700 font-medium mr-4">Cancel</button>
                        <PrimaryButton
                            disabled={processing || isExtracting || !isAllExtracted}
                            className={(!isAllExtracted || isExtracting) ? 'opacity-50 cursor-not-allowed' : 'bg-brand-blue'}
                        >
                            {processing ? (
                                <><i className="fas fa-spinner fa-spin mr-2"></i> Generating Topics...</>
                            ) : isExtracting ? (
                                <><i className="fas fa-spinner fa-spin mr-2"></i> Extracting Text...</>
                            ) : (
                                <><i className="fas fa-save mr-2"></i> Save & Analyze Course</>
                            )}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}