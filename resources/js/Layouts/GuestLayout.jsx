import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-brand-light pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-brand-orange" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-brand-white px-6 py-8 shadow-xl sm:max-w-md sm:rounded-2xl">
                {children}
            </div>
        </div>
    );
}
