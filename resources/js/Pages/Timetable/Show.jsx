import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Show({ auth, course, weakTopics, timetable, flash }) {
    const { data, setData, post, processing, errors } = useForm({
        uses_suggestion: 'yes',
        preferred_time: 'evening',
        study_hours: 10,
        has_custom_schedule: false,
        custom_schedules: [],
    });

    const addScheduleRule = () => {
        setData('custom_schedules', [...data.custom_schedules, { day: 'Monday', availability: 'not_available', start_time: '09:00', end_time: '17:00' }]);
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
        post(route('timetables.generate', course.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`AI Timetable for ${course.title}`} />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <Link href={route('courses.show', course.id)} className="text-sm text-brand-blue hover:underline mb-2 block">&larr; Back to Course Details</Link>
                        <h1 className="text-3xl font-bold text-brand-text">AI Study Timetable</h1>
                        <p className="text-brand-secondary mt-1">A personalized weekly schedule for {course.title}</p>
                    </div>

                    {flash.error && <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg">{flash.error}</div>}

                    {timetable ? (
                        // VIEW 1: DISPLAY THE TIMETABLE
                        <div className="bg-brand-white rounded-xl shadow-lg">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="text-xl font-bold text-brand-text">Your Weekly Plan</h3>
                                <button onClick={() => post(route('timetables.generate', course.id), data)} disabled={processing} className="px-4 py-2 bg-brand-orange text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-opacity-80">
                                    <i className="fas fa-sync-alt mr-2"></i>Regenerate
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                                {daysOfWeek.map(day => (
                                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-bold text-brand-text mb-3 text-center">{day}</h4>
                                        <div className="space-y-3">
                                            {timetable.schedule[day] && timetable.schedule[day].length > 0 ? (
                                                timetable.schedule[day].map((block, index) => (
                                                    <div key={index} className="bg-brand-blue/10 p-3 rounded-md">
                                                        <p className="font-semibold text-brand-blue text-sm">{block.time}</p>
                                                        <p className="font-bold text-brand-text mt-1">{block.topic}</p>
                                                        <p className="text-xs text-brand-secondary">{block.task}</p>
                                                    </div>
                                                ))
                                            ) : <p className="text-xs text-center text-gray-400">Rest Day</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // VIEW 2: SHOW THE SURVEY
                        <form onSubmit={submit} className="bg-brand-white rounded-xl shadow-lg p-8">
                             <h3 className="text-2xl font-bold text-brand-text mb-6">Create Your Timetable</h3>
                             {/* Survey questions here */}
                             <div className="space-y-6">
                                {/* Reading Preference */}
                                <div>
                                    <label className="font-semibold text-brand-text">When do you prefer reading?</label>
                                    <select onChange={e => setData('preferred_time', e.target.value)} value={data.preferred_time} className="mt-2 block w-full rounded-md border-gray-300 shadow-sm">
                                        <option value="morning">Morning (6am - 12pm)</option>
                                        <option value="evening">Evening (1pm - 6pm)</option>
                                        <option value="night">Night (7pm - 11pm)</option>
                                    </select>
                                </div>
                                {/* Study Hours */}
                                <div>
                                    <label className="font-semibold text-brand-text">How many hours can you spend per week?</label>
                                    <input type="number" onChange={e => setData('study_hours', e.target.value)} value={data.study_hours} className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                {/* Custom Schedule Toggle */}
                                <div className="flex items-center">
                                    <input type="checkbox" checked={data.has_custom_schedule} onChange={e => setData('has_custom_schedule', e.target.checked)} className="h-4 w-4 text-brand-blue rounded border-gray-300" />
                                    <label className="ml-2 font-semibold text-brand-text">Do you have a custom schedule?</label>
                                </div>

                                {/* Dynamic Custom Schedule Rules */}
                                {data.has_custom_schedule && (
                                    <div className="p-4 border-t space-y-4">
                                        {data.custom_schedules.map((rule, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                                                <select onChange={e => handleRuleChange(index, 'day', e.target.value)} value={rule.day} className="rounded-md border-gray-300 shadow-sm"><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option></select>
                                                <select onChange={e => handleRuleChange(index, 'availability', e.target.value)} value={rule.availability} className="rounded-md border-gray-300 shadow-sm"><option value="available">Available</option><option value="not_available">Not Available</option></select>
                                                <div className="flex items-center gap-2">
                                                    <input type="time" onChange={e => handleRuleChange(index, 'start_time', e.target.value)} value={rule.start_time} className="block w-full rounded-md border-gray-300 shadow-sm" />
                                                    <span>-</span>
                                                    <input type="time" onChange={e => handleRuleChange(index, 'end_time', e.target.value)} value={rule.end_time} className="block w-full rounded-md border-gray-300 shadow-sm" />
                                                </div>
                                                <button type="button" onClick={() => removeScheduleRule(index)} className="text-red-500 hover:text-red-700">&times; Remove</button>
                                            </div>
                                        ))}
                                        {data.custom_schedules.length < 7 && <button type="button" onClick={addScheduleRule} className="text-sm font-semibold text-brand-blue">+ Add a time rule</button>}
                                    </div>
                                )}
                                 {/* Hidden Feedback Question */}
                                <input type="hidden" onChange={e => setData('uses_suggestion', e.target.value)} value={data.uses_suggestion} />
                             </div>
                             <div className="mt-8 text-center">
                                <button type="submit" disabled={processing || weakTopics.length === 0} className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400">
                                    {processing ? 'Generating...' : 'Generate My Timetable'}
                                </button>
                             </div>
                        </form>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}