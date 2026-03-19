import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ResultPage({ auth, pastQuestion, result }) {
    if (!result) return null;

    const { overall_score, results } = result;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight tracking-tight">Exam Feedback: {pastQuestion.course_code}</h2>}
        >
            <Head title="Execution Result" />

            <div className="py-12 bg-gray-50/50 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Score Card Section */}
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-blue/10 overflow-hidden border border-gray-100 mb-12 relative">
                        <div className="bg-gradient-to-r from-brand-blue to-brand-dark p-12 text-center relative overflow-hidden">
                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-blue/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                            
                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center p-4 bg-white/20 backdrop-blur-md rounded-2xl mb-6 ring-1 ring-white/30">
                                    <i className="fas fa-award text-3xl text-white"></i>
                                </div>
                                <h1 className="text-white text-lg font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Final Assessment</h1>
                                <div className="text-7xl md:text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-lg">
                                    {overall_score}
                                </div>
                                <p className="text-white/80 font-medium max-w-md mx-auto">
                                    Great effort! The AI has analyzed your submission against the repository's source materials.
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-10 flex flex-wrap justify-center gap-6 border-b border-gray-50">
                            <div className="bg-gray-50 px-8 py-4 rounded-3xl border border-gray-100 flex flex-col items-center min-w-[160px]">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Items</span>
                                <span className="text-2xl font-black text-gray-900">{results.length}</span>
                            </div>
                            <div className="bg-green-50/50 px-8 py-4 rounded-3xl border border-green-100 flex flex-col items-center min-w-[160px]">
                                <span className="text-xs text-green-600/60 font-bold uppercase tracking-wider mb-1">Scored</span>
                                <span className="text-2xl font-black text-green-700">
                                    {results.filter(r => r.status === 'scored').length}
                                </span>
                            </div>
                            <div className="bg-red-50/50 px-8 py-4 rounded-3xl border border-red-100 flex flex-col items-center min-w-[160px]">
                                <span className="text-xs text-red-600/60 font-bold uppercase tracking-wider mb-1">Failed</span>
                                <span className="text-2xl font-black text-red-700">
                                    {results.filter(r => r.status === 'fail').length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Script Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between mb-4 px-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <i className="fas fa-bullseye mr-3 text-brand-blue"></i>
                                Detailed Script Breakdown
                            </h2>
                            <div className="text-sm font-medium text-gray-400 italic">
                                Scanned by Prep-AIV Oracle
                            </div>
                        </div>

                        {results.map((item, index) => (
                            <div 
                                key={index} 
                                className={`
                                    bg-white rounded-3xl border shadow-sm transition-all duration-300
                                    ${item.status === 'scored' ? 'border-green-100 hover:border-green-300' : 'border-red-100 hover:border-red-300'}
                                `}
                            >
                                <div className="p-8">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center">
                                            <div className={`
                                                w-12 h-12 rounded-2xl flex items-center justify-center mr-5 shadow-inner
                                                ${item.status === 'scored' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}
                                            `}>
                                                {item.status === 'scored' ? <i className="fas fa-check-circle text-xl"></i> : <i className="fas fa-times-circle text-xl"></i>}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 leading-none mb-1">Question {item.question_number}</h3>
                                                <span className={`text-xs font-black uppercase tracking-widest ${item.status === 'scored' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {item.status === 'scored' ? 'Mastered' : 'Needs Review'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 font-black text-gray-700">
                                            {item.score}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                                <i className="fas fa-arrow-right mr-2 text-brand-blue/60"></i>
                                                Your Submission
                                            </div>
                                            <div className="p-6 bg-gray-50/50 rounded-2xl italic text-gray-600 border border-gray-100 min-h-[100px]">
                                                {item.user_answer || '(No answer provided)'}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="text-xs font-bold text-brand-blue uppercase tracking-widest flex items-center">
                                                <i className="fas fa-check-double mr-2 text-brand-blue/60"></i>
                                                Correct Solution
                                            </div>
                                            <div className="p-6 bg-brand-blue/5 rounded-2xl text-brand-dark border border-brand-blue/10 min-h-[100px] font-medium leading-relaxed">
                                                {item.correct_answer}
                                            </div>
                                        </div>
                                    </div>

                                    {item.feedback && (
                                        <div className="mt-8 pt-8 border-t border-gray-50">
                                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <i className="fas fa-comment-dots text-gray-400 shrink-0 mt-1"></i>
                                                <div className="text-sm text-gray-500">
                                                    <span className="font-bold text-gray-600 mr-2">Feedback:</span>
                                                    {item.feedback}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-16 mb-20 flex flex-col md:flex-row gap-6 justify-center items-center">
                        <Link
                            href={route('past-questions.solve', pastQuestion.id)}
                            className="inline-flex items-center px-8 py-4 bg-white border-2 border-brand-blue text-brand-blue rounded-2xl font-black uppercase tracking-widest hover:bg-brand-light transition-all active:scale-95 shadow-lg"
                        >
                            <i className="fas fa-redo mr-3"></i>
                            Retake Exam
                        </Link>
                        <Link
                            href={route('past-questions.index')}
                            className="inline-flex items-center px-10 py-4 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
                        >
                            Back to Library
                            <i className="fas fa-chevron-left ml-3 rotate-180"></i>
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .rounded-3xl { border-radius: 2rem; }
                .tracking-tighter { letter-spacing: -0.05em; }
                .scale-102 { transform: scale(1.02); }
            `}</style>
        </AuthenticatedLayout>
    );
}
