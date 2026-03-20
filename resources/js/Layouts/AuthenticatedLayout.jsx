import { useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import { Link, usePage } from '@inertiajs/react';
import WhatsAppFloatingButton from '@/Components/WhatsAppFloatingButton';

export default function Authenticated({ user, children }) {
    const { active_alerts, test_alert } = usePage().props;
    const [showingNavigation, setShowingNavigation] = useState(false);
    const [isAlertDismissed, setIsAlertDismissed] = useState(false);

    return (
        <div className="min-h-screen bg-brand-light">
            <Sidebar user={user} showing={showingNavigation} />

            {/* Overlay for mobile when sidebar is open, clicking it closes the sidebar */}
            {showingNavigation && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setShowingNavigation(false)}
                ></div>
            )}

            {/* Main Content Area */}
            {/* THE FIX: Added classes to push the content when the sidebar is open on mobile */}
            <div className={`lg:ml-64 transition-transform duration-300 ease-in-out ${showingNavigation ? 'translate-x-64' : ''} lg:translate-x-0`}>

                {/* Top Header Bar */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-brand-white px-4 sm:px-6 lg:px-8">
                    {/* Hamburger button for mobile, toggles the navigation state */}
                    <button
                        className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue lg:hidden"
                        onClick={() => setShowingNavigation((previousState) => !previousState)}
                    >
                        <i className="fas fa-bars text-xl"></i>
                    </button>

                    {/* User info on the right */}
                    <div className="flex items-center ml-auto gap-4">

                        {/* Semester Switcher Dropdown */}
                        {user?.semesters && user.semesters.length > 0 && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const select = e.target.elements.semester_id;
                                    import('@inertiajs/react').then(({ router }) => {
                                        router.post(route('semesters.switch'), { semester_id: select.value }, { preserveScroll: true });
                                    });
                                }}
                                className="hidden sm:flex items-center"
                            >
                                <select
                                    name="semester_id"
                                    value={user?.current_semester_id || ""}
                                    onChange={(e) => e.target.form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
                                    className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20 bg-gray-50 text-brand-text py-1.5 pl-3 pr-8"
                                >
                                    <option value="" disabled>Select Semester...</option>
                                    {user.semesters.map(semester => (
                                        <option key={semester.id} value={semester.id}>
                                            {semester.name}
                                        </option>
                                    ))}
                                </select>
                            </form>
                        )}

                        <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <span className="hidden sm:inline font-semibold text-sm text-brand-text mr-2">{user.name}</span>
                            <img
                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                src={user.avatar ? `/storage/${user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&color=FFFFFF&background=0284c7`}
                                alt="User Avatar"
                            />
                        </div>
                    </div>
                </header>

                {/* Smart Alert Banner */}
                {((active_alerts && active_alerts.length > 0) || test_alert) && !isAlertDismissed && (
                    <div className="bg-brand-blue/5 border-b border-brand-blue/10 px-4 py-3 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
                            <div className="flex flex-1 items-center gap-3">
                                {test_alert ? (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-white animate-pulse">
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-white">
                                        <i className="fas fa-lightbulb"></i>
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-brand-dark leading-tight">
                                        {test_alert
                                            ? `Attention: ${test_alert.name} is scheduled for this week!`
                                            : `Ready to study? You have ${active_alerts.length} course goals for today.`}
                                    </p>
                                    <p className="text-sm text-brand-secondary">
                                        {test_alert
                                            ? `Check your Master Timetable for details: ${test_alert.description}`
                                            : `Focus on: ${active_alerts.map(a => a.title).join(', ')}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={test_alert ? route('tests.index') : route('dashboard')}
                                    className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition"
                                >
                                    {test_alert ? 'View Schedule' : 'Start Reading'}
                                </Link>
                                <button
                                    onClick={() => setIsAlertDismissed(true)}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* This is where the content of each individual page (like the dashboard) will be rendered */}
                <main className="relative">
                    {children}
                    <WhatsAppFloatingButton />
                </main>

            </div>
        </div>
    );
}