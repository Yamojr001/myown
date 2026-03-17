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
export default function Dashboard({ auth, recentCourses, latestTest, stats }) {

    const getAiInsight = () => { /* ... (This function is unchanged) ... */ };
    const renderCourseAction = (course) => { /* ... (This function is unchanged) ... */ };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-brand-text">Welcome Back, {auth.user.name.split(' ')[0]}!</h1>
                        <p className="text-brand-secondary mt-1">Here is your academic command center.</p>
                    </div>

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