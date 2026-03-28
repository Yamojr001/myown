import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import MiniTest from './Partials/MiniTest';
import SplashPage from './Partials/SplashPage';

export default function Show({ auth, course, todayHandout, progress, weekNumber, dayName }) {
    const [selectedText, setSelectedText] = useState('');
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [showTooltip, setShowTooltip] = useState(false);
    const [explanation, setExplanation] = useState(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const [showTest, setShowTest] = useState(false);
    const [showSplash, setShowSplash] = useState(false);
    const [completedTasks, setCompletedTasks] = useState(progress.completed_tasks || []);
    
    const readerRef = useRef(null);
    const utteranceRef = useRef(null);

    // Text-to-Speech handling
    const speak = (text) => {
        if (!window.speechSynthesis) return;
        
        // Stop any current speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text && readerRef.current?.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            setTooltipPos({
                x: rect.left + rect.width / 2,
                y: rect.top - 40 + window.scrollY
            });
            setSelectedText(text);
            setShowTooltip(true);
        } else {
            setShowTooltip(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleTextSelection);
        return () => document.removeEventListener('mouseup', handleTextSelection);
    }, []);

    const handleExplain = async () => {
        setShowTooltip(false);
        setIsExplaining(true);
        setExplanation(null);
        
        try {
            const response = await axios.post(route('study-room.explain'), { text: selectedText });
            setExplanation(response.data.explanation);
            // Optionally read explanation aloud
            speak(response.data.explanation);
        } catch (error) {
            console.error('Explanation failed', error);
        } finally {
            setIsExplaining(false);
        }
    };

    const handleRead = () => {
        setShowTooltip(false);
        speak(selectedText);
    };

    const toggleTask = async (task) => {
        try {
            const response = await axios.post(route('study-room.toggle-task'), {
                course_id: course.id,
                task: task,
                week_number: weekNumber,
                day_name: dayName
            });
            setCompletedTasks(response.data.completed_tasks);
        } catch (error) {
            console.error('Task toggle failed', error);
        }
    };

    const onTestPass = () => {
        setShowTest(false);
        setShowSplash(true);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${course.code} - Study Room`} />

            {showSplash && <SplashPage onClose={() => setShowSplash(false)} />}
            
            {showTest && (
                <MiniTest 
                    course={course} 
                    weekNumber={weekNumber} 
                    dayName={dayName} 
                    onClose={() => setShowTest(false)}
                    onPass={onTestPass}
                />
            )}

            <div className="p-4 sm:p-6 lg:p-10 bg-[#0a0f1d] min-h-screen text-white/90">
                <div className="max-w-7xl mx-auto space-y-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass-card p-8 rounded-[2.5rem] border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Link href={route('study-room.index')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all">
                                    <i className="fas fa-arrow-left text-xs"></i>
                                </Link>
                                <span className="text-gray-500 font-bold">/</span>
                                <span className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">{course.code}</span>
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter">{course.title}</h1>
                        </div>
                        <div className="mt-6 md:mt-0 px-6 py-3 bg-brand-blue/10 rounded-2xl border border-brand-blue/20 shadow-lg shadow-brand-blue/5 animate-shimmer">
                            <span className="text-brand-blue font-black text-xs uppercase tracking-widest">
                                <i className="fas fa-calendar-day mr-2"></i> {dayName} • Week {weekNumber}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Main Reader Content */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="glass-card rounded-[3rem] p-10 relative min-h-[600px] border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]" ref={readerRef}>
                                {todayHandout ? (
                                    <>
                                        <div className="mb-12 p-8 bg-gradient-to-br from-brand-blue/20 to-indigo-600/10 rounded-[2rem] border-l-8 border-brand-blue shadow-inner group">
                                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3">Daily Objective</h4>
                                            <p className="text-2xl font-black text-white leading-tight group-hover:translate-x-1 transition-transform">{todayHandout.focus}</p>
                                        </div>

                                        <div className="prose prose-invert max-w-none">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4">Key Learning Material</h4>
                                            <ul className="space-y-10 list-none p-0">
                                                {todayHandout.points.map((point, idx) => (
                                                    <li key={idx} className="group flex gap-8 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                                                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-brand-blue flex items-center justify-center font-black text-lg group-hover:bg-brand-blue group-hover:text-white transition-all group-hover:-rotate-6 shadow-lg">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 mt-1">
                                                            <span className="text-xl leading-[1.6] text-gray-300 font-medium group-hover:text-white transition-colors selection:bg-brand-blue selection:text-white">
                                                                {point}
                                                            </span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-20 grayscale opacity-50">
                                        <i className="fas fa-book-open text-6xl mb-4"></i>
                                        <p className="text-xl font-bold">No handout found for today.</p>
                                        <p className="text-sm">Please check your timetable or reading plan.</p>
                                    </div>
                                )}

                                {/* Floating Tooltip */}
                                {showTooltip && (
                                    <div 
                                        className="fixed z-50 transform -translate-x-1/2 flex items-center gap-1 bg-white/10 backdrop-blur-2xl p-1.5 rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200"
                                        style={{ left: tooltipPos.x, top: tooltipPos.y }}
                                    >
                                        <button 
                                            onClick={handleExplain}
                                            className="px-4 py-2 hover:bg-white/10 rounded-xl font-black text-xs flex items-center gap-2 border-r border-white/10 transition-colors"
                                        >
                                            <i className="fas fa-magic text-yellow-400"></i> Explain
                                        </button>
                                        <button 
                                            onClick={handleRead}
                                            className="px-4 py-2 hover:bg-white/10 rounded-xl font-black text-xs flex items-center gap-2 transition-colors"
                                        >
                                            <i className="fas fa-volume-up text-brand-blue"></i> Read
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Explanation Box */}
                            {(isExplaining || explanation) && (
                                <div className="glass-card bg-indigo-950/40 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700 border-white/5">
                                    <div className="p-6 bg-white/5 flex justify-between items-center border-b border-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-[.3em] text-indigo-400 flex items-center gap-3">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                            AI Tutor Perspective
                                        </span>
                                        <button 
                                            onClick={() => setExplanation(null)}
                                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                        >
                                            <i className="fas fa-times text-xs"></i>
                                        </button>
                                    </div>
                                    <div className="p-8">
                                        {isExplaining ? (
                                            <div className="flex items-center gap-6 py-4">
                                                <div className="w-14 h-14 border-4 border-brand-blue border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
                                                <div>
                                                    <p className="font-black text-white text-lg">Thinking deeply...</p>
                                                    <p className="text-gray-500 text-sm">Our AI professor is analyzing the context.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <p className="text-xl leading-relaxed font-medium text-gray-200 selection:bg-brand-blue">
                                                    {explanation}
                                                </p>
                                                <div className="pt-6 border-t border-white/5 flex items-center gap-4">
                                                    <button 
                                                        onClick={() => speak(explanation)}
                                                        className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-indigo-300"
                                                    >
                                                        <i className="fas fa-redo-alt mr-2"></i>Re-read Aloud
                                                    </button>
                                                    <button 
                                                        onClick={handleExplain}
                                                        className="px-5 py-3 bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/30 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-brand-blue"
                                                    >
                                                        <i className="fas fa-sync-alt mr-2"></i>Refine Explanation
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Daily Checklist */}
                            <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
                                <div className="p-8 bg-white/[0.02] border-b border-white/5">
                                    <h3 className="text-xl font-black text-white tracking-tight">Focus Tasks</h3>
                                    <p className="text-xs text-brand-blue mt-1 font-black uppercase tracking-widest">Today's Milestone</p>
                                </div>
                                <div className="p-8 space-y-4">
                                    {todayHandout ? (
                                        <>
                                            {todayHandout.tasks.map((task, idx) => {
                                                const isCompleted = completedTasks.includes(task);
                                                return (
                                                    <div 
                                                        key={idx} 
                                                        onClick={() => toggleTask(task)}
                                                        className={`group p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                                            isCompleted 
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5' 
                                                            : 'bg-white/5 border-white/5 text-gray-400 hover:border-brand-blue/30 hover:text-white'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                                                isCompleted ? 'bg-emerald-500 text-white rotate-[360deg]' : 'bg-white/5 border border-white/10'
                                                            }`}>
                                                                {isCompleted ? <i className="fas fa-check text-xs"></i> : <div className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-brand-blue"></div>}
                                                            </div>
                                                            <span className={`text-sm font-bold tracking-tight ${isCompleted ? 'line-through opacity-50' : ''}`}>
                                                                {task}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <div className="py-10 text-center text-gray-600">
                                            <i className="fas fa-clipboard-list text-3xl mb-4 opacity-20"></i>
                                            <p className="text-sm font-bold uppercase tracking-widest">No tasks yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mini Test Trigger */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-800 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] text-white group animate-float">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:scale-150 transition-all duration-1000"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/10 rounded-full blur-[40px] -ml-10 -mb-10"></div>
                                
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl group-hover:rotate-[10deg] transition-transform">
                                        <i className="fas fa-brain text-2xl"></i>
                                    </div>
                                    <h3 className="text-3xl font-black mb-3 tracking-tighter leading-none">Validate Your Knowledge</h3>
                                    <p className="text-indigo-100/70 text-sm mb-10 font-medium leading-relaxed">
                                        Take a high-impact 10-question mini-test to master today's course material.
                                    </p>
                                    
                                    <button 
                                        onClick={() => setShowTest(true)}
                                        disabled={!todayHandout}
                                        className="w-full py-5 bg-white text-indigo-700 rounded-2xl font-black shadow-2xl hover:shadow-white/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale tracking-tight text-lg"
                                    >
                                        Enter Exam Mode
                                    </button>
                                    
                                    {progress.test_passed && (
                                        <div className="mt-6 flex items-center justify-center gap-3 text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em] bg-emerald-500/10 py-2 rounded-full border border-emerald-500/20">
                                            <i className="fas fa-check-circle"></i> Milestone Achievement
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
);
}
