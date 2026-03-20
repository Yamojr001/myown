import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, reviews }) {
    const [selectedReview, setSelectedReview] = useState(null);

    const markAsRead = (id) => {
        router.post(route('admin.reviews.read', id));
    };

    const deleteReview = (id) => {
        if (confirm('Are you sure you want to delete this feedback?')) {
            router.delete(route('admin.reviews.delete', id));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">User Feedback & Suggestions</h2>}
            isAdmin={true}
        >
            <Head title="User Feedback" />

            <div className="py-12 bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase">User Voice</h1>
                            <p className="text-gray-400 mt-1">Read and manage suggestions and reviews from users.</p>
                        </div>
                        <div className="bg-brand-blue/10 px-4 py-2 rounded-xl border border-brand-blue/20">
                            <span className="text-brand-blue font-bold">{reviews.length} Total Messages</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* List Area */}
                        <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div 
                                        key={review.id}
                                        onClick={() => setSelectedReview(review)}
                                        className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedReview?.id === review.id ? 'bg-brand-blue border-brand-blue' : 'bg-gray-800 border-gray-800 hover:border-gray-700'} ${!review.is_read ? 'ring-2 ring-brand-blue/50' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${review.type === 'suggestion' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                                {review.type}
                                            </span>
                                            {!review.is_read && <span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse"></span>}
                                        </div>
                                        <h4 className={`font-bold truncate ${selectedReview?.id === review.id ? 'text-white' : 'text-gray-200'}`}>
                                            {review.user?.name || 'Unknown User'}
                                        </h4>
                                        <p className={`text-xs mt-1 line-clamp-2 ${selectedReview?.id === review.id ? 'text-white/80' : 'text-gray-400'}`}>
                                            {review.message}
                                        </p>
                                        <div className={`text-[10px] mt-3 font-medium ${selectedReview?.id === review.id ? 'text-white/60' : 'text-gray-500'}`}>
                                            {formatDate(review.created_at)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700">
                                    <i className="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
                                    <p className="text-gray-500 font-bold">Inbox is empty</p>
                                </div>
                            )}
                        </div>

                        {/* Detail Area */}
                        <div className="lg:col-span-2">
                            {selectedReview ? (
                                <div className="bg-gray-800 rounded-3xl border border-gray-700 p-8 md:p-12 shadow-2xl animate-in fade-in duration-500 min-h-[500px] flex flex-col">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-gray-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                                                {review.user?.name ? review.user.name[0].toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-white leading-none">{selectedReview.user?.name}</h2>
                                                <p className="text-gray-400 text-sm mt-1">{selectedReview.user?.email}</p>
                                                <p className="text-brand-blue text-xs font-bold mt-1 uppercase tracking-tighter italic">User Phone: {selectedReview.user?.phone_number || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!selectedReview.is_read && (
                                                <button 
                                                    onClick={() => markAsRead(selectedReview.id)}
                                                    className="bg-brand-blue hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition"
                                                >
                                                    Mark Read
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deleteReview(selectedReview.id)}
                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-3 rounded-xl font-bold text-sm transition border border-red-500/20"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="inline-flex items-center px-3 py-1 bg-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-blue mb-6">
                                            {selectedReview.type}
                                        </div>
                                        <div className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                            {selectedReview.message}
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-gray-700 text-sm text-gray-500 flex justify-between items-center">
                                        <span>Sent on {formatDate(selectedReview.created_at)}</span>
                                        <span className="bg-gray-700 px-3 py-1 rounded-lg text-xs font-mono">{selectedReview.id}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-800 rounded-3xl border border-gray-700 border-dashed p-20 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-gray-500 text-3xl mb-6">
                                        <i className="fas fa-mouse-pointer"></i>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tighter">No Feedback Selected</h3>
                                    <p className="text-gray-500 max-w-xs mt-2 font-medium">Click on a message from the list to view its contents and user details.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
