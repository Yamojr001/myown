import { useEffect, useState } from 'react';

export default function SplashPage({ onClose }) {
    const [animationDone, setAnimationDone] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationDone(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[200] bg-brand-blue/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="text-center space-y-8 animate-in zoom-in fade-in duration-500">
                <div className={`relative w-48 h-48 mx-auto transition-all duration-1000 ${animationDone ? 'scale-110' : 'scale-50 opacity-0'}`}>
                    {/* Concentric rings animation */}
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-4 bg-white/30 rounded-full animate-pulse delay-75"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center">
                            <i className="fas fa-trophy text-6xl text-brand-blue animate-bounce"></i>
                        </div>
                    </div>
                </div>

                <div className={`space-y-4 transition-all duration-700 delay-500 ${animationDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-5xl font-black text-white italic tracking-tight">MISSION ACCOMPLISHED!</h2>
                    <p className="text-blue-100 text-xl font-bold max-w-md mx-auto">
                        Your study task for today is completed. You're growing smarter every second!
                    </p>
                    
                    <div className="pt-8">
                        <button 
                            onClick={onClose}
                            className="px-12 py-4 bg-white text-brand-blue rounded-2xl font-black text-xl shadow-2xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all"
                        >
                            Back to Study Room
                        </button>
                    </div>
                </div>
                
                {/* Floating particles (simplified representation) */}
                <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white/20 rounded-full animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-white/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-white/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-30px) rotate(10deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
