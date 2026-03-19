import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Index({ auth, pastQuestions }) {
    return (
        <AdminLayout>
            <Head title="Past Qs Repository" />

            <div className="py-12 px-4 sm:px-8 lg:px-12">
                <div className="mb-12">
                    <h2 className="text-3xl font-black text-brand-dark tracking-tight uppercase mb-2">Past Qs Repository</h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Global collection of university examination papers</p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Course Code</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">University / Faculty</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Uploader</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pastQuestions.data.map((pq) => (
                                    <tr key={pq.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="font-black text-brand-blue tracking-tighter uppercase">{pq.course_code}</div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">{pq.course_title}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold text-brand-dark">{pq.school}</div>
                                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{pq.exam_name}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                                {pq.user.name}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right text-sm font-bold text-gray-400 italic">
                                            {new Date(pq.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pastQuestions.links.length > 3 && (
                        <div className="p-8 bg-gray-50/50 flex justify-center gap-2">
                            {pastQuestions.links.map((link, i) => (
                                <button
                                    key={i}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    onClick={() => link.url && (window.location.href = link.url)}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                        link.active 
                                        ? 'bg-brand-blue text-white' 
                                        : 'bg-white text-gray-400 hover:bg-brand-blue/10'
                                    } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
