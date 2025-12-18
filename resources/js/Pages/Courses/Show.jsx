import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// Reusable Stat Card component for this page
const StatCard = ({ icon, title, value, colorClass = 'text-brand-blue' }) => (
    <div className="p-6 bg-brand-white rounded-xl shadow-lg flex items-start gap-4">
        <div className={`text-2xl ${colorClass} mt-1`}><i className={`fas ${icon}`}></i></div>
        <div>
            <h3 className="text-sm font-semibold text-brand-secondary uppercase tracking-wider">{title}</h3>
            <p className="text-2xl font-extrabold text-brand-text">{value}</p>
        </div>
    </div>
);

export default function Show({ auth, course }) {
    // Get the most recent test from the `tests` array (which we ordered by newest first in the controller)
    const latestTest = course.tests.length > 0 ? course.tests[0] : null;
    const weakTopics = latestTest?.weak_topics || [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={course.title} />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Page Header */}
                    <div className="mb-8">
                        <Link href={route('courses.index')} className="text-sm text-brand-blue hover:underline mb-2 block">&larr; Back to All Courses</Link>
                        <h1 className="text-3xl font-bold text-brand-text">{course.title}</h1>
                        <p className="text-brand-secondary mt-1">{course.code}</p>
                    </div>

                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard icon="fa-percent" title="Current Mastery" value={`${course.progress}%`} />
                        <StatCard icon="fa-clipboard-check" title="Tests Taken" value={course.tests.length} />
                        <StatCard icon="fa-bullseye" title="Weak Topics" value={weakTopics.length} colorClass="text-brand-orange" />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        
                        {/* Left Column: AI-Generated Syllabus Topics */}
                        <div className="lg:col-span-3 bg-brand-white rounded-xl shadow-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-brand-text">AI-Generated Syllabus Topics</h3>
                            </div>
                            {course.topics && course.topics.length > 0 ? (
                                <ul className="divide-y divide-gray-200 p-2">
                                    {course.topics.map((topic, index) => (
                                        <li key={index} className="p-4 flex items-center">
                                            <i className="fas fa-check-circle text-green-500/70 mr-4"></i>
                                            <span className="text-brand-text">{topic}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-10 text-center text-brand-secondary">No topics were extracted from the syllabus.</div>
                            )}
                        </div>

                        {/* Right Column: Actions & History */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* =============================================== */}
                            {/* NEW: AI-IDENTIFIED WEAK TOPICS CARD             */}
                            {/* This card only renders if there are weak topics */}
                            {/* =============================================== */}
                            {weakTopics.length > 0 && (
                                <div className="bg-brand-white rounded-xl shadow-lg">
                                    <div className="p-6 border-b border-gray-200 flex items-center gap-3">
                                        <i className="fas fa-bullseye text-brand-orange text-xl"></i>
                                        <h3 className="text-xl font-bold text-brand-text">Your Focus Areas</h3>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-sm text-brand-secondary mb-4">Based on your last test, your AI study plan will prioritize these topics:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {weakTopics.map((topic, index) => (
                                                <span key={index} className="bg-brand-orange/10 text-brand-orange text-xs font-semibold px-3 py-1.5 rounded-full">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                             <div className="bg-brand-white rounded-xl shadow-lg p-6 text-center">
                                <h3 className="text-xl font-bold text-brand-text mb-4">Next Step</h3>
                                <p className="text-brand-secondary mb-4">Generate your personalized study plan based on your test results.</p>
                                <Link href={route('suggestion.show', course.id)} className="block w-full text-center px-6 py-3 bg-brand-orange text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-transform hover:scale-105">
                                    <i className="fas fa-magic mr-2"></i> Generate AI Study Guide
                                </Link>
                             </div>

                             <div className="bg-brand-white rounded-xl shadow-lg">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-brand-text">Test History</h3>
                                </div>
                                {course.tests && course.tests.length > 0 ? (
                                    <ul className="divide-y divide-gray-200 p-6">
                                        {course.tests.map((test) => (
                                            <li key={test.id} className="py-3 flex justify-between items-center">
                                                <span className="font-semibold text-brand-text">{test.type}</span>
                                                <span className={`font-bold text-lg ${test.score < 50 ? 'text-red-500' : 'text-green-500'}`}>{test.score}%</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                     <div className="p-10 text-center text-brand-secondary">No tests taken for this course yet.</div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}