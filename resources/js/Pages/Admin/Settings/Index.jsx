import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Index({ auth, settings }) {
    return (
        <AdminLayout>
            <Head title="Global Settings" />

            <div className="py-12 px-4 sm:px-8 lg:px-12">
                <div className="mb-12">
                    <h2 className="text-3xl font-black text-brand-dark tracking-tight uppercase mb-2">Global Settings</h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Configure platform constants and system behavior</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    
                    {/* General Settings */}
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 border border-gray-100">
                        <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight mb-8 flex items-center gap-3">
                            <i className="fas fa-cogs text-brand-blue"></i> Platform Identity
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Application Name</label>
                                <input 
                                    type="text" 
                                    defaultValue={settings.app_name}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 text-brand-dark font-bold focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Environment</label>
                                <div className="px-6 py-4 bg-blue-50 rounded-2xl border border-blue-100 text-brand-blue text-sm font-black uppercase tracking-widest">
                                    {settings.environment} Mode
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Configuration */}
                    <div className="bg-brand-dark rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden">
                        <i className="fas fa-microchip absolute right-[-2rem] top-[-2rem] text-[10rem] text-white/5 -rotate-12"></i>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3 relative z-10">
                            <i className="fas fa-robot text-brand-blue"></i> AI Intelligence
                        </h3>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Primary Engine</label>
                                <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-white text-sm font-bold flex items-center justify-between">
                                    <span>{settings.ai_model}</span>
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">API Latency Optimization</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-blue w-[85%]"></div>
                                    </div>
                                    <span className="text-white font-black text-xs">85%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-12 flex justify-end">
                    <button className="px-10 py-5 bg-brand-dark text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-brand-blue transition-all transform hover:scale-[1.05]">
                        Save System Changes
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
