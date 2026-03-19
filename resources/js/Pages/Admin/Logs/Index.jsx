import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({ auth, logs, sessions, currentTab }) {
    const tabs = [
        { id: 'all', label: 'ALL EVENTS' },
        { id: 'signups', label: 'SIGNUPS' },
        { id: 'academic', label: 'ACADEMIC CONTENT' },
        { id: 'ai', label: 'AI QUERIES' },
        { id: 'sessions', label: 'USER SESSIONS' },
    ];

    const handleTabChange = (tabId) => {
        router.get(route('admin.logs'), { tab: tabId }, { preserveState: true });
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'Active';
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        return `${hours}h ${mins % 60}m`;
    };

    const data = currentTab === 'sessions' ? sessions.data : logs.data;

    return (
        <AdminLayout>
            <Head title="Activity Logs" />

            <div className="py-12 px-4 sm:px-8 lg:px-12">
                <div className="mb-12">
                    <h2 className="text-3xl font-black text-brand-dark tracking-tight uppercase mb-2">System Activity Monitoring</h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Real-time engagement, governance, and session intelligence</p>
                </div>

                <div className="bg-brand-dark rounded-[3rem] shadow-2xl overflow-hidden border border-white/5">
                    <div className="p-8 border-b border-white/5 flex gap-4 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`px-6 py-3 text-[10px] font-black rounded-xl uppercase tracking-widest transition whitespace-nowrap ${
                                    currentTab === tab.id 
                                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-8 space-y-4">
                        {data?.map((item) => (
                            <div key={item.id} className="flex items-start gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/[0.08] transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
                                    currentTab === 'sessions' || item.type === 'Auth' ? 'bg-brand-blue/10 text-brand-blue' : 
                                    item.type === 'Signup' ? 'bg-green-400/10 text-green-400' : 
                                    item.type === 'Academic Content' ? 'bg-amber-400/10 text-amber-400' :
                                    item.type === 'AI Query' ? 'bg-purple-400/10 text-purple-400' :
                                    item.type === 'Account Update' ? 'bg-rose-400/10 text-rose-400' :
                                    'bg-gray-400/10 text-gray-400'
                                }`}>
                                    <i className={`fas ${
                                        currentTab === 'sessions' ? 'fa-fingerprint' :
                                        item.type === 'Login' ? 'fa-sign-in-alt' : 
                                        item.type === 'Signup' ? 'fa-user-plus' : 
                                        item.description?.toLowerCase().includes('past-question') ? 'fa-question-circle' :
                                        item.type === 'Academic Content' ? 'fa-graduation-cap' :
                                        item.type === 'AI Query' ? 'fa-robot' : 
                                        item.type === 'Account Update' ? 'fa-user-cog' :
                                        item.type === 'Auth' ? 'fa-shield-alt' : 'fa-brain'
                                    }`}></i>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">
                                                {currentTab === 'sessions' ? 'Session Log' : item.type}
                                            </span>
                                            <span className="text-gray-400 text-[10px] font-bold mt-1">
                                                {item.user ? item.user.name : 'System'} 
                                                {currentTab === 'sessions' && ` • ${item.ip_address}`}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 italic">
                                            {new Date(currentTab === 'sessions' ? item.login_at : item.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    
                                    {currentTab === 'sessions' ? (
                                        <div className="mt-3 grid grid-cols-3 gap-4">
                                            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-tighter mb-1">Device Detail</p>
                                                <p className="text-white text-xs font-bold">{item.platform} • {item.browser}</p>
                                            </div>
                                            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-tighter mb-1">Access Type</p>
                                                <p className="text-white text-xs font-bold">{item.device_type}</p>
                                            </div>
                                            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-tighter mb-1">Time Spent</p>
                                                <p className="text-brand-blue text-xs font-black">{formatDuration(item.duration_seconds)}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-white font-medium text-sm leading-relaxed mt-2">{item.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {(!data || data.length === 0) && (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-stream text-2xl text-gray-700"></i>
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No activity datasets found for this segment</p>
                            </div>
                        )}
                    </div>
                    
                    {(logs?.links?.length > 3 || sessions?.links?.length > 3) && (
                        <div className="p-8 bg-black/20 border-t border-white/5 flex justify-center gap-2">
                            {(currentTab === 'sessions' ? sessions : logs).links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url || link.active}
                                    onClick={() => router.get(link.url)}
                                    className={`px-4 py-2 text-[10px] font-bold rounded-lg transition ${
                                        link.active ? 'bg-brand-blue text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                    } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
