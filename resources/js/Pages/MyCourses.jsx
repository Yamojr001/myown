import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal'; // A reusable Modal component from Breeze
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

// This component receives the `courses` data as a prop from our CourseController
export default function MyCourses({ auth, courses }) {
    // State to control the visibility of the "Add Course" modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Inertia's useForm helper - this is the professional way to handle forms.
    // It automatically handles state, validation errors, and loading states.
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        code: '',
        syllabus: null, // For the file upload
    });

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        reset(); // Reset form fields and errors when the modal closes
    };

    // Function to handle form submission
    const submit = (e) => {
        e.preventDefault();
        // The `post` method sends the form data to our 'courses.store' route.
        // Inertia will automatically handle multipart/form-data for the file upload.
        post(route('courses.store'), {
            onSuccess: () => closeModal(), // Close the modal on successful submission
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-brand-text leading-tight">My Courses</h2>}
        >
            <Head title="My Courses" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-end mb-4">
                        <PrimaryButton onClick={openModal} className="bg-brand-orange hover:bg-opacity-90">
                            <i className="fas fa-plus mr-2"></i>
                            Add New Course
                        </PrimaryButton>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <div key={course.id} className="p-6 bg-brand-white rounded-lg shadow-md flex flex-col">
                                    <h5 className="text-lg font-bold text-brand-text">{course.title}</h5>
                                    <p className="text-sm text-brand-secondary mb-3">{course.code}</p>
                                    
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                        <div className="bg-brand-blue h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                                    </div>
                                    
                                    <p className="text-xs text-brand-secondary mb-4 mt-auto">
                                        Status: <span className="font-semibold">{course.status}</span>
                                    </p>
                                    
                                    <a href="#" className="w-full text-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-opacity-80">
                                        View Course
                                    </a>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full p-10 text-center bg-brand-white rounded-lg shadow-md">
                                <i className="fas fa-folder-open text-5xl text-gray-300 mb-4"></i>
                                <h4 className="text-xl font-bold text-brand-text">Your semester is empty!</h4>
                                <p className="text-brand-secondary">Click "Add New Course" to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* The "Add Course" Modal */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-brand-text">Add a New Course</h2>
                    <p className="mt-1 text-sm text-brand-secondary">Upload your syllabus to let our AI begin its analysis.</p>

                    <div className="mt-6">
                        <InputLabel htmlFor="title" value="Course Title" />
                        <TextInput
                            id="title"
                            name="title"
                            value={data.title}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('title', e.target.value)}
                            required
                        />
                        <InputError message={errors.title} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="code" value="Course Code" />
                        <TextInput
                            id="code"
                            name="code"
                            value={data.code}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('code', e.target.value)}
                            required
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="syllabus" value="Syllabus File (PDF only, max 5MB)" />
                        {/* Special `setData` for file inputs */}
                        <input 
                            type="file" 
                            name="syllabus" 
                            id="syllabus"
                            className="mt-1 block w-full text-sm text-brand-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20"
                            onChange={(e) => setData('syllabus', e.target.files[0])}
                            accept=".pdf"
                            required
                        />
                        <InputError message={errors.syllabus} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button type="button" onClick={closeModal} className="text-brand-secondary mr-4">Cancel</button>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Saving...' : 'Save Course'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}