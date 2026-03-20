import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';

export default function Index({ auth, weeklySchedule, week, totalWeeks, semesterStartDate, courses }) {
    const [generatingId, setGeneratingId] = useState(null);
    const { post, processing } = useForm();

    const handleGenerate = (courseId) => {
        setGeneratingId(courseId);
        post(route('reading-plan.generate', courseId), {
            onFinish: () => setGeneratingId(null),
        });
    };

    if (!weeklySchedule) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Reading Plan" />
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto text-center py-20 bg-white rounded-xl shadow">
                        <h2 className="text-2xl font-bold text-gray-500">No reading plan found for this week.</h2>
                        <Link href={route('master-timetable.show')} className="mt-4 inline-block text-brand-blue hover:underline">
                            Return to Master Timetable
                        </Link>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const weeklyCourses = weeklySchedule.courses || [];
    const objectives = weeklySchedule.weekly_objectives || [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Reading Plan" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow border-l-4 border-brand-blue">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-brand-text">Study Architect</h1>
                            <p className="text-brand-secondary mt-1">
                                Semester Week {week} out of {totalWeeks}
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex gap-4">
                            <Link
                                href={route('master-timetable.show')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                            >
                                <i className="fas fa-calendar-alt mr-2"></i>Timetable
                            </Link>
                        </div>
                    </div>

                    {/* Detailed Course Plans Section */}
                    <section className="bg-brand-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-black text-brand-text mb-6 flex items-center gap-3">
                            <i className="fas fa-book-reader text-brand-blue"></i> Detailed Course Reading Plans
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <div key={course.id} className="border border-gray-100 rounded-xl p-5 hover:border-brand-blue/30 transition-colors bg-gray-50/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-brand-text leading-tight">{course.title}</h3>
                                            <p className="text-xs text-brand-secondary uppercase font-black tracking-widest mt-1">{course.code}</p>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${course.reading_plan ? 'bg-green-500' : 'bg-gray-300'} shadow-sm`}></div>
                                    </div>
                                    
                                    {course.reading_plan ? (
                                        <div className="space-y-4">
                                            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                                <p className="text-xs text-green-700 font-bold mb-1 uppercase tracking-tighter">Current Week Focus</p>
                                                <p className="text-sm text-green-800 font-medium line-clamp-2 italic">
                                                    {course.reading_plan[`week_${week}`]?.summary || "General review and preparation."}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('reading-plan.show', course.id)}
                                                    className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-brand-blue/90 transition-colors"
                                                >
                                                    View Full Plan
                                                </Link>
                                                <PrimaryButton
                                                    onClick={() => handleGenerate(course.id)}
                                                    className="bg-gray-100 !text-gray-700 hover:bg-gray-200"
                                                    disabled={processing || generatingId === course.id}
                                                >
                                                    <i className="fas fa-sync-alt mr-2"></i>Regenerate
                                                </PrimaryButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-brand-secondary mb-4 italic">No detailed plan generated yet.</p>
                                            <button 
                                                onClick={() => handleGenerate(course.id)}
                                                disabled={generatingId === course.id}
                                                className="w-full py-2 bg-brand-blue text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-600 transition disabled:opacity-50"
                                            >
                                                {generatingId === course.id ? (
                                                    <><i className="fas fa-spinner fa-spin mr-2"></i>Generating...</>
                                                ) : (
                                                    <><i className="fas fa-magic mr-2"></i>Generate Plan</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Weekly Breakdown (Current Week) */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-brand-text">Week {week} Schedule</h2>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        {/* Objectives */}
                        {objectives.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-brand-text mb-4">
                                    <i className="fas fa-bullseye text-brand-blue mr-2"></i>Focus Objectives
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-brand-secondary">
                                    {objectives.map((obj, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <i className="fas fa-star text-yellow-500 mt-1"></i>
                                            <span>{obj}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {weeklyCourses.map((wc, idx) => {
                                // Find the original course to get the detailed plan if it exists
                                const originalCourse = courses.find(c => c.title === wc.course);
                                const detailedWeek = originalCourse?.reading_plan?.[`week_${week}`];

                                return (
                                    <div key={idx} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group">
                                        <div className="bg-gray-50 p-4 border-b group-hover:bg-brand-blue/5 transition-colors">
                                            <h3 className="text-lg font-black text-brand-text">{wc.course}</h3>
                                            <div className="flex items-center gap-4 mt-2 text-xs font-bold text-brand-secondary">
                                                <span className="flex items-center">
                                                    <i className="fas fa-book-open text-brand-blue mr-1.5"></i>
                                                    {detailedWeek?.pages || wc.pages_to_read}
                                                </span>
                                                <span className="flex items-center">
                                                    <i className="fas fa-clock text-gray-400 mr-1.5"></i>
                                                    {wc.estimated_hours} Hours
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 space-y-5">
                                            <div>
                                                <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2">Detailed Summary</h4>
                                                <p className="text-sm text-brand-secondary italic leading-relaxed">
                                                    "{detailedWeek?.summary || wc.reading_summary || "Study and master the core concepts for this week."}"
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2">Key Topics</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(detailedWeek?.topics || wc.topics || ["General Review"]).map((topic, tidx) => (
                                                        <span key={tidx} className="px-2 py-0.5 bg-gray-100 text-brand-text rounded text-[10px] font-bold">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2">Action Tasks</h4>
                                                <ul className="space-y-2">
                                                    {(detailedWeek?.tasks || wc.tasks || []).map((task, taskIdx) => (
                                                        <li key={taskIdx} className="flex items-start gap-2 text-sm text-gray-600">
                                                            <div className="min-w-[14px] h-[14px] rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                                                <i className="fas fa-check text-[8px] text-green-600"></i>
                                                            </div>
                                                            <span className="text-xs font-medium">{task}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
