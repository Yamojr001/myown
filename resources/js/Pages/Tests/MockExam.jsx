import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function MockExam({ auth, course, questions, testType }) {
    const { data, setData, post, processing } = useForm({
        answers: Array(questions.length).fill(''),
    });

    const [isRecording, setIsRecording] = useState(null); // stores the index of the question currently recording
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleRecording = (index) => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
            return;
        }

        if (isRecording === index) {
            // Stop recording
            recognitionRef.current.stop();
            setIsRecording(null);
        } else {
            // Start recording
            if (isRecording !== null) {
                recognitionRef.current.stop();
            }

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    }
                }

                if (finalTranscript) {
                    setData(currentData => {
                        const newAnswers = [...currentData.answers];
                        newAnswers[index] = (newAnswers[index] + ' ' + finalTranscript).trim();
                        return { ...currentData, answers: newAnswers };
                    });
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(null);
            };

            recognitionRef.current.start();
            setIsRecording(index);
        }
    };

    const handleAnswerChange = (questionIndex, value) => {
        const newAnswers = [...data.answers];
        newAnswers[questionIndex] = value;
        setData('answers', newAnswers);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('tests.store.essay'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-brand-dark leading-tight">{testType} - {course.title}</h2>}
        >
            <Head title={`${testType} - ${course.title}`} />

            <div className="min-h-screen bg-brand-light font-sans py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="text-center mb-8">
                        <span className="bg-brand-blue/10 text-brand-blue font-black px-4 py-1.5 rounded-full text-sm uppercase tracking-wide">Essay / Short Answer</span>
                        <h1 className="text-3xl font-black text-brand-dark mt-4">{testType}</h1>
                        <p className="text-brand-secondary mt-2 font-medium">{course.title} ({course.code}) &mdash; {questions.length} Questions</p>
                    </div>

                    <div className="bg-brand-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
                        <form onSubmit={submit}>
                            {questions.map((q, questionIndex) => (
                                <div key={questionIndex} className="mb-10 pb-10 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
                                    <div className="flex gap-4 mb-5">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                                            {questionIndex + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-lg font-bold text-brand-dark leading-relaxed pt-1 mb-4">
                                                {q.question}
                                            </p>

                                            <div className="relative">
                                                <textarea
                                                    className={`w-full h-40 p-4 pb-12 rounded-xl text-brand-dark resize-none transition-colors border-2 ${isRecording === questionIndex ? 'border-brand-blue ring-4 ring-brand-blue/20' : 'border-gray-200 focus:border-brand-blue focus:ring-brand-blue/20'}`}
                                                    placeholder="Type your essay answer here..."
                                                    value={data.answers[questionIndex]}
                                                    onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                                                    required
                                                ></textarea>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleRecording(questionIndex)}
                                                    className={`absolute bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2 ${isRecording === questionIndex ? 'bg-brand-dark text-white animate-pulse' : 'bg-gray-100 text-brand-secondary hover:bg-gray-200 hover:text-brand-dark'}`}
                                                >
                                                    {isRecording === questionIndex ? (
                                                        <><i className="fas fa-stop-circle"></i> Stop Recording</>
                                                    ) : (
                                                        <><i className="fas fa-microphone"></i> Dictate Answer</>
                                                    )}
                                                </button>
                                            </div>
                                            {isRecording === questionIndex && (
                                                <p className="text-xs text-brand-blue mt-2 font-bold animate-pulse">
                                                    <i className="fas fa-satellite-dish mr-1"></i> Listening... Speak clearly into your microphone.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="mt-12 text-center pt-8 border-t border-gray-200">
                                <button type="submit" disabled={processing} className="w-full sm:w-auto px-12 py-4 bg-brand-dark text-white font-black rounded-xl shadow-xl hover:bg-black hover:-translate-y-1 disabled:opacity-50 transition-all text-lg">
                                    {processing ? <><i className="fas fa-spinner fa-spin mr-2"></i> Auto-Grading Essay...</> : <><i className="fas fa-robot mr-2"></i> Submit for AI Grading</>}
                                </button>
                                <p className="text-center text-xs text-brand-secondary mt-4">
                                    <i className="fas fa-bolt text-brand-blue mr-1"></i> Your essays will be evaluated by our Advanced AI.
                                </p>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
