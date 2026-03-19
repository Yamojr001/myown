import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Unsubscribed() {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-brand-light font-primary">
            <Head title="Unsubscribed" />

            <div>
                <Link href="/">
                    <ApplicationLogo className="w-20 h-20 fill-current text-brand-blue" />
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-10 py-12 bg-white shadow-2xl overflow-hidden sm:rounded-[2.5rem] text-center">
                <div className="w-20 h-20 bg-blue-50 text-brand-blue rounded-3xl flex items-center justify-center text-3xl mx-auto mb-8">
                    <i className="fas fa-envelope-open"></i>
                </div>
                
                <h2 className="text-3xl font-black text-brand-dark tracking-tight uppercase mb-4">You're Unsubscribed</h2>
                
                <p className="text-gray-500 font-medium leading-relaxed mb-10">
                    Your email has been removed from our newsletter broadcast list. You will no longer receive periodic announcements from us.
                </p>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/"
                        className="w-full py-4 bg-brand-dark text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-brand-blue transition-all"
                    >
                        Return to Homepage
                    </Link>
                </div>
            </div>
            
            <p className="mt-8 text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
                Phronix AI Communication Preferences
            </p>
        </div>
    );
}
