import { useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import { Link } from '@inertiajs/react';

export default function Authenticated({ user, children }) {
    const [showingNavigation, setShowingNavigation] = useState(false);

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
                    <div className="flex items-center ml-auto">
                        <span className="hidden sm:inline font-semibold text-sm text-brand-text">{user.name}</span>
                         <img
                            className="h-9 w-9 rounded-full object-cover ml-3"
                            src={`https://i.pravatar.cc/150?u=${user.id}`}
                            alt="User Avatar"
                        />
                    </div>
                </header>

                {/* This is where the content of each individual page (like the dashboard) will be rendered */}
                <main>{children}</main>

            </div>
        </div>
    );
}