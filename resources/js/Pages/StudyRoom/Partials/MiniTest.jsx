import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MiniTest({ course, weekNumber, dayName, onClose, onPass }) {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.post(route('study-room.generate-test', course.id));
                setQuestions(response.data.questions || []);
            } catch (error) {
                console.error('Failed to load questions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [course.id]);

    const handleAnswer = (index, value) => {
        setAnswers({ ...answers, [index]: value });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const response = await axios.post(route('study-room.submit-test'), {
                course_id: course.id,
                answers: answers,
                week_number: weekNumber,
                day_name: dayName
            });
            setResult(response.data);
            if (response.data.passed) {
                setTimeout(() => onPass(), 2000);
            }
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] bg-brand-text/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-12 text-center max-w-sm w-full shadow-2xl">
                    <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-black text-brand-text">Generating Your Test</h3>
                    <p className="text-brand-secondary text-sm mt-2 font-medium">Analyzing today's handout to create a custom challenge...</p>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="fixed inset-0 z-[100] bg-brand-text/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full shadow-2xl space-y-6">
                    <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${result.passed ? 'fa-check-circle' : 'fa-times-circle'} text-5xl`}></i>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-brand-text">{Math.round(result.score)}%</h3>
                        <p className={`text-lg font-bold ${result.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                            {result.passed ? 'Amazing Work!' : 'Keep Studying!'}
                        </p>
                    </div>
                    <p className="text-brand-secondary text-sm font-medium">
                        {result.passed 
                            ? "You've successfully mastered today's content. Great job!" 
                            : "You didn't pass this time (70% required). Review the handout and try again!"}
                    </p>
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-brand-text text-white rounded-xl font-black hover:bg-black transition-all"
                    >
                        {result.passed ? "Finish" : "Go Back & Study"}
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="fixed inset-0 z-[100] bg-brand-text/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-brand-text">Daily Mini-Test</h3>
                        <p className="text-xs text-brand-secondary font-bold uppercase tracking-widest">{course.code} - Week {weekNumber}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-sm font-black text-brand-blue">Question {currentIndex + 1}</span>
                            <span className="text-xs text-brand-secondary block">of {questions.length}</span>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-100">
                    <div 
                        className="h-full bg-brand-blue transition-all duration-500" 
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>

                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                    {currentQuestion && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                            <div className="space-y-4">
                                <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {currentQuestion.type === 'objective' ? 'Multiple Choice' : currentQuestion.type === 'fill_in' ? 'Fill in the Blank' : 'Short Essay'}
                                </span>
                                <h4 className="text-2xl font-bold text-brand-text leading-snug">
                                    {currentQuestion.question}
                                </h4>
                            </div>

                            <div className="space-y-3">
                                {currentQuestion.type === 'objective' && currentQuestion.options.map((option, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => handleAnswer(currentIndex, oIdx)}
                                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                                            answers[currentIndex] === oIdx 
                                            ? 'border-brand-blue bg-brand-blue/5 text-brand-blue shadow-lg shadow-brand-blue/10' 
                                            : 'border-gray-100 hover:border-brand-blue/30 text-gray-700'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                                            answers[currentIndex] === oIdx ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {String.fromCharCode(65 + oIdx)}
                                        </div>
                                        <span className="font-bold">{option}</span>
                                    </button>
                                ))}

                                {(currentQuestion.type === 'fill_in' || currentQuestion.type === 'essay') && (
                                    <textarea
                                        value={answers[currentIndex] || ''}
                                        onChange={(e) => handleAnswer(currentIndex, e.target.value)}
                                        placeholder={currentQuestion.type === 'fill_in' ? "Type your answer here..." : "Explain your answer. Be concise and thorough."}
                                        className="w-full p-6 rounded-2xl border-2 border-gray-100 focus:border-brand-blue focus:ring-0 min-h-[150px] font-medium text-lg resize-none transition-colors"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
                    <button 
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex(currentIndex - 1)}
                        className="px-6 py-3 font-black text-brand-text hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-0"
                    >
                        Previous
                    </button>

                    {currentIndex < questions.length - 1 ? (
                        <button 
                            onClick={() => setCurrentIndex(currentIndex + 1)}
                            disabled={answers[currentIndex] === undefined || answers[currentIndex] === ''}
                            className="px-8 py-3 bg-brand-text text-white font-black rounded-xl hover:bg-black shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            Next Question
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={submitting || answers[currentIndex] === undefined || answers[currentIndex] === ''}
                            className="px-10 py-3 bg-brand-blue text-white font-black rounded-xl hover:bg-blue-600 shadow-xl shadow-brand-blue/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? <><i className="fas fa-spinner fa-spin mr-2"></i>Grading...</> : 'Finish & Submit'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
