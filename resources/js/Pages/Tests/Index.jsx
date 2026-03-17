import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ auth, courses }) {
    const [activeTab, setActiveTab] = useState('Mid-Semester');

    const { data, setData, post, processing, errors } = useForm({
        course_id: courses.length > 0 ? courses[0].id : '',
        test_type: 'Mid-Semester',
        question_count: 50,
    });

    const handleTabChange = (tabName, defaultCount) => {
        setActiveTab(tabName);
        setData({
            ...data,
            test_type: tabName,
            question_count: defaultCount
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('tests.generate'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-brand-dark leading-tight">Tests & Assessments Dashboard</h2>}
        >
            <Head title="Tests Dashboard" />

            <div className="py-12 bg-brand-light min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {courses.length === 0 ? (
                        <div className="bg-brand-white overflow-hidden shadow-sm sm:rounded-2xl p-10 text-center">
                            <i className="fas fa-book-open text-6xl text-brand-orange/30 mb-4"></i>
                            <h3 className="text-xl font-bold text-brand-dark">No Courses Found</h3>
                            <p className="text-brand-secondary mt-2 mb-6">You need to upload at least one course syllabus before you can generate tests.</p>
                            <Link href={route('courses.index')} className="bg-brand-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition">
                                Add a Course Now
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-brand-white overflow-hidden shadow-xl sm:rounded-2xl border border-gray-100">

                            <div className="flex flex-wrap border-b border-gray-200">
                                <button
                                    onClick={() => handleTabChange('Mid-Semester', 50)}
                                    className={`flex-1 py-4 px-6 text-center text-sm font-bold uppercase transition-colors ${activeTab === 'Mid-Semester' ? 'bg-brand-orange/10 text-brand-orange border-b-2 border-brand-orange' : 'text-brand-secondary hover:bg-gray-50'}`}
                                >
                                    <i className="fas fa-file-alt mr-2"></i> Mid-Semester Test
                                </button>
                                <button
                                    onClick={() => handleTabChange('Mock Exam', 5)}
                                    className={`flex-1 py-4 px-6 text-center text-sm font-bold uppercase transition-colors ${activeTab === 'Mock Exam' ? 'bg-brand-orange/10 text-brand-orange border-b-2 border-brand-orange' : 'text-brand-secondary hover:bg-gray-50'}`}
                                >
                                    <i className="fas fa-pen-nib mr-2"></i> Mock Exam (Essay)
                                </button>
                                <button
                                    onClick={() => handleTabChange('Random Test', 20)}
                                    className={`flex-1 py-4 px-6 text-center text-sm font-bold uppercase transition-colors ${activeTab === 'Random Test' ? 'bg-brand-orange/10 text-brand-orange border-b-2 border-brand-orange' : 'text-brand-secondary hover:bg-gray-50'}`}
                                >
                                    <i className="fas fa-dice mr-2"></i> Random Test
                                </button>
                            </div>

                            <div className="p-8">
                                <form onSubmit={submit} className="max-w-2xl mx-auto space-y-8">

                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-black text-brand-dark mb-2">
                                            {activeTab === 'Mid-Semester' && 'Standard Multiple Choice'}
                                            {activeTab === 'Mock Exam' && 'AI-Graded Essay Exam'}
                                            {activeTab === 'Random Test' && 'Custom Multiple Choice'}
                                        </h3>
                                        <p className="text-brand-secondary">
                                            {activeTab === 'Mid-Semester' && 'Generate a comprehensive 50-question objective test covering all course topics evenly.'}
                                            {activeTab === 'Mock Exam' && 'Generate an essay-based exam and use the voice-to-text dictation tool to write your answers. Graded by AI.'}
                                            {activeTab === 'Random Test' && 'Generate a quick multiple-choice quiz with a custom number of questions to test your knowledge.'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-brand-dark mb-2">Select Course to Test On</label>
                                        <select
                                            className="w-full border-gray-300 rounded-xl shadow-sm focus:border-brand-orange focus:ring focus:ring-brand-orange/20"
                                            value={data.course_id}
                                            onChange={(e) => setData('course_id', e.target.value)}
                                            required
                                        >
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>{course.title} ({course.code})</option>
                                            ))}
                                        </select>
                                        {errors.course_id && <p className="text-red-500 text-xs mt-1">{errors.course_id}</p>}
                                    </div>

                                    {activeTab === 'Random Test' && (
                                        <div>
                                            <label className="block text-sm font-bold text-brand-dark mb-2">Number of Questions (5-100)</label>
                                            <input
                                                type="number"
                                                min="5"
                                                max="100"
                                                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-brand-orange focus:ring focus:ring-brand-orange/20"
                                                value={data.question_count}
                                                onChange={(e) => setData('question_count', e.target.value)}
                                                required
                                            />
                                            {errors.question_count && <p className="text-red-500 text-xs mt-1">{errors.question_count}</p>}
                                        </div>
                                    )}

                                    {errors.test_type && <p className="text-red-500 text-xs mt-1">{errors.test_type}</p>}

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full py-4 bg-brand-orange text-white rounded-xl shadow-xl shadow-brand-orange/30 font-black text-lg hover:-translate-y-1 transition-transform disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {processing ? (
                                                <><i className="fas fa-spinner fa-spin"></i> Generating Test...</>
                                            ) : (
                                                <><i className="fas fa-magic"></i> Generate {activeTab}</>
                                            )}
                                        </button>
                                        <p className="text-center text-xs text-brand-secondary mt-3">
                                            <i className="fas fa-bolt text-yellow-400 mr-1"></i> Powered by Gemini 2.5 Flash
                                        </p>
                                    </div>
                                </form>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
