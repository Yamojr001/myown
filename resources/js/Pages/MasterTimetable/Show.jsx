import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Transition } from '@headlessui/react';
import { useState, useEffect } from 'react';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Show({ auth, coursesData, allTestsTaken, timetable, currentWeekSchedule, semesterInfo, testInfo, flash }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        preferred_time: 'evening',
        study_hours: 15,
        semester_duration_weeks: 15,
        semester_current_week: 1,
        semester_start_date: new Date().toISOString().split('T')[0],
        has_custom_schedule: false,
        custom_schedules: [],
    });

    const [currentWeek, setCurrentWeek] = useState(semesterInfo?.current_week || 1);
    const [weekSchedule, setWeekSchedule] = useState(currentWeekSchedule || (timetable?.schedule || null));

    useEffect(() => {
        if (timetable && timetable.weekly_schedule && currentWeek) {
            fetchWeekSchedule(currentWeek);
        }
    }, [currentWeek, timetable]);

    const fetchWeekSchedule = async (week) => {
        try {
            const response = await fetch(`/master-timetable/week/${week}`);
            const data = await response.json();
            if (data.schedule) {
                setWeekSchedule(data.schedule);
            }
        } catch (error) {
            console.error('Error fetching week schedule:', error);
        }
    };

    const handleWeekChange = (direction) => {
        const newWeek = direction === 'next' ? currentWeek + 1 : currentWeek - 1;
        if (newWeek >= 1 && newWeek <= semesterInfo?.total_weeks) {
            setCurrentWeek(newWeek);
        }
    };

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

    const startCurrentTest = () => {
        router.get(route('master-timetable.start-test'));
    };

    const getWeekStatus = () => {
        if (!semesterInfo?.start_date) return '';

        const today = new Date(semesterInfo.today);
        const startDate = new Date(semesterInfo.start_date);
        const diffTime = today - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `${Math.abs(diffDays)} days until semester starts`;
        } else if (diffDays === 0) {
            return 'Semester starts today';
        } else {
            return `Day ${diffDays + 1} of semester`;
        }
    };

    const getTestStatus = (testWeek) => {
        if (!semesterInfo?.current_week) return 'upcoming';
        if (testWeek < semesterInfo.current_week) return 'completed';
        if (testWeek === semesterInfo.current_week) return 'current';
        return 'upcoming';
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

                    {/* Flash Messages */}
                    {flash.error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg text-sm sm:text-base">
                            {flash.error}
                        </div>
                    )}

                    {flash.success && (
                        <div className="mb-6 p-4 bg-green-100 text-green-800 border border-green-300 rounded-lg text-sm sm:text-base">
                            {flash.success}
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

                    {/* Test Alert */}
                    {testInfo?.needs_test && (
                        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-yellow-800">Test Due This Week!</h4>
                                    <p className="text-sm text-yellow-700">
                                        {testInfo.next_test?.name} is scheduled for this week.
                                    </p>
                                </div>
                                <PrimaryButton
                                    onClick={startCurrentTest}
                                    className="bg-yellow-600 hover:bg-yellow-700"
                                >
                                    Take Test Now
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* ======================= VIEW 1: THE TIMETABLE ======================= */}
                    {timetable ? (
                        <div className="bg-white rounded-xl shadow-lg">
                            {/* Header with Week Navigation */}
                            <div className="p-4 sm:p-6 border-b">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-brand-text">
                                            Semester Week {currentWeek} of {semesterInfo?.total_weeks}
                                        </h3>
                                        <p className="text-sm text-brand-secondary mt-1">
                                            {semesterInfo?.start_date && (
                                                <>
                                                    Semester started: {new Date(semesterInfo.start_date).toLocaleDateString()}
                                                    <span className="mx-2">•</span>
                                                    {getWeekStatus()}
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Week Navigation */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleWeekChange('prev')}
                                                disabled={currentWeek <= 1}
                                                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                            >
                                                ← Prev
                                            </button>
                                            <span className="font-semibold">
                                                Week {currentWeek}
                                            </span>
                                            <button
                                                onClick={() => handleWeekChange('next')}
                                                disabled={currentWeek >= semesterInfo?.total_weeks}
                                                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                            >
                                                Next →
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <a
                                                href={route('master-timetable.download', { week: currentWeek })}
                                                target="_blank"
                                                className="inline-flex items-center mx-2 px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                            >
                                                <i className="fas fa-download mr-2"></i>Download PDF
                                            </a>
                                            <form onSubmit={submit}>
                                                <PrimaryButton disabled={processing}>
                                                    <i className="fas fa-sync-alt mr-2"></i>Regenerate
                                                </PrimaryButton>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Test Schedule */}
                            {timetable?.test_schedule && (
                                <div className="p-4 sm:p-6 border-b bg-blue-50">
                                    <h4 className="font-bold text-brand-text mb-3">Test Schedule</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {timetable.test_schedule.map((test, index) => {
                                            const status = getTestStatus(test.week);
                                            return (
                                                <div key={index} className={`p-4 rounded-lg ${status === 'completed' ? 'bg-green-100 border border-green-300' :
                                                    status === 'current' ? 'bg-yellow-100 border-2 border-yellow-400' :
                                                        'bg-white border'
                                                    }`}>
                                                    <h5 className="font-bold text-brand-text">{test.name}</h5>
                                                    <p className="text-sm text-gray-600">Week {test.week}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{test.description}</p>
                                                    <div className="mt-3">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${status === 'completed' ? 'bg-green-200 text-green-800' :
                                                            status === 'current' ? 'bg-yellow-200 text-yellow-800' :
                                                                'bg-gray-200 text-gray-800'
                                                            }`}>
                                                            {status === 'completed' ? 'Completed' :
                                                                status === 'current' ? 'Current Week' : 'Upcoming'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Weekly Objectives */}
                            {timetable.weekly_schedule?.[`week_${currentWeek}`]?.weekly_objectives && (
                                <div className="p-4 sm:p-6 border-b bg-blue-50">
                                    <h4 className="font-bold text-brand-text mb-2">This Week's Objectives</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {timetable.weekly_schedule[`week_${currentWeek}`].weekly_objectives.map((obj, idx) => (
                                            <li key={idx} className="text-sm text-brand-secondary">{obj}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Course Breakdown for This Week */}
                            {timetable.weekly_schedule?.[`week_${currentWeek}`]?.courses && (
                                <div className="p-4 sm:p-6 border-b">
                                    <h4 className="font-bold text-brand-text mb-3">Weekly Course Breakdown</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {timetable.weekly_schedule[`week_${currentWeek}`].courses.map((course, idx) => (
                                            <div key={idx} className="border rounded-lg p-4">
                                                <h5 className="font-bold text-brand-blue">{course.course}</h5>
                                                <p className="text-sm text-brand-secondary mt-1">
                                                    Pages: {course.pages_to_read} • Est. {course.estimated_hours} hrs
                                                </p>
                                                <ul className="mt-2 space-y-1">
                                                    {course.tasks.map((task, taskIdx) => (
                                                        <li key={taskIdx} className="text-xs flex items-start">
                                                            <span className="mr-2">✓</span>
                                                            <span>{task}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Timetable Standard Grid */}
                            <div className="p-4 md:p-6 overflow-x-auto">
                                <h4 className="font-bold text-brand-text mb-4 text-xl">Daily Schedule Grid</h4>

                                <div className="inline-block min-w-full align-middle">
                                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                        <table className="min-w-[1000px] w-full text-left border-collapse table-fixed">
                                        <thead>
                                            <tr className="bg-brand-blue text-white">
                                                <th className="p-3 border-r border-brand-blue/20 w-32 font-semibold">Time</th>
                                                {daysOfWeek.map(day => (
                                                    <th key={day} className="p-3 border-r border-brand-blue/20 text-center font-semibold w-1/7">
                                                        {day}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {/* Extract all unique timeslots across all days to form rows */}
                                            {(() => {
                                                const timeSlotsMap = new Map();
                                                daysOfWeek.forEach(day => {
                                                    if (weekSchedule?.[day]?.length > 0) {
                                                        weekSchedule[day].forEach(block => {
                                                            if (!timeSlotsMap.has(block.time)) {
                                                                timeSlotsMap.set(block.time, {});
                                                            }
                                                            timeSlotsMap.get(block.time)[day] = block;
                                                        });
                                                    }
                                                });

                                                // Sort timeslots by parsing the start time roughly string wise
                                                const sortedTimes = Array.from(timeSlotsMap.keys()).sort();

                                                if (sortedTimes.length === 0) {
                                                    return (
                                                        <tr>
                                                            <td colSpan="8" className="p-8 text-center text-gray-400 italic">
                                                                No scheduled blocks for this week. Rest well!
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                return sortedTimes.map((time, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                        <td className="p-3 bg-gray-50 border-r border-gray-200 font-bold text-brand-text text-sm whitespace-nowrap">
                                                            {time}
                                                        </td>
                                                        {daysOfWeek.map(day => {
                                                            const block = timeSlotsMap.get(time)[day];
                                                            if (!block) {
                                                                return <td key={day} className="p-2 border-r border-gray-200 bg-white"></td>;
                                                            }

                                                            return (
                                                                <td key={day} className="p-2 border-r border-gray-200 align-top">
                                                                    <div className={`h-full p-3 rounded-md shadow-sm flex flex-col justify-between ${block.is_test_day ? 'bg-yellow-100 border-l-4 border-yellow-400' :
                                                                            block.is_test_prep ? 'bg-blue-100 border-l-4 border-blue-400' :
                                                                                block.is_rest_day ? 'bg-green-100 border-l-4 border-green-400' :
                                                                                    'bg-brand-blue/5 border-l-4 border-brand-blue hover:bg-brand-blue/10'
                                                                        }`}>
                                                                        <div>
                                                                            <p className="font-bold text-brand-text text-sm leading-tight">{block.topic}</p>
                                                                            <p className="text-xs text-brand-secondary mt-1 line-clamp-2" title={block.task}>{block.task}</p>
                                                                        </div>
                                                                        {block.course && block.course !== 'None' && (
                                                                            <div className="mt-2 pt-2 border-t border-black/5">
                                                                                <p className="text-xs font-semibold text-gray-600 truncate">{block.course}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                        {/* Row for Rest Days that have no specific time block but take the whole day */}
                                        {(() => {
                                            const allDayRestDays = daysOfWeek.filter(day => {
                                                const blocks = weekSchedule?.[day] || [];
                                                return blocks.length === 1 && blocks[0].is_rest_day && blocks[0].time === 'All Day';
                                            });
                                            if (allDayRestDays.length > 0) {
                                                return (
                                                    <tr className="bg-gray-50">
                                                        <td className="p-3 border-r border-gray-200 font-bold text-gray-500 text-sm whitespace-nowrap">
                                                            All Day
                                                        </td>
                                                        {daysOfWeek.map(day => (
                                                            <td key={day} className="p-2 border-r border-gray-200 align-top">
                                                                {allDayRestDays.includes(day) && (
                                                                    <div className="h-full p-3 bg-green-100 border-l-4 border-green-400 rounded-md shadow-sm text-center flex items-center justify-center">
                                                                        <span className="font-bold text-green-700">Rest / Recovery</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            }
                                            return null;
                                        })()}
                                        </table>
                                    </div>
                                </div>
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
                                                <th className="p-3 font-semibold text-brand-secondary">Test</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y">
                                            {coursesData.map(course => (
                                                <tr key={course.id} className="hover:bg-gray-50">
                                                    <td className="p-3 font-semibold text-brand-text">{course.title}</td>
                                                    <td
                                                        className={`p-3 font-bold ${course.latest_score === null
                                                            ? "text-gray-400"
                                                            : course.latest_score < 50
                                                                ? "text-red-500"
                                                                : "text-green-500"
                                                            }`}
                                                    >
                                                        {course.latest_score !== null ? `${course.latest_score}%` : "Pending"}
                                                    </td>
                                                    <td className="p-3 text-brand-secondary">{course.page_count}</td>
                                                    <td className="p-3">
                                                        {course.has_initial_test ? (
                                                            <span className="text-green-600 text-sm">✓ Initial Test</span>
                                                        ) : (
                                                            <span className="text-red-500 text-sm">No Test</span>
                                                        )}
                                                    </td>
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
                                        You must complete an initial test for all your courses before generating a master timetable.
                                    </div>
                                )}

                                <div className="space-y-6">

                                    {/* Semester Duration */}
                                    <div>
                                        <label className="font-semibold text-brand-text text-sm">
                                            Semester Duration (weeks)
                                        </label>
                                        <input
                                            type="number"
                                            min="8"
                                            max="52"
                                            value={data.semester_duration_weeks}
                                            onChange={e => setData("semester_duration_weeks", e.target.value)}
                                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Note: System will schedule 3 progress tests and 1 mock exam based on duration
                                        </p>
                                        <InputError message={errors.semester_duration_weeks} className="mt-2" />
                                    </div>

                                    {/* Current Week */}
                                    <div>
                                        <label className="font-semibold text-brand-text text-sm">
                                            Current Semester Week
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={data.semester_duration_weeks}
                                            value={data.semester_current_week}
                                            onChange={e => setData("semester_current_week", e.target.value)}
                                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            The week you want to start reading from
                                        </p>
                                        <InputError message={errors.semester_current_week} className="mt-2" />
                                    </div>

                                    {/* Semester Start Date */}
                                    <div>
                                        <label className="font-semibold text-brand-text text-sm">
                                            Semester Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.semester_start_date}
                                            onChange={e => setData("semester_start_date", e.target.value)}
                                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                                        />
                                        <InputError message={errors.semester_start_date} className="mt-2" />
                                    </div>

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