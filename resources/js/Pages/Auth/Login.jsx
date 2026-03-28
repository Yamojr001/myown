import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path fill="#EA4335" d="M12 10.2v4.22h5.88c-.26 1.36-1.03 2.51-2.2 3.28l3.56 2.76c2.07-1.91 3.26-4.72 3.26-8.06 0-.78-.07-1.53-.2-2.25H12z" />
        <path fill="#34A853" d="M12 22c2.97 0 5.45-.98 7.27-2.66l-3.56-2.76c-.98.66-2.25 1.05-3.71 1.05-2.86 0-5.28-1.93-6.15-4.52l-3.68 2.85C3.97 19.56 7.66 22 12 22z" />
        <path fill="#4A90E2" d="M5.85 13.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11l-3.68-2.85C1.42 7.53 1 9.21 1 11s.42 3.47 1.17 4.96l3.68-2.85z" />
        <path fill="#FBBC05" d="M12 4.37c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 1.09 14.97 0 12 0 7.66 0 3.97 2.44 2.17 6.04l3.68 2.85C6.72 6.3 9.14 4.37 12 4.37z" />
    </svg>
);

const MicrosoftIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <rect x="2" y="2" width="9" height="9" fill="#F25022" />
        <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
        <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
        <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
);

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {errors.oauth && (
                <div className="mb-4 text-sm font-medium text-red-600">
                    {errors.oauth}
                </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                    href={route('oauth.redirect', { provider: 'google' })}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-blue hover:text-brand-blue"
                >
                    <GoogleIcon />
                    Continue with Google
                </a>
                <a
                    href={route('oauth.redirect', { provider: 'microsoft' })}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-blue hover:text-brand-blue"
                >
                    <MicrosoftIcon />
                    Continue with Microsoft
                </a>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300 text-brand-blue shadow-sm focus:ring-brand-blue/20"
                        />
                        <span className="ms-2 text-sm text-brand-secondary">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-6 flex flex-col items-center justify-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1"
                    >
                        Log in
                    </button>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-brand-secondary hover:text-brand-blue focus:outline-none"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </div>
            </form>
        </GuestLayout>
    );
}
