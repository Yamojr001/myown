import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-gray-200/50 border border-gray-50 flex items-center justify-between transition-all hover:translate-y-[-4px] duration-300">
        <div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-3">{title}</p>
            <h4 className="text-4xl font-black text-brand-dark tracking-tighter">{value}</h4>
        </div>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${color} shadow-inner`}>
            <i className={`fas ${icon}`}></i>
        </div>
    </div>
);

export default function Dashboard({ auth, stats, recentUsers, recentUploads }) {
    return (
        <AdminLayout>
            <Head title="Admin Command Center" />

            <div className="py-12 px-4 sm:px-8 lg:px-12">
                
                <div className="mb-12">
                    <h2 className="text-3xl font-black text-brand-dark tracking-tight uppercase mb-2">System Overview</h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Real-time Platform Metrics</p>
                </div>
                
                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <StatCard 
                        title="Total Scholars" 
                        value={stats.total_users} 
                        icon="fa-users" 
                        color="bg-blue-100 text-blue-600"
                    />
                    <StatCard 
                        title="Course Modules" 
                        value={stats.total_courses} 
                        icon="fa-book-open" 
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard 
                        title="Tests Taken" 
                        value={stats.total_tests} 
                        icon="fa-file-signature" 
                        color="bg-orange-100 text-orange-600"
                    />
                    <StatCard 
                        title="Past Qs Repository" 
                        value={stats.total_past_questions} 
                        icon="fa-university" 
                        color="bg-purple-100 text-purple-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Recent Users Table */}
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-blue/10 overflow-hidden border border-gray-100">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">Recent Signups</h3>
                            <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full">LIVE</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/20 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-brand-dark">{user.name}</div>
                                                <div className="text-sm text-gray-400 font-medium">{user.email}</div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="text-sm font-bold text-gray-500 italic">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Uploads Table */}
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-blue/10 overflow-hidden border border-gray-100">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">Recent Past Qs</h3>
                            <i className="fas fa-cloud-upload-alt text-brand-blue animate-pulse"></i>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Uploader</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUploads.map((upload) => (
                                        <tr key={upload.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/20 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-brand-dark">{upload.course_code}</div>
                                                <div className="text-sm text-gray-400 font-medium truncate max-w-[200px]">{upload.school}</div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="text-sm font-black text-brand-blue uppercase tracking-tighter">
                                                    {upload.user.name}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* System Monitoring Section */}
                <div className="mt-12 bg-brand-dark rounded-[3rem] p-10 relative overflow-hidden group">
                    {/* Decorative Background Icon */}
                    <i className="fas fa-server absolute right-[-2rem] bottom-[-2rem] text-[15rem] text-white/5 -rotate-12 transition-transform group-hover:rotate-0 duration-700"></i>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h5 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">System Health</h5>
                            <p className="text-blue-200/60 font-medium flex items-center gap-2 justify-center md:justify-start">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                                All services operational - Gemini AI v2.5 Flash Online
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[120px]">
                                <p className="text-xs text-white/40 font-bold uppercase mb-1">Response Time</p>
                                <p className="text-xl font-black text-white">124ms</p>
                            </div>
                            <div className="px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[120px]">
                                <p className="text-xs text-white/40 font-bold uppercase mb-1">AI Accuracy</p>
                                <p className="text-xl font-black text-white">99.8%</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}