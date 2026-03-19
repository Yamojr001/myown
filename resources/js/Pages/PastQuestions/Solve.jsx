import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function SolvePage({ auth, pastQuestion }) {
    const [isAiSolving, setIsAiSolving] = useState(false);
    const [aiAnswers, setAiAnswers] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [currentInputIndex, setCurrentInputIndex] = useState(0);

    const { data, setData, post, processing } = useForm({
        user_answers: [''],
    });

    const handleAddAnswer = () => {
        setData('user_answers', [...data.user_answers, '']);
    };

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...data.user_answers];
        newAnswers[index] = value;
        setData('user_answers', newAnswers);
    };

    const handleAiSolve = async () => {
        setIsAiSolving(true);
        try {
            const response = await axios.post(route('past-questions.ai-solve', pastQuestion.id));
            setAiAnswers(response.data.answers);
        } catch (error) {
            console.error('AI Solve failed', error);
        } finally {
            setIsAiSolving(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('past-questions.grade', pastQuestion.id));
    };

    // Voice to Text (Web Speech API)
    const toggleListening = (index) => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            window.recognition.stop();
            setIsListening(false);
            return;
        }

        setIsListening(true);
        setCurrentInputIndex(index);
        
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleAnswerChange(index, data.user_answers[index] + ' ' + transcript);
            setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        window.recognition = recognition;
        recognition.start();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Solving: {pastQuestion.course_code}</h2>}
        >
            <Head title={`Solve ${pastQuestion.course_code}`} />

            <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col md:flex-row shadow-2xl">
                
                {/* Left Side: Question Paper Panel */}
                <div className="md:w-1/2 h-1/2 md:h-full overflow-y-auto bg-gray-50/50 p-6 md:p-10 border-r border-gray-200">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-10 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                                    {pastQuestion.school}
                                </h1>
                                <p className="text-brand-blue font-bold tracking-widest text-sm mt-1">
                                    {pastQuestion.exam_name} • {pastQuestion.year}
                                </p>
                            </div>
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                                <i className="fas fa-book-open text-brand-blue mr-2"></i>
                                <span className="font-mono font-bold text-gray-700">{pastQuestion.course_code}</span>
                            </div>
                        </div>

                        <div className="prose prose-blue max-w-none bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 min-h-[600px] relative">
                            {/* Paper Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none rotate-12">
                                <i className="fas fa-graduation-cap text-[20rem]"></i>
                            </div>
                            
                            <h2 className="text-xl font-bold text-gray-800 mb-8 border-b-2 border-gray-100 pb-4 flex items-center">
                                <i className="fas fa-file-alt mr-3 text-brand-blue/60"></i>
                                Examination Content
                            </h2>
                            
                            <div className="text-gray-700 leading-relaxed font-serif text-lg">
                                {pastQuestion.content ? (
                                    <ReactMarkdown>{pastQuestion.content}</ReactMarkdown>
                                ) : (
                                    <div className="text-center py-20 text-gray-400 italic">
                                        No text content available for this exam. Please use the download link or upload text.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Answer/Solver Panel */}
                <div className="md:w-1/2 h-1/2 md:h-full flex flex-col bg-white">
                    {/* Solver Header Tabs */}
                    <div className="flex bg-gray-50 border-b border-gray-200 p-1">
                        <button 
                            onClick={() => setAiAnswers(null)}
                            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${!aiAnswers ? 'bg-white shadow-sm text-brand-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <i className="fas fa-keyboard mr-2"></i>
                            Manual Entry
                        </button>
                        <button 
                            onClick={handleAiSolve}
                            disabled={isAiSolving}
                            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${aiAnswers ? 'bg-white shadow-sm text-brand-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {isAiSolving ? (
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                            ) : (
                                <i className="fas fa-robot mr-2"></i>
                            )}
                            AI Solver
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-10">
                        {aiAnswers ? (
                            /* AI Answer View */
                            <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
                                <div className="flex items-center p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                    <i className="fas fa-magic text-indigo-500 mr-4 shrink-0 text-xl"></i>
                                    <div className="text-sm">
                                        <p className="font-bold text-indigo-900">AI Solving Mode Active</p>
                                        <p className="text-indigo-700/70">These answers are generated automatically based on the exam content.</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-md prose prose-indigo max-w-none">
                                    <ReactMarkdown>{aiAnswers}</ReactMarkdown>
                                </div>
                                <div className="flex justify-center pb-10">
                                    <button 
                                        onClick={() => setAiAnswers(null)}
                                        className="text-indigo-600 font-bold hover:underline flex items-center"
                                    >
                                        <i className="fas fa-history mr-2"></i>
                                        Back to your solution
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* User Input View */
                            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8 pb-32">
                                {data.user_answers.map((answer, index) => (
                                    <div key={index} className="group relative">
                                        <div className="absolute -left-12 top-0 py-2 font-black text-2xl text-gray-100 group-hover:text-indigo-100 transition-colors">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                value={answer}
                                                onChange={e => handleAnswerChange(index, e.target.value)}
                                                rows="3"
                                                placeholder={`Type answer for question ${index + 1}...`}
                                                className="w-full rounded-3xl border-gray-100 focus:border-indigo-500 focus:ring focus:ring-indigo-100 bg-gray-50/50 p-6 text-gray-800 transition-all font-medium pr-14"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => toggleListening(index)}
                                                className={`absolute right-4 top-4 p-2 rounded-full transition-all ${isListening && currentInputIndex === index ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-400 hover:text-indigo-600 shadow-sm'}`}
                                            >
                                                <i className="fas fa-microphone"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex gap-4 items-center">
                                    <button 
                                        type="button"
                                        onClick={handleAddAnswer}
                                        className="flex-1 py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center p-4"
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        Next Question
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-6 bg-white border-t border-gray-100 backdrop-blur-md bg-white/90">
                        <div className="max-w-xl mx-auto flex gap-4">
                            <div className="flex-1 flex items-center text-xs text-gray-400">
                                <i className="fas fa-info-circle mr-2"></i>
                                Your answers are automatically saved to your history upon submission.
                            </div>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={processing || aiAnswers}
                                className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50 active:scale-95"
                            >
                                {processing ? (
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                ) : (
                                    <i className="fas fa-paper-plane mr-3"></i>
                                )}
                                Submit for Marking
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .rounded-3xl { border-radius: 1.75rem; }
            `}</style>
        </AuthenticatedLayout>
    );
}
