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
                        <div className="bg-white rounded-[2rem] shadow-2xl shadow-brand-blue/5 overflow-hidden border border-gray-100 mb-12">
                            <div className="bg-gradient-to-r from-brand-blue to-brand-dark p-8 md:p-12 text-white relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-4 ring-1 ring-white/30">
                                            <i className="fas fa-sparkles mr-2 text-yellow-300"></i>
                                            AI-Powered Roadmap
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Your Personalized <br/>Study Plan</h3>
                                    </div>
                                    <Link 
                                        href={route('suggestion.download', suggestion.id)} 
                                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-blue font-black rounded-2xl shadow-xl hover:bg-brand-light transition-all active:scale-95 group"
                                    >
                                        <i className="fas fa-file-pdf mr-3 group-hover:scale-110 transition-transform"></i> 
                                        Download PDF
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="p-8 md:p-16">
                                <article className="prose prose-lg prose-blue max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({node, ...props}) => <h1 className="text-4xl font-black text-brand-dark mb-10 pb-6 border-b-4 border-brand-blue/10 tracking-tight" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-2xl font-black text-brand-dark mt-12 mb-6 flex items-center tracking-tight" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-lg font-bold text-brand-blue uppercase tracking-widest mt-8 mb-4 italic" {...props} />,
                                            p: ({node, ...props}) => <p className="text-gray-600 leading-relaxed mb-6" {...props} />,
                                            strong: ({node, ...props}) => <strong className="text-brand-dark font-black" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-600" {...props} />,
                                            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-600" {...props} />,
                                            li: ({node, ...props}) => <li className="pl-2" {...props} />,
                                        }}
                                    >
                                        {suggestion.content}
                                    </ReactMarkdown>
                                </article>
                            </div>

                            <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-400 font-medium italic">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    Generated based on your weak topics and course materials.
                                </div>
                                <button 
                                    onClick={generateGuide} 
                                    disabled={processing}
                                    className="text-brand-blue font-bold hover:underline flex items-center gap-2 text-sm"
                                >
                                    <i className="fas fa-sync-alt"></i>
                                    Regenerate Plan
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-brand-white rounded-xl shadow-lg p-8 text-center">
                            <i className="fas fa-lightbulb text-5xl text-brand-blue mb-4"></i>
                            <h3 className="text-2xl font-bold text-brand-text">Ready to Generate Your Study Guide?</h3>
                            <p className="text-brand-secondary mt-2 mb-4">The AI will use your lecture notes to create a personalized reading plan based on these weak topics:</p>

                            <div className="flex flex-wrap justify-center gap-2 my-6">
                                {weakTopics && weakTopics.length > 0 ? (
                                    weakTopics.map((topic, index) => <span key={index} className="bg-brand-blue/10 text-brand-blue text-sm font-semibold px-3 py-1.5 rounded-full">{topic}</span>)
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