import { useState } from 'react';
import AdminSidebar from '@/Components/AdminSidebar';
import { usePage } from '@inertiajs/react';

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;
    const [showingNavigation, setShowingNavigation] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <AdminSidebar user={auth.user} showing={showingNavigation} />

            {/* Mobile Overlay */}
            {showingNavigation && (
                <div
                    className="fixed inset-0 z-30 bg-brand-dark/60 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setShowingNavigation(false)}
                ></div>
            )}

            {/* Main Content Area */}
            <div className={`lg:ml-72 transition-all duration-300 ease-in-out ${showingNavigation ? 'translate-x-72' : ''} lg:translate-x-0 min-h-screen flex flex-col`}>

                {/* Top Admin Header */}
                <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl px-4 sm:px-8 lg:px-12">
                    <button
                        className="p-2 text-brand-dark hover:bg-gray-100 rounded-xl lg:hidden transition-colors"
                        onClick={() => setShowingNavigation((prev) => !prev)}
                    >
                        <i className="fas fa-indent text-xl"></i>
                    </button>

                    <div className="flex items-center ml-auto gap-6 text-brand-dark">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="font-black text-sm uppercase tracking-tighter leading-none">{auth.user.name}</span>
                            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mt-1">System Administrator</span>
                        </div>
                        
                        <div className="relative group p-1 bg-gradient-to-tr from-brand-blue to-brand-dark rounded-2xl shadow-lg ring-4 ring-white">
                            <img
                                className="h-10 w-10 rounded-[0.8rem] object-cover"
                                src={auth.user.avatar ? `/storage/${auth.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&color=FFFFFF&background=0a2540`}
                                alt="Admin Avatar"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Viewport */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>

                {/* Admin Footer */}
                <footer className="px-8 py-6 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
                        Phronix AI Administrative Workspace &copy; {new Date().getFullYear()}
                    </p>
                </footer>

            </div>
        </div>
    );
}
