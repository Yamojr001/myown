import { Link } from '@inertiajs/react';

// A custom component for our sidebar links to handle active state and styling
function SidebarLink({ href, active, children }) {
    const activeClasses = 'bg-brand-blue text-white shadow-lg';
    const inactiveClasses = 'text-gray-400 hover:bg-brand-blue/20 hover:text-white';

    // THE FIX: Using Inertia's <Link> component for fast, single-page navigation.
    return (
        <Link
            href={href}
            className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors duration-200 ${active ? activeClasses : inactiveClasses
                }`}
        >
            {children}
        </Link>
    );
}

export default function Sidebar({ user, showing }) {
    // We determine the active page by checking the current route name provided by Inertia
    const isActive = (routeName) => route().current(routeName);

    return (
        <aside className={`fixed top-0 left-0 z-40 flex h-screen w-64 flex-col overflow-y-auto bg-brand-dark px-4 py-6 transition-transform duration-300 ease-in-out ${showing ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            {/* Logo */}
            <div className="text-center mb-10">
                <Link href={route('dashboard')} className="text-2xl font-extrabold text-white">
                    <i className="fas fa-brain text-brand-blue"></i> Phronix AI
                </Link>
            </div>

            {/* Navigation Menu */}
            <div className="flex flex-1 flex-col justify-between">
                <nav className="flex-1 space-y-2">
                    <SidebarLink href={route('dashboard')} active={isActive('dashboard')}>
                        <i className="fas fa-tachometer-alt w-6 mr-3 text-center"></i>
                        Dashboard
                    </SidebarLink>
                    <SidebarLink href={route('courses.index')} active={isActive('courses.index')}>
                        <i className="fas fa-book-open w-6 mr-3 text-center"></i>
                        My Courses
                    </SidebarLink>
                    <SidebarLink href={route('tests.index')} active={isActive('tests.index')}>
                        <i className="fas fa-file-alt w-6 mr-3 text-center"></i>
                        Tests & Assessments
                    </SidebarLink>
                    <SidebarLink href={route('past-questions.index')} active={isActive('past-questions.index')}>
                        <i className="fas fa-question-circle w-6 mr-3 text-center"></i>
                        Past Questions
                    </SidebarLink>
                    <SidebarLink href={route('master-timetable.show')} active={isActive('master-timetable.show')}>
                        <i className="fas fa-calendar-alt w-6 mr-3 text-center"></i>
                        Master Timetable
                    </SidebarLink>
                    <SidebarLink href={route('reading-plan.index')} active={isActive('reading-plan.index')}>
                        <i className="fas fa-book-reader w-6 mr-3 text-center"></i>
                        Reading Plan
                    </SidebarLink>
                    <SidebarLink href={route('tutor.show')} active={isActive('tutor.show')}>
                        <i className="fas fa-chalkboard-teacher w-6 mr-3 text-center"></i>
                        AI Tutor
                    </SidebarLink>
                    <SidebarLink href={route('read-aloud.show')} active={isActive('read-aloud.show')}>
                        <i className="fas fa-volume-up w-6 mr-3 text-center"></i>
                        Read Aloud
                    </SidebarLink>
                    {/* Divider */}
                    <div className="pt-4 pb-2">
                        <hr className="border-gray-700" />
                    </div>

                    <SidebarLink href={route('history.index')} active={isActive('history.index')}>
                        <i className="fas fa-history w-6 mr-3 text-center"></i>
                        History
                    </SidebarLink>
                    <SidebarLink href={route('profile.edit')} active={isActive('profile.edit')}>
                        <i className="fas fa-cog w-6 mr-3 text-center"></i>
                        Settings
                    </SidebarLink>

                    <SidebarLink href={route('reviews.create')} active={isActive('reviews.create')}>
                        <i className="fas fa-comment-alt w-6 mr-3 text-center"></i>
                        Feedback
                    </SidebarLink>

                    {/* Admin Link - only shows if user.is_admin is true */}
                    {user.is_admin && (
                        <SidebarLink href={route('admin.dashboard')} active={isActive('admin.dashboard')}>
                            <i className="fas fa-user-shield w-6 mr-3 text-center text-brand-blue"></i>
                            Admin Panel
                        </SidebarLink>
                    )}
                </nav>

                {/* Logout Button */}
                <div className="mt-6">
                    <Link
                        method="post"
                        href={route('logout')}
                        as="button"
                        className="w-full text-left text-gray-400 hover:bg-brand-blue/20 hover:text-white flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors duration-200"
                    >
                        <i className="fas fa-sign-out-alt w-6 mr-3 text-center"></i>
                        Logout
                    </Link>
                </div>
            </div>
        </aside>
    );
}