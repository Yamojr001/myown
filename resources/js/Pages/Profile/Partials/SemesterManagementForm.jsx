import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function SemesterManagementForm({ className = '' }) {
    const { auth } = usePage().props;
    const user = auth.user;

    // Safety check assuming you will pass semesters down from the backend globally or via props soon
    // For now we assume they might be exposed eventually, but if not we build the creation
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const createSemester = (e) => {
        e.preventDefault();
        post(route('semesters.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                    Semester & Workspace Management
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    Create new semesters to start a fresh dashboard (like creating a new chat). Your past courses and timetables remain saved in their respective semesters.
                </p>
            </header>

            <form onSubmit={createSemester} className="mt-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <InputLabel htmlFor="semester_name" value="New Semester Name" />
                    <TextInput
                        id="semester_name"
                        className="mt-1 block w-full bg-gray-50 border-gray-200 focus:bg-white"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Level 200 First Semester"
                        required
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <PrimaryButton className="bg-brand-blue hover:bg-blue-700 py-3 w-full md:w-auto justify-center" disabled={processing}>
                    <i className="fas fa-plus mr-2"></i> Create Semester
                </PrimaryButton>
            </form>

            <div className="mt-8">
                <h3 className="text-md font-semibold text-gray-700 mb-4">You must switch your Active Semester from the Top Navigation Bar.</h3>
            </div>

        </section>
    );
}
