import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, pastQuestions, universities, filters }) {
    const { data, setData, get, processing } = useForm({
        university: filters.university || '',
        course_code: filters.course_code || '',
        year: filters.year || '',
    });

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('past-questions.index'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Past Questions</h2>}
        >
            <Head title="Past Questions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Action */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Explore Past Questions</h1>
                            <p className="text-gray-600 mt-2">Find and solve previous exam papers from various universities.</p>
                        </div>
                        <Link
                            href={route('past-questions.upload')}
                            className="inline-flex items-center px-4 py-2 bg-brand-blue border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-brand-blue/90 focus:bg-brand-blue/90 active:bg-brand-dark transition ease-in-out duration-150 shadow-lg"
                        >
                            <i className="fas fa-upload mr-2"></i>
                            Upload Past Q
                        </Link>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center">
                                    <i className="fas fa-question-circle mr-2 text-brand-blue"></i>
                                    University
                                </label>
                                <select
                                    value={data.university}
                                    onChange={e => setData('university', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:border-brand-blue focus:ring-brand-blue transition-shadow"
                                >
                                    <option value="">All Universities</option>
                                    {universities.map(uni => (
                                        <option key={uni} value={uni}>{uni}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center">
                                    <i className="fas fa-book-open mr-2 text-brand-blue"></i>
                                    Course Code
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. CSC 101"
                                    value={data.course_code}
                                    onChange={e => setData('course_code', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:border-brand-blue focus:ring-brand-blue shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center">
                                    <i className="fas fa-calendar-alt mr-2 text-brand-blue"></i>
                                    Year
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 2023"
                                    value={data.year}
                                    onChange={e => setData('year', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:border-brand-blue focus:ring-brand-blue shadow-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center px-6 py-3 bg-brand-dark text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md group"
                            >
                                <i className="fas fa-search mr-2 group-hover:scale-110 transition-transform"></i>
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Results Grid */}
                    {pastQuestions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pastQuestions.map((pq) => (
                                <div key={pq.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="px-3 py-1 bg-brand-light text-brand-blue text-xs font-bold rounded-full uppercase tracking-wider">
                                                {pq.year}
                                            </div>
                                            <div className="text-xs text-gray-400 font-medium">
                                                {new Date(pq.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-blue transition-colors mb-1">
                                            {pq.course_code}: {pq.course_title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4 flex items-center">
                                            <i className="fas fa-graduation-cap mr-2"></i>
                                            {pq.school}
                                        </p>
                                        
                                        <div className="p-4 bg-gray-50 rounded-xl mb-6">
                                            <div className="text-xs text-gray-400 uppercase tracking-tight font-semibold mb-1">Exams Name</div>
                                            <div className="text-sm font-medium text-gray-700">{pq.exam_name}</div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Link
                                                href={route('past-questions.solve', pq.id)}
                                                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue/90 transition-all shadow-md active:scale-95"
                                            >
                                                <i className="fas fa-play mr-2"></i>
                                                Solve & AI
                                            </Link>
                                            <a
                                                href={route('past-questions.download', pq.id)}
                                                className="inline-flex items-center justify-center p-2.5 bg-brand-light text-brand-blue rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                                                title="Download PDF"
                                            >
                                                <i className="fas fa-download"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-search text-gray-300 text-3xl"></i>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">No past questions found</h2>
                            <p className="text-gray-500 mt-2">Try adjusting your search filters or upload a new one.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Styles */}
            <style>{`
                .rounded-2xl { border-radius: 1.25rem; }
                .rounded-3xl { border-radius: 2rem; }
                .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); }
            `}</style>
        </AuthenticatedLayout>
    );
}
