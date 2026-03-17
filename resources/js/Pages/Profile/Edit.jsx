import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import SemesterManagementForm from './Partials/SemesterManagementForm';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <h2 className="text-2xl font-bold text-white">
                    <i className="fas fa-cog mr-2"></i> Settings
                </h2>
            }
        >
            <Head title="Settings" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl space-y-8 sm:px-6 lg:px-8">

                    {/* Settings & Profile Section */}
                    <div className="bg-white p-6 sm:p-10 shadow-xl rounded-2xl border border-gray-100">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-3xl"
                        />
                    </div>

                    {/* Semester Management Section */}
                    <div className="bg-white p-6 sm:p-10 shadow-xl rounded-2xl border border-gray-100">
                        <SemesterManagementForm className="max-w-3xl" />
                    </div>

                    <div className="bg-white p-6 sm:p-10 shadow-xl rounded-2xl border border-gray-100">
                        <UpdatePasswordForm className="max-w-3xl" />
                    </div>

                    <div className="bg-red-50 p-6 sm:p-10 shadow-xl rounded-2xl border border-red-100">
                        <DeleteUserForm className="max-w-3xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
