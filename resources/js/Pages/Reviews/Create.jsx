import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        message: '',
        type: 'suggestion',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('reviews.store'), {
            onSuccess: () => reset('message'),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-brand-text leading-tight">Reviews & Suggestions</h2>}
        >
            <Head title="Send Feedback" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl border border-gray-100 p-8 md:p-12">
                        <div className="mb-10 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-blue/10 rounded-2xl mb-4 text-brand-blue text-3xl">
                                <i className="fas fa-comment-dots"></i>
                            </div>
                            <h1 className="text-3xl font-black text-brand-dark tracking-tight">We value your feedback!</h1>
                            <p className="text-gray-500 mt-2">Found a bug? Have a suggestion? Or just want to say hi? We're listening.</p>
                        </div>

                        {recentlySuccessful && (
                            <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2 duration-500">
                                <i className="fas fa-check-circle mr-3 text-xl"></i>
                                <span className="font-bold">Thank you! Your feedback has been sent successfully.</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-8">
                            <div>
                                <label className="block text-sm font-black text-brand-dark uppercase tracking-widest mb-3">Feedback Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setData('type', 'suggestion')}
                                        className={`py-4 px-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${data.type === 'suggestion' ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        <i className="fas fa-lightbulb text-xl"></i>
                                        <span className="font-bold">Suggestion</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('type', 'review')}
                                        className={`py-4 px-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${data.type === 'review' ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        <i className="fas fa-star text-xl"></i>
                                        <span className="font-bold">Review / Bug</span>
                                    </button>
                                </div>
                                <InputError message={errors.type} className="mt-2" />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-black text-brand-dark uppercase tracking-widest mb-3">Your Message</label>
                                <textarea
                                    id="message"
                                    className="w-full rounded-2xl border-gray-100 bg-gray-50 p-6 text-gray-800 focus:border-brand-blue focus:ring focus:ring-brand-blue/10 transition-all font-medium"
                                    rows="6"
                                    placeholder="Write your feedback here... (Minimum 10 characters)"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    required
                                />
                                <InputError message={errors.message} className="mt-2" />
                            </div>

                            <div className="pt-4">
                                <PrimaryButton
                                    className="w-full bg-brand-blue hover:bg-blue-700 py-4 rounded-2xl shadow-xl transition-transform active:scale-95 flex justify-center text-lg font-black uppercase tracking-widest"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <><i className="fas fa-spinner fa-spin mr-3"></i> Sending...</>
                                    ) : (
                                        <><i className="fas fa-paper-plane mr-3"></i> Send Feedback</>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
