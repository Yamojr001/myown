import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, suggestedCourse, courses, currentDay, currentWeek }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Study Room" />

                    <div className="p-4 sm:p-6 lg:p-10 bg-[#0a0f1d] min-h-screen text-white/90">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Welcome Header */}
                    <div className="relative overflow-hidden p-10 rounded-[2.5rem] glass-card bg-gradient-to-br from-brand-blue/20 to-purple-600/10 backdrop-blur-3xl border-white/10 group">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-blue/20 rounded-full blur-[100px] group-hover:bg-brand-blue/30 transition-all duration-700"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                                <span className="inline-block px-4 py-1.5 bg-brand-blue/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] rounded-full mb-4 border border-blue-500/20">
                                    Student Portal
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3">
                                    My <span className="text-gradient">Study Room</span>
                                </h1>
                                <p className="text-gray-400 font-medium text-lg">
                                    Welcome back, {auth.user.name}. It's <span className="text-white font-bold">{currentDay}</span>, Week <span className="text-white font-bold">{currentWeek}</span>.
                                </p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/10 shadow-2xl animate-float">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                                    <div className="text-sm font-bold uppercase tracking-widest text-blue-300">Focus Mode Active</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Suggested Course / Current Task */}
                        <div className="lg:col-span-8 space-y-8">
                            <h2 className="text-2xl font-black text-white flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
                                    <i className="fas fa-bolt text-yellow-500"></i>
                                </div>
                                Today's Focus
                            </h2>
                            
                            {suggestedCourse ? (
                                <div className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-md p-10 rounded-[3rem] border border-white/5 hover:border-brand-blue/30 transition-all duration-500 shadow-2xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-brand-blue/10 transition-colors"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <span className="px-4 py-1.5 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4 inline-block border border-brand-blue/20">
                                                    Current Handout
                                                </span>
                                                <h3 className="text-4xl font-black text-white group-hover:text-brand-blue transition-colors leading-[1.1] mb-2 pr-10">
                                                    {suggestedCourse.title}
                                                </h3>
                                                <p className="text-blue-400 font-black text-lg tracking-widest uppercase">{suggestedCourse.code}</p>
                                            </div>
                                            <div className="w-20 h-20 glass-card rounded-[2rem] flex items-center justify-center group-hover:rotate-[15deg] transition-all duration-700 shadow-xl border-white/20">
                                                <i className="fas fa-book-reader text-3xl text-brand-blue group-hover:scale-110 transition-transform"></i>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row gap-6 items-center pt-4">
                                            <Link
                                                href={route('study-room.show', suggestedCourse.id)}
                                                className="w-full sm:w-auto px-10 py-5 bg-brand-blue text-white rounded-2xl font-black shadow-[0_10px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.6)] hover:-translate-y-1 active:scale-95 transition-all text-center tracking-tight"
                                            >
                                                Launch Session <i className="fas fa-arrow-right ml-2 text-xs"></i>
                                            </Link>
                                            <p className="text-sm text-gray-500 font-bold max-w-xs italic leading-relaxed">
                                                Everything is prepared. Click to start your personalized learning module.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/5 backdrop-blur-md p-12 rounded-[3rem] text-center space-y-6 border border-white/10 border-dashed group">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-700 group-hover:text-gray-500 transition-colors shadow-inner">
                                        <i className="fas fa-calendar-times text-5xl"></i>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tighter">Your table is empty</h3>
                                        <p className="text-gray-500 text-base max-w-sm mx-auto font-medium leading-relaxed">
                                            Currently no courses scheduled. You can choose any previous material below to review.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Features Preview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                                <div className="p-8 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/10 flex items-start gap-6 hover:bg-blue-500/10 transition-colors">
                                    <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                                        <i className="fas fa-brain text-xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-blue-100 text-lg mb-1 tracking-tight">Interactive Reader</h4>
                                        <p className="text-sm text-gray-500 leading-relaxed">Select text for instant AI tutor explanations and technical insights.</p>
                                    </div>
                                </div>
                                <div className="p-8 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10 flex items-start gap-6 hover:bg-emerald-500/10 transition-colors">
                                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                                        <i className="fas fa-tasks text-xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-emerald-100 text-lg mb-1 tracking-tight">Daily Mini-Tests</h4>
                                        <p className="text-sm text-gray-500 leading-relaxed">Validate your recall with automated tests after each successful reading session.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Courses / Selection */}
                        <div className="lg:col-span-4 space-y-8">
                            <h2 className="text-2xl font-black text-white flex items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center border border-brand-blue/20">
                                    <i className="fas fa-archive text-brand-blue"></i>
                                </div>
                                Materials
                            </h2>
                            
                            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                <div className="p-6 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Available Library</span>
                                    <span className="px-3 py-1 bg-brand-blue text-white text-[10px] font-black rounded-full shadow-lg shadow-brand-blue/40">
                                        {courses.length}
                                    </span>
                                </div>
                                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {courses.length > 0 ? courses.map((course) => (
                                        <Link
                                            key={course.id}
                                            href={route('study-room.show', course.id)}
                                            className="block p-6 hover:bg-white/5 transition-all group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <h4 className="font-black text-white group-hover:text-brand-blue transition-colors truncate text-lg tracking-tight">
                                                        {course.title}
                                                    </h4>
                                                    <p className="text-xs text-blue-400 font-black tracking-widest uppercase mt-1">{course.code}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all group-hover:translate-x-1">
                                                    <i className="fas fa-chevron-right text-xs"></i>
                                                </div>
                                            </div>
                                        </Link>
                                    )) : (
                                        <div className="p-12 text-center text-gray-500">
                                            <i className="fas fa-ghost text-4xl mb-4 opacity-20"></i>
                                            <p className="text-sm font-bold">No handouts generated yet.</p>
                                            <Link href={route('reading-handouts.index')} className="text-xs text-brand-blue hover:underline mt-2 inline-block font-black uppercase tracking-widest">
                                                Create First Handout
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Study Tip Card */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-600/5 rounded-[2.5rem] p-8 border border-amber-500/20 group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                                    <i className="fas fa-lightbulb text-2xl"></i>
                                </div>
                                <h4 className="font-black text-amber-100 text-xl mb-3 tracking-tight">Pro Study Tip</h4>
                                <p className="text-sm text-gray-400 leading-relaxed italic font-medium">
                                    "Selecting complex text and using **AI Explain** helps building active recall pathways. Try explaining concepts back to the AI!"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
