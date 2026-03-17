import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function LoadingScreen() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let timeout;

        const startLoading = () => {
            // Add a small delay so fast page loads don't flash the screen
            timeout = setTimeout(() => setIsLoading(true), 250);
        };

        const stopLoading = () => {
            clearTimeout(timeout);
            setIsLoading(false);
        };

        const removeStartListener = router.on('start', startLoading);
        const removeFinishListener = router.on('finish', stopLoading);
        // Also catch errors or cancellations to ensure it stops
        const removeExceptionListener = router.on('exception', stopLoading);
        const removeNavigateListener = router.on('navigate', stopLoading);

        return () => {
            // Cleanup Inertia events
            removeStartListener();
            removeFinishListener();
            removeExceptionListener();
            removeNavigateListener();
            clearTimeout(timeout);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm transition-opacity duration-300">
            <div className="flex flex-col items-center justify-center">
                {/* Logo & Ring Container */}
                <div className="relative flex items-center justify-center w-32 h-32">
                    {/* Outer spinning dashed ring */}
                    <div className="absolute inset-0 border-[3px] border-dashed border-brand-blue rounded-full animate-spin"></div>

                    {/* Inner Logo */}
                    <div className="flex flex-col items-center justify-center z-10 bg-white/40 rounded-full h-24 w-24 shadow-sm border border-brand-blue/20">
                        <i className="fas fa-brain text-brand-blue text-4xl mb-1 mt-1"></i>
                        <h1 className="text-sm font-black text-brand-text tracking-tight leading-none">PrepAI</h1>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="mt-6 text-lg font-bold text-brand-blue flex items-center">
                    Loading
                    <div className="flex space-x-1 ml-1 mt-1">
                        <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
