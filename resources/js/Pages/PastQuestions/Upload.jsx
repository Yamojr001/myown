import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function UploadPage({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        school: '',
        exam_name: '',
        course_code: '',
        course_title: '',
        year: '',
        file: null,
        content: '',
    });

    const [isDragging, setIsDragging] = useState(false);
    const [previewContent, setPreviewContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('past-questions.store'), {
            onSuccess: () => reset(),
        });
    };

    const handleFileChange = (file) => {
        if (!file) return;
        setData('file', file);
        
        // Simple preview for text files
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => setPreviewContent(e.target.result);
            reader.readAsText(file);
        } else {
            setPreviewContent(`File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight text-white/90">Upload Past Question</h2>}
        >
            <Head title="Upload Past Question" />

            {/* Gradient Background for header area */}
            <div className="bg-gradient-to-br from-brand-blue via-brand-blue/80 to-brand-dark absolute top-0 left-0 w-full h-80 -z-10" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(20,78,138,0.15)] rounded-3xl overflow-hidden border border-white/40 ring-1 ring-black/5">
                        <div className="md:flex">
                            {/* Form Section */}
                            <div className="md:w-3/5 p-8 md:p-12 border-r border-gray-100">
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Contribute to the Library</h1>
                                <p className="text-gray-500 mb-10">Upload your past examination questions to help others study better.</p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center">
                                                <i className="fas fa-question-circle mr-2 text-brand-blue"></i>
                                                University / School
                                            </label>
                                            <input
                                                type="text"
                                                value={data.school}
                                                onChange={e => setData('school', e.target.value)}
                                                placeholder="e.g. University of Lagos"
                                                className="w-full rounded-2xl border-gray-200 focus:border-brand-blue focus:ring-brand-blue bg-gray-50/50 transition-all p-3"
                                            />
                                            {errors.school && <div className="text-red-500 text-xs mt-1">{errors.school}</div>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center">
                                                <i className="fas fa-file-alt mr-2 text-brand-blue"></i>
                                                Exam Name
                                            </label>
                                            <input
                                                type="text"
                                                value={data.exam_name}
                                                onChange={e => setData('exam_name', e.target.value)}
                                                placeholder="e.g. First Semester Exam"
                                                className="w-full rounded-2xl border-gray-200 focus:border-brand-blue focus:ring-brand-blue bg-gray-50/50 transition-all p-3"
                                            />
                                            {errors.exam_name && <div className="text-red-500 text-xs mt-1">{errors.exam_name}</div>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center">
                                                <i className="fas fa-book-open mr-2 text-brand-blue"></i>
                                                Course Code
                                            </label>
                                            <input
                                                type="text"
                                                value={data.course_code}
                                                onChange={e => setData('course_code', e.target.value)}
                                                placeholder="e.g. CSC 301"
                                                className="w-full rounded-2xl border-gray-200 focus:border-brand-blue focus:ring-brand-blue bg-gray-50/50 transition-all p-3"
                                            />
                                            {errors.course_code && <div className="text-red-500 text-xs mt-1">{errors.course_code}</div>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center">
                                                <i className="fas fa-font mr-2 text-brand-blue"></i>
                                                Course Title
                                            </label>
                                            <input
                                                type="text"
                                                value={data.course_title}
                                                onChange={e => setData('course_title', e.target.value)}
                                                placeholder="e.g. Data Structures"
                                                className="w-full rounded-2xl border-gray-200 focus:border-brand-blue focus:ring-brand-blue bg-gray-50/50 transition-all p-3"
                                            />
                                            {errors.course_title && <div className="text-red-500 text-xs mt-1">{errors.course_title}</div>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 flex items-center">
                                            <i className="fas fa-calendar-alt mr-2 text-brand-blue"></i>
                                            Year
                                        </label>
                                        <input
                                            type="text"
                                            value={data.year}
                                            onChange={e => setData('year', e.target.value)}
                                            placeholder="e.g. 2023"
                                            className="w-full md:w-1/3 rounded-2xl border-gray-200 focus:border-brand-blue focus:ring-brand-blue bg-gray-50/50 transition-all p-3"
                                        />
                                        {errors.year && <div className="text-red-500 text-xs mt-1">{errors.year}</div>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 flex items-center">
                                            Past Answer / Question Text
                                        </label>
                                        <textarea
                                            value={data.content}
                                            onChange={e => setData('content', e.target.value)}
                                            rows="4"
                                            placeholder="You can paste the question text here if you don't have a file, or if you want to provide a solution manually."
                                            className="w-full rounded-2xl border-gray-200 focus:border-brand-blue focus:ring-brand-blue bg-gray-50/50 transition-all p-3"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex items-center justify-center px-6 py-4 bg-brand-blue text-white rounded-2xl font-bold uppercase tracking-wider hover:bg-brand-blue/90 transition-all shadow-[0_10px_30px_rgba(20,78,138,0.3)] disabled:opacity-50 active:scale-95 mt-4"
                                    >
                                        {processing ? (
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                        ) : (
                                            <i className="fas fa-upload mr-2"></i>
                                        )}
                                        Finish Upload
                                    </button>
                                </form>
                            </div>

                            {/* File Upload Section */}
                            <div className="md:w-2/5 p-8 bg-gray-50/80 backdrop-blur-md">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">File Attachment</h2>
                                
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]); }}
                                    className={`
                                        relative group cursor-pointer border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300
                                        ${isDragging ? 'border-brand-blue bg-brand-blue/5 scale-102' : 'border-gray-300 hover:border-brand-blue group-hover:bg-white'}
                                        ${data.file ? 'bg-brand-blue/5' : ''}
                                    `}
                                >
                                    <input
                                        type="file"
                                        onChange={e => handleFileChange(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    
                                    <div className="space-y-4">
                                        <div className={`w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${isDragging ? 'scale-110' : ''}`}>
                                            <i className={`fas fa-upload text-2xl ${data.file ? 'text-brand-blue' : 'text-gray-400'}`}></i>
                                        </div>
                                        
                                        {data.file ? (
                                            <div>
                                                <p className="font-bold text-brand-blue truncate max-w-full italic">{data.file.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">Successfully attached</p>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium text-gray-600">Drag and drop file here</p>
                                                <p className="text-xs text-gray-400">PDF, JPG, PNG or TXT up to 10MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Preview / Status Section */}
                                <div className="mt-10 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[150px]">
                                    <h3 className="text-sm uppercase tracking-widest font-extrabold text-gray-400 mb-4">Preview</h3>
                                    {previewContent ? (
                                        <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                            {previewContent}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-8">
                                            <div className="w-10 h-1 rounded-full bg-gray-100 mb-4" />
                                            <p className="text-xs text-gray-300 italic">No content to preview</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <i className="fas fa-check text-[10px] text-green-600"></i>
                                        </div>
                                        <div className="text-xs text-gray-500">Files are processed securely using AI-OCR for better searchability.</div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <i className="fas fa-info text-[10px] text-blue-600"></i>
                                        </div>
                                        <div className="text-xs text-gray-500">Ensure the paper is clear and readable for the best results.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .scale-102 { transform: scale(1.02); }
                .rounded-2xl { border-radius: 1.25rem; }
                .rounded-3xl { border-radius: 2rem; }
            `}</style>
        </AuthenticatedLayout>
    );
}
