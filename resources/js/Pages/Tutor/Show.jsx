import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import axios from 'axios';

export default function Show({ auth }) {
    const [explanation, setExplanation] = useState('');
    const [text, setText] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const submit = async (e) => {
        e.preventDefault();

        if (text.length < 10) return;

        setProcessing(true);
        setErrors({});
        setExplanation('');

        try {
            const response = await axios.post(route('tutor.explain'), { text });
            setExplanation(response.data.explanation);
        } catch (error) {
            console.error('Errors:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ text: 'A network error occurred while reaching the AI Tutor.' });
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="AI Tutor" />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-brand-text mb-6">AI Personal Tutor</h1>

                    {/* Display errors if any */}
                    {errors.text && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded shadow-sm font-semibold">
                            {errors.text}
                        </div>
                    )}

                    <form onSubmit={submit} className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-brand-blue">
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            Paste the text or confusing concept you want explained:
                        </label>
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            className="w-full h-48 rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue p-4"
                            placeholder="Paste your lecture notes, a complex text, or ask a question here..."
                        ></textarea>
                        <button
                            type="submit"
                            disabled={processing || text.length < 10}
                            className="mt-4 w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-opacity-90 disabled:bg-gray-400 transition-colors shadow"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center">
                                    <i className="fas fa-spinner fa-spin mr-2"></i> Thinking & Analyzing...
                                </span>
                            ) : (
                                <span><i className="fas fa-magic mr-2"></i> Explain for Me</span>
                            )}
                        </button>
                    </form>

                    {explanation && (
                        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 xl:p-10 mb-8 border border-gray-100 relative">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                <h2 className="text-2xl font-bold text-brand-text mb-0 flex items-center gap-2">
                                    <i className="fas fa-graduation-cap text-brand-blue"></i> Tutor Explanation
                                </h2>
                                <button
                                    onClick={() => setExplanation('')}
                                    className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <i className="fas fa-times mr-1"></i> Clear
                                </button>
                            </div>

                            {/* Improved Markdown Typography formatting */}
                            <div className="prose prose-lg max-w-none prose-headings:text-brand-text prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-brand-blue prose-strong:text-brand-text prose-p:text-gray-700 prose-li:text-gray-700 marker:text-brand-blue prose-blockquote:border-l-brand-blue prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
                                <ReactMarkdown>{explanation}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}