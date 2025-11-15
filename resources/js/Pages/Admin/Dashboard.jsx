import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-brand-text leading-tight">Admin Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-brand-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-brand-text">
                            Welcome to the Admin Control Center, {auth.user.name}.
                        </div>
                    </div>
                    
                    <div className="mt-6 p-6 bg-brand-dark rounded-lg shadow">
                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-brand-orange">
                            System Monitoring
                        </h5>
                        <p className="font-normal text-gray-300">
                            This area will soon contain charts and stats for total users, active courses, and system activity.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}