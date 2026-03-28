import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const toNumberedPoints = (segment) => {
    if (!segment) {
        return [];
    }

    const normalized = segment.replace(/\s+/g, ' ').trim();
    if (!normalized) {
        return [];
    }

    // Prefer split by sentence end; fallback to a single point.
    const parts = normalized
        .split(/(?<=[.!?])\s+/)
        .map((part) => part.trim())
        .filter(Boolean);

    return (parts.length > 0 ? parts : [normalized]).slice(0, 8);
};

export default function Handouts({ auth, courses }) {
    const { post, processing } = useForm();
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [generatingId, setGeneratingId] = useState(null);

    const selectedCourse = useMemo(
        () => courses.find((course) => course.id === selectedCourseId) ?? null,
        [courses, selectedCourseId],
    );

    const handleGenerateHandout = (courseId) => {
        setGeneratingId(courseId);
        post(route('reading-handouts.generate', courseId), {
            onFinish: () => setGeneratingId(null),
        });
    };

    const handleGeneratePlan = (courseId) => {
        post(route('reading-plan.generate', courseId));
    };

    const renderGeneratedHandout = (handout) => {
        if (!handout || !handout.weeks || !Array.isArray(handout.weeks)) {
            return (
                <div className="px-5 py-8 text-center text-sm italic text-brand-secondary">
                    <p>Handout data is invalid. Please regenerate.</p>
                </div>
            );
        }

        return (
            <div className="p-5">
                <div className="space-y-6">
                    {handout.weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="border-t border-gray-200 pt-4">
                            <h3 className="mb-4 text-lg font-black text-brand-blue">Week {week.week_number}</h3>
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {Object.keys(week.days || {}).sort((a, b) => {
                                    const order = { 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 7 };
                                    return (order[a.toLowerCase()] || 99) - (order[b.toLowerCase()] || 99);
                                }).map((dayKey) => {
                                    const dayData = week.days?.[dayKey];
                                    if (!dayData) return null;

                                    const dayName = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);

                                    return (
                                        <article key={`${week.week_number}-${dayKey}`} className="rounded-2xl border border-brand-blue/10 bg-brand-blue/[0.02] p-6 shadow-sm hover:shadow-md transition-all">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                                        <i className="fas fa-calendar-day text-xs"></i>
                                                    </div>
                                                    <h4 className="text-sm font-black text-brand-blue uppercase tracking-widest">
                                                        {dayName}
                                                    </h4>
                                                </div>
                                                <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-600">
                                                    AI Tailored
                                                </span>
                                            </div>

                                            {dayData.focus && (
                                                <div className="mb-4 bg-white/50 p-3 rounded-xl border border-brand-blue/5">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Focus Area</p>
                                                    <p className="text-sm font-bold text-gray-700 leading-tight">
                                                        {dayData.focus}
                                                    </p>
                                                </div>
                                            )}

                                            {Array.isArray(dayData.points) && dayData.points.length > 0 && (
                                                <div className="space-y-2 mb-4">
                                                    {dayData.points.map((point, pointIdx) => (
                                                        <div key={pointIdx} className="flex gap-3 text-sm leading-relaxed text-gray-600">
                                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-blue/30 shrink-0"></div>
                                                            {point}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {Array.isArray(dayData.tasks) && dayData.tasks.length > 0 && (
                                                <div className="mt-6 pt-5 border-t border-brand-blue/5 space-y-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Daily Tasks</p>
                                                    {dayData.tasks.map((task, taskIdx) => (
                                                        <label key={taskIdx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-brand-blue/5 transition-colors cursor-pointer group">
                                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue/20 cursor-pointer" />
                                                            <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors font-semibold">{task}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Reading Handouts" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="rounded-xl border-l-4 border-brand-blue bg-white p-6 shadow">
                        <h1 className="text-2xl font-black text-brand-text">Reading Handouts</h1>
                        <p className="mt-1 text-brand-secondary">
                            Select a course to view or generate AI-powered daily reading handouts.
                            Generate a handout to get structured, organized content by week and day.
                        </p>
                    </div>

                    {courses.length === 0 && (
                        <div className="rounded-xl bg-white p-10 text-center shadow">
                            <h2 className="text-xl font-bold text-brand-text">No courses found in your active semester.</h2>
                            <Link
                                href={route('courses.index')}
                                className="mt-3 inline-block text-brand-blue hover:underline"
                            >
                                Go to My Courses
                            </Link>
                        </div>
                    )}

                    {courses.length > 0 && (
                        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-lg font-black text-brand-text">Select a Course</h2>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {courses.map((course) => {
                                    const active = selectedCourseId === course.id;
                                    const isGenerating = generatingId === course.id;

                                    return (
                                        <button
                                            key={course.id}
                                            type="button"
                                            onClick={() => setSelectedCourseId(course.id)}
                                            className={`rounded-xl border p-4 text-left transition ${active
                                                ? 'border-brand-blue bg-brand-blue/5 shadow'
                                                : 'border-gray-200 bg-white hover:border-brand-blue/40'
                                            }`}
                                        >
                                            <h3 className="font-black text-brand-text">{course.title}</h3>
                                            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-secondary">{course.code}</p>
                                            <p className={`mt-2 text-xs font-semibold ${course.isHandoutGenerated ? 'text-green-700' : 'text-amber-700'}`}>
                                                {isGenerating && '⏳ Generating...'}
                                                {!isGenerating && course.isHandoutGenerated && '✅ Handout ready'}
                                                {!isGenerating && !course.isHandoutGenerated && '📝 Generate a handout'}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {selectedCourse && (
                        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-brand-text">{selectedCourse.title}</h2>
                                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-secondary">{selectedCourse.code}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {!selectedCourse.isHandoutGenerated ? (
                                        <button
                                            onClick={() => handleGenerateHandout(selectedCourse.id)}
                                            disabled={generatingId === selectedCourse.id}
                                            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-bold text-white hover:bg-brand-blue/90 disabled:opacity-50"
                                        >
                                            {generatingId === selectedCourse.id ? '⏳ Generating...' : '✨ Generate Handout'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleGenerateHandout(selectedCourse.id)}
                                            disabled={generatingId === selectedCourse.id}
                                            className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-brand-blue hover:bg-blue-100 disabled:opacity-50"
                                        >
                                            {generatingId === selectedCourse.id ? '⏳ Regenerating...' : '🔄 Regenerate'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {selectedCourse.isHandoutGenerated ? (
                                renderGeneratedHandout(selectedCourse.generatedHandout)
                            ) : (
                                <div className="p-5">
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                        <p className="text-sm font-semibold text-amber-900">
                                            No handout generated yet. Click "Generate Handout" above to create an AI-powered reading handout for this course.
                                        </p>
                                        <p className="mt-2 text-xs text-amber-800">
                                            The AI will analyze the course content and create a structured, week-by-week guide with daily readings and tasks.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {!selectedCourse && courses.length > 0 && (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm italic text-brand-secondary">
                            Select a course above to view or generate its reading handout.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
