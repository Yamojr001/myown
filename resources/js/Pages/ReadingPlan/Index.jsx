import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, weeklySchedule, week, totalWeeks, semesterStartDate }) {
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

    const courses = weeklySchedule.courses || [];
    const objectives = weeklySchedule.weekly_objectives || [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Reading Plan" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow border-l-4 border-brand-blue">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-brand-text">Weekly Reading Plan</h1>
                            <p className="text-brand-secondary mt-1">
                                Semester Week {week} out of {totalWeeks}
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <Link
                                href={route('master-timetable.show')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                            >
                                <i className="fas fa-calendar-alt mr-2"></i>View Timetable
                            </Link>
                        </div>
                    </div>

                    {/* Objectives */}
                    {objectives.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow">
                            <h2 className="text-xl font-bold text-brand-text mb-4 border-b pb-2">
                                <i className="fas fa-bullseye text-brand-blue mr-2"></i>This Week's Objectives
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-brand-secondary">
                                {objectives.map((obj, idx) => (
                                    <li key={idx} className="leading-relaxed">{obj}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Courses Breakdown */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-brand-text">Course Breakdown</h2>

                        {courses.length === 0 && (
                            <p className="text-gray-500 italic">No specific course reading assignments for this week.</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {courses.map((course, idx) => (
                                <div key={idx} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
                                    <div className="bg-brand-blue/10 p-4 border-b">
                                        <h3 className="text-lg font-bold text-brand-blue">{course.course}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 font-medium">
                                            <span className="flex items-center bg-white px-2 py-1 rounded shadow-sm">
                                                <i className="fas fa-book-open text-brand-orange mr-2"></i>
                                                {course.pages_to_read} Pages
                                            </span>
                                            <span className="flex items-center bg-white px-2 py-1 rounded shadow-sm">
                                                <i className="fas fa-clock text-gray-500 mr-2"></i>
                                                ~{course.estimated_hours} Hours
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 flex-1">
                                        {course.topics && course.topics.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-2">Focus Topics</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {course.topics.map((topic, tidx) => (
                                                        <span key={tidx} className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {course.tasks && course.tasks.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-2">Tasks</h4>
                                                <ul className="space-y-2">
                                                    {course.tasks.map((task, taskIdx) => (
                                                        <li key={taskIdx} className="flex items-start text-sm text-gray-600">
                                                            <i className="fas fa-check-circle text-green-500 mt-1 mr-2 text-xs"></i>
                                                            <span>{task}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
