import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ShowDetailed({ auth, course, readingPlan }) {
    const { post, processing } = useForm();

    const handleRegenerate = () => {
        if (confirm('Are you sure you want to regenerate the entire plan? This will replace your current detailed plan.')) {
            post(route('reading-plan.generate', course.id));
        }
    };

    // Helper to sort weeks numerically
    const sortedWeeks = Object.keys(readingPlan).sort((a, b) => {
        const numA = parseInt(a.replace('week_', ''));
        const numB = parseInt(b.replace('week_', ''));
        return numA - numB;
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-brand-text leading-tight">Reading Plan: {course.title} ({course.code})</h2>}
        >
            <Head title={`Reading Plan - ${course.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Header Actions */}
                            <div className="flex justify-between items-center mb-8 pb-4 border-b">
                                <div>
                                    <h3 className="text-2xl font-bold text-brand-text">Semester Study Strategy</h3>
                                    <p className="text-brand-secondary mt-1">Detailed week-by-week breakdown for this course.</p>
                                </div>
                                <div className="flex gap-4">
                                    <a
                                        href={route('reading-plan.download-handout', course.id)}
                                        target="_blank"
                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <i className="fas fa-file-pdf mr-2"></i>
                                        Download Handout
                                    </a>
                                    <Link
                                        href={route('reading-plan.index')}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Back to Architect
                                    </Link>
                                    <PrimaryButton onClick={handleRegenerate} disabled={processing}>
                                        <i className="fas fa-sync-alt mr-2"></i>
                                        {processing ? 'Regenerating...' : 'Regenerate Plan'}
                                    </PrimaryButton>
                                </div>
                            </div>

                            {/* Timeline-style Plan */}
                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-brand-blue/20 before:to-transparent">
                                {sortedWeeks.map((weekKey, index) => {
                                    const weekData = readingPlan[weekKey];
                                    const weekNumber = weekKey.replace('week_', '');
                                    const dailySegments = weekData.daily_segments || {};
                                    const days = Object.keys(dailySegments);
                                    
                                    return (
                                        <div key={weekKey} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Dot on the timeline */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-brand-blue text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                <span className="text-xs font-bold">{weekNumber}</span>
                                            </div>
                                            
                                            {/* Content Card */}
                                            <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-bold text-brand-blue text-lg">Week {weekNumber} Focus</div>
                                                </div>
                                                
                                                <p className="text-brand-text text-sm mb-4 leading-relaxed italic">
                                                    "{weekData.summary}"
                                                </p>

                                                <div className="space-y-4">
                                                    {/* DAILY SEGMENTS */}
                                                    <div>
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-3 flex items-center">
                                                            <i className="fas fa-calendar-day mr-2"></i> Daily Reading Segments
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {days.length > 0 ? days.map((day) => (
                                                                <div key={day} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                                    <div className="min-w-[70px] font-bold text-[10px] uppercase text-gray-400 mt-0.5">{day}</div>
                                                                    <div className="text-xs text-brand-text font-medium leading-relaxed">{dailySegments[day]}</div>
                                                                </div>
                                                            )) : (
                                                                <div className="text-xs text-gray-400 italic">No specific days scheduled for this course this week. General review recommended.</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Action Tasks</h4>
                                                        <ul className="space-y-1">
                                                            {(weekData.tasks || []).map((task, i) => (
                                                                <li key={i} className="text-xs text-brand-secondary flex items-start">
                                                                    <span className="text-brand-blue mr-2">•</span>
                                                                    {task}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bottom CTA */}
                            <div className="mt-12 p-8 bg-brand-blue/5 rounded-2xl text-center">
                                <h4 className="text-xl font-bold text-brand-text mb-2">Ready to master this course?</h4>
                                <p className="text-brand-secondary mb-6 max-w-xl mx-auto">
                                    Your detailed plan is strictly mapped to your master timetable. 
                                    Download the handout and follow your specific daily reading targets.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <Link
                                        href={route('reading-plan.index')}
                                        className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-50 shadow-sm transition-all"
                                    >
                                        Back to Architect
                                    </Link>
                                    <a
                                        href={route('reading-plan.download-handout', course.id)}
                                        target="_blank"
                                        className="inline-flex items-center px-6 py-3 bg-brand-blue text-white rounded-full font-bold hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 transition-all"
                                    >
                                        Download Study Handout
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
