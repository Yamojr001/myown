import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function MyCourses({ auth, courses, flash }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '', code: '', syllabus: null,
    });
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => { setIsModalOpen(false); reset(); };
    const submit = (e) => { e.preventDefault(); post(route('courses.store'), { onSuccess: () => closeModal() }); };

    const renderCourseAction = (course) => {
        switch (course.status) {
            case 'Pre-Test Needed':
                return <Link href={route('courses.test.show', course.id)} className="w-full text-center px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-opacity-80 font-semibold">Take Pre-Test</Link>;
            case 'AI Analysis Failed':
                return <Link href={'#'} className="w-full text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-opacity-80 font-semibold">Retry Analysis</Link>;
            case 'Analyzing Syllabus...':
                return <button disabled className="w-full text-center px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed font-semibold"><i className="fas fa-spinner fa-spin mr-2"></i>Analyzing...</button>;
            default:
                // CORRECTED LINK: This now points to the new 'courses.show' route.
                return <Link href={route('courses.show', course.id)} className="w-full text-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-opacity-80 font-semibold">View Progress</Link>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-brand-text leading-tight">My Courses</h2>}>
            <Head title="My Courses" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-end mb-4">
                        <PrimaryButton onClick={openModal} className="bg-brand-orange hover:bg-opacity-90"><i className="fas fa-plus mr-2"></i>Add New Course</PrimaryButton>
                    </div>
                    {flash.message && <div className="mb-4 p-4 bg-green-100 text-green-800 border border-green-300 rounded-lg">{flash.message}</div>}
                    {flash.error && <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg">{flash.error}</div>}
                    <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <div key={course.id} className="p-6 bg-brand-white rounded-lg shadow-md flex flex-col">
                                    <h5 className="text-lg font-bold text-brand-text">{course.title}</h5>
                                    <p className="text-sm text-brand-secondary mb-3">{course.code}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4"><div className="bg-brand-blue h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div></div>
                                    <p className="text-xs text-brand-secondary mb-4">Status: <span className="font-semibold">{course.status}</span></p>
                                    <div className="mt-auto">{renderCourseAction(course)}</div>
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
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-brand-text">Add a New Course</h2>
                    <p className="mt-1 text-sm text-brand-secondary">Upload your syllabus to let our AI begin its analysis.</p>
                    <div className="mt-6"><InputLabel htmlFor="title" value="Course Title" /><TextInput id="title" name="title" value={data.title} className="mt-1 block w-full" onChange={(e) => setData('title', e.target.value)} required /><InputError message={errors.title} className="mt-2" /></div>
                    <div className="mt-4"><InputLabel htmlFor="code" value="Course Code" /><TextInput id="code" name="code" value={data.code} className="mt-1 block w-full" onChange={(e) => setData('code', e.target.value)} required /><InputError message={errors.code} className="mt-2" /></div>
                    <div className="mt-4"><InputLabel htmlFor="syllabus" value="Syllabus File (PDF only, max 15MB)" /><input type="file" name="syllabus" id="syllabus" className="mt-1 block w-full text-sm text-brand-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20" onChange={(e) => setData('syllabus', e.target.files[0])} accept=".pdf" required /><InputError message={errors.syllabus} className="mt-2" /></div>
                    <div className="mt-6 flex justify-end"><button type="button" onClick={closeModal} className="text-brand-secondary mr-4">Cancel</button><PrimaryButton disabled={processing}>{processing ? 'Saving...' : 'Save Course'}</PrimaryButton></div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}