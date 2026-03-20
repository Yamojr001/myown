import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>
 
                <div className="mt-4">
                    <InputLabel htmlFor="phone_number" value="Phone Number (WhatsApp preferred)" />
 
                    <TextInput
                        id="phone_number"
                        type="tel"
                        name="phone_number"
                        value={data.phone_number}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20"
                        autoComplete="tel"
                        onChange={(e) => setData('phone_number', e.target.value)}
                    />
 
                    <InputError message={errors.phone_number} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-start">
                        <input
                            type="checkbox"
                            name="terms"
                            checked={data.terms}
                            onChange={(e) => setData('terms', e.target.checked)}
                            className="mt-1 rounded border-gray-300 text-brand-blue shadow-sm focus:ring-brand-blue/20"
                            required
                        />
                        <span className="ms-2 text-sm text-brand-secondary">
                            I agree to the <Link href={route('terms')} className="text-brand-blue hover:underline font-semibold" target="_blank">Terms and Conditions</Link> and <Link href={route('privacy')} className="font-semibold text-brand-blue hover:underline" target="_blank">Privacy Policy</Link>
                        </span>
                    </label>
                    <InputError message={errors.terms} className="mt-2" />
                </div>

                <div className="mt-6 flex flex-col items-center justify-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1"
                    >
                        Create Account
                    </button>

                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-brand-secondary hover:text-brand-blue focus:outline-none"
                    >
                        Already registered? Log in here
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
