import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function NotificationsIndex({ auth, notifications }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        content: '',
        type: 'info',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.notifications.send'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AdminLayout>
            <Head title="Admin - System Notifications" />

            <div className="py-12 bg-gray-50/50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Send New Notification Form */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl border border-gray-100 p-8">
                        <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                            <i className="fas fa-paper-plane text-brand-blue"></i>
                            Broadcast New Announcement
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Notification Title</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 focus:border-brand-blue focus:ring focus:ring-brand-blue/10 bg-gray-50/50 p-4 transition-all"
                                        placeholder="e.g. System Maintenance, Semester Update..."
                                    />
                                    {errors.title && <div className="text-red-500 text-xs mt-1 font-bold">{errors.title}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Notification Type</label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 focus:border-brand-blue focus:ring focus:ring-brand-blue/10 bg-gray-50/50 p-4 transition-all"
                                    >
                                        <option value="info">Information (Blue)</option>
                                        <option value="success">Success (Green)</option>
                                        <option value="warning">Warning (Yellow)</option>
                                        <option value="danger">Critical (Red)</option>
                                    </select>
                                    {errors.type && <div className="text-red-500 text-xs mt-1 font-bold">{errors.type}</div>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Announcement Content</label>
                                <textarea
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    rows="4"
                                    className="w-full rounded-3xl border-gray-200 focus:border-brand-blue focus:ring focus:ring-brand-blue/10 bg-gray-50/50 p-6 transition-all"
                                    placeholder="Detailed message for all students..."
                                />
                                {errors.content && <div className="text-red-500 text-xs mt-1 font-bold">{errors.content}</div>}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-10 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-blue/90 transition-all shadow-xl shadow-brand-blue/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {processing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-broadcast-tower"></i>}
                                    Broadcast to Students
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Existing Notifications List */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                <i className="fas fa-history text-gray-400"></i>
                                Recent Broadcasts
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                Auto-deleted after 10 days
                            </span>
                        </div>

                        <div className="space-y-4">
                            {notifications.data.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 font-medium italic bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                                    No active notifications found.
                                </div>
                            ) : (
                                notifications.data.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-6 rounded-3xl border flex items-start justify-between gap-6 transition-all hover:shadow-md ${
                                            notification.type === 'danger' ? 'bg-red-50 border-red-100' :
                                            notification.type === 'warning' ? 'bg-amber-50 border-amber-100' :
                                            notification.type === 'success' ? 'bg-green-50 border-green-100' :
                                            'bg-brand-blue/[0.03] border-brand-blue/10'
                                        }`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className={`font-black text-base uppercase tracking-tight ${
                                                    notification.type === 'danger' ? 'text-red-900' :
                                                    notification.type === 'warning' ? 'text-amber-900' :
                                                    notification.type === 'success' ? 'text-green-900' :
                                                    'text-brand-blue'
                                                }`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[10px] font-bold text-gray-400">• By {notification.user?.name || 'System'}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed mb-4">{notification.content}</p>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                                    <i className="fas fa-clock"></i> Sent {new Date(notification.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1">
                                                    <i className="fas fa-hourglass-end"></i> Expires {new Date(notification.expires_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={route('admin.notifications.delete', notification.id)}
                                            method="delete"
                                            as="button"
                                            className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 flex items-center justify-center transition-all shadow-sm active:scale-95"
                                        >
                                            <i className="fas fa-trash-alt text-xs"></i>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Simple Pagination can be added here if needed */}
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
