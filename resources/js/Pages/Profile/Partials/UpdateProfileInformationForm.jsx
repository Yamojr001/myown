import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const [avatarPreview, setAvatarPreview] = useState(
        user.avatar ? `/storage/${user.avatar}` : null
    );
    const fileInputRef = useRef(null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            school: user.school || '',
            department: user.department || '',
            level: user.level || '',
            avatar: null,
            _method: 'patch', // Override method for Laravel to handle file uploads properly
        });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        // Send a POST request because we are uploading a file
        post(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                    Profile Information
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    Update your account's profile information, avatar, and academic details.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6" encType="multipart/form-data">

                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-brand-light flex items-center justify-center">
                                <i className="fas fa-user text-3xl text-brand-blue"></i>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center hover:bg-black/70 transition"
                        >
                            Upload
                        </button>
                    </div>

                    <div className="flex-1">
                        <InputLabel value="Profile Picture" />
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size of 2MB.</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                        <InputError className="mt-2" message={errors.avatar} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <InputLabel htmlFor="name" value="Full Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full bg-gray-50 border-gray-200 focus:bg-white"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    {/* Email */}
                    <div>
                        <InputLabel htmlFor="email" value="Email Address" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full bg-gray-50 border-gray-200 focus:bg-white"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    {/* School */}
                    <div>
                        <InputLabel htmlFor="school" value="School / University" />
                        <TextInput
                            id="school"
                            className="mt-1 block w-full bg-gray-50 border-gray-200 focus:bg-white"
                            value={data.school}
                            onChange={(e) => setData('school', e.target.value)}
                            placeholder="e.g. University of Example"
                        />
                        <InputError className="mt-2" message={errors.school} />
                    </div>

                    {/* Department */}
                    <div>
                        <InputLabel htmlFor="department" value="Department" />
                        <TextInput
                            id="department"
                            className="mt-1 block w-full bg-gray-50 border-gray-200 focus:bg-white"
                            value={data.department}
                            onChange={(e) => setData('department', e.target.value)}
                            placeholder="e.g. Computer Science"
                        />
                        <InputError className="mt-2" message={errors.department} />
                    </div>

                    {/* Level */}
                    <div>
                        <InputLabel htmlFor="level" value="Current Level" />
                        <TextInput
                            id="level"
                            className="mt-1 block w-full bg-gray-50 border-gray-200 focus:bg-white"
                            value={data.level}
                            onChange={(e) => setData('level', e.target.value)}
                            placeholder="e.g. Year 2 / 200L"
                        />
                        <InputError className="mt-2" message={errors.level} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-yellow-800 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-2 font-bold underline hover:text-yellow-900 focus:outline-none"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <PrimaryButton className="bg-brand-blue hover:bg-blue-700" disabled={processing}>
                        <i className="fas fa-save mr-2"></i> Save Changes
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-2"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in-out duration-300"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-2"
                    >
                        <p className="text-sm text-green-600 font-medium flex items-center">
                            <i className="fas fa-check-circle mr-1"></i> Saved successfully.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
