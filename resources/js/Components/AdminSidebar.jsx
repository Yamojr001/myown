import { Link } from '@inertiajs/react';

function AdminSidebarLink({ href, active, children }) {
    const activeClasses = 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20';
    const inactiveClasses = 'text-gray-400 hover:bg-white/5 hover:text-white';

    return (
        <Link
            href={href}
            className={`flex items-center w-full px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 ${active ? activeClasses : inactiveClasses}`}
        >
            {children}
        </Link>
    );
}

export default function AdminSidebar({ user, showing }) {
    const isActive = (routeName) => route().current(routeName);

    return (
        <aside className={`fixed top-0 left-0 z-40 flex h-screen w-72 flex-col overflow-y-auto bg-brand-dark px-6 py-8 transition-transform duration-300 ease-in-out border-r border-white/5 ${showing ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            {/* Admin Brand */}
            <div className="mb-12 px-2">
                <Link href={route('admin.dashboard')} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/30">
                        <i className="fas fa-user-shield text-white text-lg"></i>
                    </div>
                    <div>
                        <span className="text-xl font-black text-white tracking-tighter uppercase block leading-none">Admin</span>
                        <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Command Center</span>
                    </div>
                </Link>
            </div>

            {/* Navigation Menu */}
            <div className="flex flex-1 flex-col justify-between">
                <nav className="space-y-2">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-4">Main Menu</div>
                    
                    <AdminSidebarLink href={route('admin.dashboard')} active={isActive('admin.dashboard')}>
                        <i className="fas fa-chart-pie w-6 mr-3 text-center opacity-70"></i>
                        Dashboard
                    </AdminSidebarLink>

                    <AdminSidebarLink href={route('admin.users')} active={isActive('admin.users')}>
                        <i className="fas fa-users w-6 mr-3 text-center opacity-70"></i>
                        Manage Scholars
                    </AdminSidebarLink>

                    <AdminSidebarLink href={route('admin.courses')} active={isActive('admin.courses')}>
                        <i className="fas fa-layer-group w-6 mr-3 text-center opacity-70"></i>
                        Academic Content
                    </AdminSidebarLink>

                    <AdminSidebarLink href={route('past-questions.index')} active={isActive('past-questions.index')}>
                        <i className="fas fa-question-circle w-6 mr-3 text-center opacity-70"></i>
                        Past Qs Repository
                    </AdminSidebarLink>

                    {/* Divider */}
                    <div className="pt-8 pb-4">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-4">System</div>
                    </div>

                    <AdminSidebarLink href={route('admin.newsletter')} active={isActive('admin.newsletter')}>
                        <i className="fas fa-paper-plane w-6 mr-3 text-center opacity-70"></i>
                        Newsletter Broadcast
                    </AdminSidebarLink>

                    <AdminSidebarLink href={route('admin.reviews.index')} active={isActive('admin.reviews.index')}>
                        <i className="fas fa-comment-alt w-6 mr-3 text-center opacity-70"></i>
                        User Feedback
                    </AdminSidebarLink>

                    <AdminSidebarLink href={route('admin.logs')} active={isActive('admin.logs')}>
                        <i className="fas fa-terminal w-6 mr-3 text-center opacity-70"></i>
                        Activity Logs
                    </AdminSidebarLink>

                    <AdminSidebarLink href={route('admin.settings')} active={isActive('admin.settings')}>
                        <i className="fas fa-sliders-h w-6 mr-3 text-center opacity-70"></i>
                        Global Settings
                    </AdminSidebarLink>
                </nav>

                {/* Footer Actions */}
                <div className="mt-12 space-y-3">
                    <Link
                        href={route('dashboard')}
                        className="flex items-center w-full px-4 py-3.5 text-xs font-black text-brand-blue bg-brand-blue/10 rounded-2xl border border-brand-blue/20 hover:bg-brand-blue hover:text-white transition-all group uppercase tracking-widest"
                    >
                        <i className="fas fa-arrow-left mr-3 transition-transform group-hover:-translate-x-1"></i>
                        Student View
                    </Link>

                    <Link
                        method="post"
                        href={route('logout')}
                        as="button"
                        className="flex items-center w-full px-4 py-3.5 text-xs font-black text-red-400 bg-red-400/5 rounded-2xl border border-red-400/10 hover:bg-red-400 hover:text-white transition-all uppercase tracking-widest"
                    >
                        <i className="fas fa-power-off mr-3"></i>
                        Terminate
                    </Link>
                </div>
            </div>
        </aside>
    );
}
