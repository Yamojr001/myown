import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';

export default function HistoryIndex({ auth, semesters }) {
    const { post, processing } = useForm();

    const switchSemester = (semesterId) => {
        post(route('semesters.switch'), {
            data: { semester_id: semesterId },
            onSuccess: () => {
                // The backend handles the redirect, usually to the dashboard or preserves scroll
                // Adding a small visual feedback could be nice, but Inertia progress bar handles it.
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-2xl font-bold text-white">
                    <i className="fas fa-history mr-2"></i> Semester History
                </h2>
            }
        >
            <Head title="History" />

            <div className="py-12 bg-brand-light min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-brand-text">Your Academic Journey</h3>
                            <p className="text-brand-secondary mt-1">
                                Review your past semesters, access old courses, and see your previous timetables.
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Link href={route('profile.edit')} className="inline-flex items-center px-4 py-2 bg-brand-blue border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 transition ease-in-out duration-150">
                                <i className="fas fa-plus mr-2"></i> Create New Semester
                            </Link>
                        </div>
                    </div>

                    {semesters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {semesters.map((semester) => {
                                const isActive = auth.user.current_semester_id === semester.id;

                                return (
                                    <div
                                        key={semester.id}
                                        className={`p-6 rounded-2xl shadow-lg border-t-4 flex flex-col transition-transform duration-300 hover:-translate-y-1 ${isActive ? 'bg-blue-50/50 border-brand-blue' : 'bg-white border-brand-blue'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-lg font-bold text-brand-text truncate pr-2">
                                                {semester.name}
                                            </h4>
                                            {isActive && (
                                                <span className="bg-brand-blue text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                    Active
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-3 mb-6 flex-1">
                                            <div className="flex items-center text-sm text-brand-secondary">
                                                <i className="fas fa-calendar-alt w-5 text-gray-400"></i>
                                                <span>Created: {new Date(semester.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-brand-secondary">
                                                <i className="fas fa-book w-5 text-gray-400"></i>
                                                <span>Courses Recorded: <strong className="text-brand-text">{semester.courses_count || 0}</strong></span>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            {isActive ? (
                                                <div className="w-full text-center px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-semibold cursor-default">
                                                    Currently Viewing
                                                </div>
                                            ) : (
                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        switchSemester(semester.id);
                                                    }}
                                                >
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="w-full text-center px-4 py-2.5 bg-brand-blue text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors duration-200"
                                                    >
                                                        <i className="fas fa-sign-in-alt mr-2"></i> Switch to Semester
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-history text-3xl text-gray-300"></i>
                            </div>
                            <h3 className="text-lg font-bold text-brand-text mb-2">No History Yet</h3>
                            <p className="text-brand-secondary max-w-md mx-auto">
                                You haven't created any semesters yet. Once you start tracking courses, your semester history will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
