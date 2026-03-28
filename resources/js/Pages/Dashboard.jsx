import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// A small, reusable component for our stat cards
const StatCard = ({ icon, title, value, colorClass = 'text-brand-blue' }) => (
    <div className="p-6 bg-brand-white rounded-xl shadow-lg flex items-center gap-6">
        <div className={`text-3xl ${colorClass}`}><i className={`fas ${icon}`}></i></div>
        <div>
            <h3 className="text-sm font-semibold text-brand-secondary uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-extrabold text-brand-text">{value}</p>
        </div>
    </div>
);

// The main Dashboard component
export default function Dashboard({ auth, recentCourses, latestTest, stats, semesterInfo }) {

    const getAiInsight = () => { /* ... (This function is unchanged) ... */ };
    const renderCourseAction = (course) => { /* ... (This function is unchanged) ... */ };

    const getWeekStatus = () => {
        if (!semesterInfo?.start_date) return '';
        
        const today = new Date();
        const startDate = new Date(semesterInfo.start_date);
        const diffTime = today - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `Semester starts in ${Math.abs(diffDays)} days`;
        } else if (diffDays === 0) {
            return 'Semester starts today';
        } else {
            return `Day ${diffDays + 1} of semester`;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-brand-text">Welcome Back, {auth.user.name.split(' ')[0]}!</h1>
                        <p className="text-brand-secondary mt-1">Here is your academic command center.</p>
                    </div>

                    {/* Semester Info Card */}
                    {semesterInfo?.has_timetable && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-brand-blue/10 to-blue-50 rounded-xl border-l-4 border-brand-blue shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                                        <i className="fas fa-calendar-alt text-brand-blue"></i>
                                        Week {semesterInfo.current_week} of {semesterInfo.total_weeks}
                                    </h3>
                                    <p className="text-sm text-brand-secondary mt-1">
                                        {getWeekStatus()}
                                    </p>
                                </div>
                                <Link 
                                    href={route('master-timetable.show')}
                                    className="px-4 py-2 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors text-center"
                                >
                                    <i className="fas fa-calendar-grid mr-2"></i>View Timetable
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard icon="fa-bullseye" title="Average Score" value={stats?.averageScore ? `${stats.averageScore}%` : 'N/A'} />
                        <StatCard icon="fa-book-open" title="Active Courses" value={stats?.totalCourses ?? 0} />
                        <div className="p-6 bg-gradient-to-br from-brand-dark to-slate-800 rounded-xl shadow-lg flex items-center gap-6">
                            <div className="text-3xl text-brand-blue"><i className="fas fa-lightbulb"></i></div>
                            <div>
                                <h3 className="text-sm font-semibold text-brand-blue uppercase tracking-wider">AI Insight</h3>
                                <p className="text-md text-gray-200">{getAiInsight()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-white rounded-xl shadow-lg">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-brand-text">Recent Courses</h3>
                            <Link href={route('courses.index')} className="text-sm text-brand-blue hover:underline font-semibold">View All</Link>
                        </div>

                        {recentCourses && recentCourses.length > 0 ? (
                            <ul className="divide-y divide-gray-200">{/* ... (list rendering is unchanged) ... */}</ul>
                        ) : (
                            <div className="p-10 text-center">{/* ... (empty state is unchanged) ... */}</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}