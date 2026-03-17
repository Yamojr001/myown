import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

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
