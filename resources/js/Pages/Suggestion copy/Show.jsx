import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';

// THE FIX: We destructure `flash` with a default value of an empty object `{}`.
// This ensures that `flash` is never `undefined`.
export default function Show({ auth, course, weakTopics, suggestion, flash = {} }) {
    const { post, processing } = useForm({});

    const generateGuide = () => {
        post(route('suggestion.generate', course.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`AI Suggestions for ${course.title}`} />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Link href={route('courses.show', course.id)} className="text-sm text-brand-blue hover:underline mb-2 block">&larr; Back to Course Details</Link>
                        <h1 className="text-3xl font-bold text-brand-text">AI Study Guide</h1>
                        <p className="text-brand-secondary mt-1">Personalized suggestions for {course.title}</p>
                    </div>

                    {/* THE FIX: We can now safely access flash.error without optional chaining
                        because `flash` is guaranteed to be an object. */}
                    {flash.error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg">
                            {flash.error}
                        </div>
                    )}

                    {suggestion ? (
                        <div className="bg-brand-white rounded-xl shadow-lg">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="text-xl font-bold text-brand-text">Your Personalized Plan</h3>
                                <Link href={route('suggestion.download', suggestion.id)} className="px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-opacity-80">
                                    <i className="fas fa-download mr-2"></i> Download PDF
                                </Link>
                            </div>
                            <div className="prose max-w-none p-6">
                                <ReactMarkdown>{suggestion.content}</ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-brand-white rounded-xl shadow-lg p-8 text-center">
                            <i className="fas fa-lightbulb text-5xl text-brand-orange mb-4"></i>
                            <h3 className="text-2xl font-bold text-brand-text">Ready to Generate Your Study Guide?</h3>
                            <p className="text-brand-secondary mt-2 mb-4">The AI will use your lecture notes to create a personalized reading plan based on these weak topics:</p>
                            
                            <div className="flex flex-wrap justify-center gap-2 my-6">
                                {weakTopics && weakTopics.length > 0 ? (
                                    weakTopics.map((topic, index) => <span key={index} className="bg-brand-orange/10 text-brand-orange text-sm font-semibold px-3 py-1.5 rounded-full">{topic}</span>)
                                ) : (
                                    <p className="text-brand-secondary font-semibold">No weak topics found from your last test. Great job!</p>
                                )}
                            </div>

                            <button onClick={generateGuide} disabled={processing || !weakTopics || weakTopics.length === 0} className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                                {processing ? (
                                    <><i className="fas fa-spinner fa-spin mr-2"></i>Generating... (This may take a minute)</>
                                ) : (
                                    <><i className="fas fa-magic mr-2"></i> Create My Plan</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}