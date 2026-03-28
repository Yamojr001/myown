import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, stats }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        subject: '',
        content: '',
    });
    const { flash } = usePage().props;

    const [preview, setPreview] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        if (confirm(`Broadcasting to ${stats.total_subscribers} scholars. Proceed?`)) {
            post(route('admin.newsletter.send'), {
                onSuccess: (page) => {
                    reset();
                    alert(page?.props?.flash?.success || 'Broadcast initiated successfully!');
                },
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Newsletter Broadcast" />

            <div className="py-12 px-4 sm:px-8 lg:px-12">
                {flash?.success && (
                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-800">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-800">
                        {flash.error}
                    </div>
                )}

                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-brand-dark tracking-tight uppercase mb-2">Newsletter Broadcast</h2>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Send announcements to all subscribed scholars</p>
                    </div>
                    <div className="px-6 py-3 bg-brand-blue/10 rounded-2xl border border-brand-blue/20">
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest block mb-1 text-center">Active Subscribers</span>
                        <span className="text-2xl font-black text-brand-dark block text-center leading-none">{stats.total_subscribers}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Composer */}
                    <div className="lg:col-span-2 space-y-8">
                        <form onSubmit={submit} className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 border border-gray-100">
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Email Subject</label>
                                    <input 
                                        type="text" 
                                        value={data.subject}
                                        onChange={e => setData('subject', e.target.value)}
                                        placeholder="e.g. Important Update Regarding Mid-Semester Assessments"
                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl py-5 px-6 text-brand-dark font-bold focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                                    />
                                    {errors.subject && <div className="mt-2 text-red-500 text-xs font-bold uppercase">{errors.subject}</div>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-right flex justify-between">
                                        <span>Message Content</span>
                                        <span className="text-brand-blue text-[8px]">MARKDOWN SUPPORTED</span>
                                    </label>
                                    <textarea 
                                        rows="12"
                                        value={data.content}
                                        onChange={e => setData('content', e.target.value)}
                                        placeholder="Write your announcement here..."
                                        className="w-full bg-gray-50 border-gray-100 rounded-[2rem] py-6 px-8 text-brand-dark font-medium leading-relaxed focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                                    ></textarea>
                                    {errors.content && <div className="mt-2 text-red-500 text-xs font-bold uppercase">{errors.content}</div>}
                                </div>

                                <div className="flex justify-between items-center bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
                                            <i className="fas fa-info-circle"></i>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-brand-dark uppercase tracking-tight leading-none mb-1">Queue Protection</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Emails are sent in batches to prevent server overload.</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="px-10 py-5 bg-brand-dark text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-brand-blue transition-all transform hover:scale-[1.05] disabled:opacity-50"
                                    >
                                        {processing ? 'Broadcasting...' : 'Begin Broadcast'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Guidelines & Tips */}
                    <div className="space-y-8">
                        <div className="bg-brand-dark rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                             <i className="fas fa-bullhorn absolute right-[-1rem] top-[-1rem] text-[8rem] text-white/5 -rotate-12"></i>
                             <h3 className="text-lg font-black text-white uppercase tracking-tight mb-8 relative z-10 flex items-center gap-3">
                                <i className="fas fa-lightbulb text-brand-blue"></i> Tips for Success
                             </h3>
                             <ul className="space-y-6 relative z-10">
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] text-brand-blue font-black shrink-0">1</div>
                                    <p className="text-gray-400 text-xs font-medium leading-relaxed">Keep your subject lines concise and action-oriented.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] text-brand-blue font-black shrink-0">2</div>
                                    <p className="text-gray-400 text-xs font-medium leading-relaxed">Use line breaks to improve readability on mobile devices.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] text-brand-blue font-black shrink-0">3</div>
                                    <p className="text-gray-400 text-xs font-medium leading-relaxed">Ensure your tone reflects the professional nature of Phronix AI.</p>
                                </li>
                             </ul>
                        </div>

                        <div className="bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100 flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-brand-blue/5 text-brand-blue text-2xl">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <div>
                                <h4 className="font-black text-brand-dark uppercase tracking-tighter text-sm mb-1">GDPR Compliant</h4>
                                <p className="text-[10px] text-gray-500 font-bold leading-tight">Every email automatically includes a secure unsubscribe link for user privacy.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
