import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Transition } from '@headlessui/react';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Show({ auth, coursesData, allTestsTaken, timetable, flash }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        preferred_time: 'evening',
        study_hours: 15,
        has_custom_schedule: false,
        custom_schedules: [],
    });

    const addScheduleRule = () => {
        if (data.custom_schedules.length < 7) {
            setData('custom_schedules', [
                ...data.custom_schedules,
                { day: 'Monday', availability: 'not_available', start_time: '09:00', end_time: '17:00' }
            ]);
        }
    };

    const removeScheduleRule = (index) => {
        setData('custom_schedules', data.custom_schedules.filter((_, i) => i !== index));
    };

    const handleRuleChange = (index, field, value) => {
        const updatedRules = [...data.custom_schedules];
        updatedRules[index][field] = value;
        setData('custom_schedules', updatedRules);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('master-timetable.generate'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Master Timetable" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text">Master Study Timetable</h1>
                        <p className="text-brand-secondary mt-1 text-sm sm:text-base">
                            Your unified weekly schedule across all courses.
                        </p>
                    </div>

                    {/* Flash Errors */}
                    {flash.error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg text-sm sm:text-base">
                            {flash.error}
                        </div>
                    )}

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <div className="mb-6 p-4 bg-green-100 text-green-800 border border-green-300 rounded-lg text-sm sm:text-base">
                            Timetable generated successfully!
                        </div>
                    </Transition>

                    {/* ======================= VIEW 1: THE TIMETABLE ======================= */}
                    {timetable ? (
                        <div className="bg-white rounded-xl shadow-lg">
                            {/* Header */}
                            <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
                                <h3 className="text-lg sm:text-xl font-bold text-brand-text">Your Personalized Weekly Plan</h3>

                                <form onSubmit={submit}>
                                    <PrimaryButton disabled={processing}>
                                        <i className="fas fa-sync-alt mr-2"></i>Regenerate
                                    </PrimaryButton>
                                </form>
                            </div>

                            {/* Timetable Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 p-4 sm:p-6">
                                {daysOfWeek.map(day => (
                                    <div key={day} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <h4 className="font-bold text-brand-text mb-3 text-center">{day}</h4>

                                        <div className="space-y-3">
                                            {timetable.schedule[day]?.length > 0 ? (
                                                timetable.schedule[day].map((block, index) => (
                                                    <div key={index} className="bg-brand-blue/10 p-3 rounded-md shadow-sm">
                                                        <p className="font-semibold text-brand-blue text-xs sm:text-sm">{block.time}</p>
                                                        <p className="font-bold text-brand-text mt-1 text-sm">{block.topic}</p>
                                                        <p className="text-xs text-brand-secondary">{block.task}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-center text-gray-400 mt-10">Rest Day</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* ======================= VIEW 2: SUMMARY + FORM ======================= */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                            {/* SUMMARY TABLE */}
                            <div className="bg-white rounded-xl shadow-lg h-fit overflow-x-auto">
                                <div className="p-4 sm:p-6 border-b">
                                    <h3 className="text-lg sm:text-xl font-bold text-brand-text">Semester Overview</h3>
                                </div>

                                <div className="p-2 w-full overflow-x-auto">
                                    <table className="w-full min-w-[450px] text-left text-sm">
                                        <thead>
                                            <tr>
                                                <th className="p-3 font-semibold text-brand-secondary">Course</th>
                                                <th className="p-3 font-semibold text-brand-secondary">Score</th>
                                                <th className="p-3 font-semibold text-brand-secondary">Pages</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y">
                                            {coursesData.map(course => (
                                                <tr key={course.id} className="hover:bg-gray-50">
                                                    <td className="p-3 font-semibold text-brand-text">{course.title}</td>
                                                    <td
                                                        className={`p-3 font-bold ${
                                                            course.latest_score === null
                                                                ? "text-gray-400"
                                                                : course.latest_score < 50
                                                                ? "text-red-500"
                                                                : "text-green-500"
                                                        }`}
                                                    >
                                                        {course.latest_score !== null ? `${course.latest_score}%` : "Pending"}
                                                    </td>
                                                    <td className="p-3 text-brand-secondary">{course.page_count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* SURVEY FORM */}
                            <form onSubmit={submit} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                                <h3 className="text-xl font-bold text-brand-text mb-6">Tell the AI Your Preferences</h3>

                                {!allTestsTaken && (
                                    <div className="p-4 text-center bg-yellow-100 text-yellow-800 rounded-lg mb-6 text-sm">
                                        You must complete a test for all your courses before generating a master timetable.
                                    </div>
                                )}

                                <div className="space-y-6">

                                    {/* Preferred Time */}
                                    <div>
                                        <label className="font-semibold text-brand-text text-sm">Preferred study period</label>
                                        <select
                                            value={data.preferred_time}
                                            onChange={e => setData("preferred_time", e.target.value)}
                                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                                        >
                                            <option value="morning">Morning (6am - 12pm)</option>
                                            <option value="afternoon">Afternoon (1pm - 6pm)</option>
                                            <option value="night">Night (7pm - 11pm)</option>
                                        </select>
                                    </div>

                                    {/* Hours per week */}
                                    <div>
                                        <label className="font-semibold text-brand-text text-sm">
                                            Weekly study hours
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={data.study_hours}
                                            onChange={e => setData("study_hours", e.target.value)}
                                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                                        />
                                        <InputError message={errors.study_hours} className="mt-2" />
                                    </div>

                                    {/* Toggle Custom Schedule */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="has_custom"
                                            checked={data.has_custom_schedule}
                                            onChange={e => setData("has_custom_schedule", e.target.checked)}
                                            className="h-4 w-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                                        />
                                        <label htmlFor="has_custom" className="ml-2 font-semibold text-brand-text text-sm">
                                            I have a custom schedule with unavailable times
                                        </label>
                                    </div>

                                    {/* Custom Rules */}
                                    <Transition
                                        show={data.has_custom_schedule}
                                        enter="transition ease-in-out duration-300"
                                        enterFrom="opacity-0 -translate-y-4"
                                        enterTo="opacity-100 translate-y-0"
                                    >
                                        <div className="p-4 border-t space-y-4">
                                            {data.custom_schedules.map((rule, index) => (
                                                <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3">

                                                    <select
                                                        value={rule.day}
                                                        onChange={e => handleRuleChange(index, "day", e.target.value)}
                                                        className="rounded-md border-gray-300 shadow-sm"
                                                    >
                                                        {daysOfWeek.map(d => (
                                                            <option key={d}>{d}</option>
                                                        ))}
                                                    </select>

                                                    <select
                                                        value={rule.availability}
                                                        onChange={e => handleRuleChange(index, "availability", e.target.value)}
                                                        className="rounded-md border-gray-300 shadow-sm"
                                                    >
                                                        <option value="available">Available during</option>
                                                        <option value="not_available">Not available during</option>
                                                    </select>

                                                    {/* Time range */}
                                                    <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                                                        <input
                                                            type="time"
                                                            value={rule.start_time}
                                                            onChange={e => handleRuleChange(index, "start_time", e.target.value)}
                                                            className="block w-full rounded-md border-gray-300 shadow-sm"
                                                        />
                                                        <span>-</span>
                                                        <input
                                                            type="time"
                                                            value={rule.end_time}
                                                            onChange={e => handleRuleChange(index, "end_time", e.target.value)}
                                                            className="block w-full rounded-md border-gray-300 shadow-sm"
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeScheduleRule(index)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                                    >
                                                        &times; Remove
                                                    </button>
                                                </div>
                                            ))}

                                            {data.custom_schedules.length < 7 && (
                                                <button
                                                    type="button"
                                                    onClick={addScheduleRule}
                                                    className="text-sm font-semibold text-brand-blue hover:underline"
                                                >
                                                    + Add a time rule
                                                </button>
                                            )}
                                        </div>
                                    </Transition>
                                </div>

                                {/* Submit */}
                                <div className="mt-8 text-center">
                                    <PrimaryButton disabled={!allTestsTaken || processing} className="px-8 py-3">
                                        {processing ? "Generating..." : "Generate Master Timetable"}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
