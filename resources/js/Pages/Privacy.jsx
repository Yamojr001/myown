import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function Privacy() {
    return (
        <GuestLayout>
            <Head title="Privacy Policy" />

            <div className="prose prose-sm sm:prose max-w-none text-brand-dark">
                <h1 className="text-2xl font-black mb-6 text-brand-dark border-b pb-4">Privacy Policy</h1>

                <p className="mb-4">
                    <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                </p>

                <p>
                    At Phronix AI, accessible from our platform, one of our main priorities is the privacy of our visitors and users. This Privacy Policy document contains types of information that is collected and recorded by Phronix AI and how we use it.
                </p>

                <h2 className="text-brand-blue mt-6 font-bold">1. Information We Collect</h2>
                <p>
                    The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information. When you register for an Account, we may ask for your contact information, including items such as name, email address, and educational preferences.
                </p>

                <h2 className="text-brand-blue mt-6 font-bold">2. Uploaded Course Materials</h2>
                <p>
                    Any course files (PDFs, Images, PPTs) you upload are processed by our system strictly for the purpose of generating your educational reading plans, topics, and tests. We do not sell or distribute these files to third parties. They are stored securely and used solely to power the AI features of your account.
                </p>

                <h2 className="text-brand-blue mt-6 font-bold">3. How We Use Your Information</h2>
                <p>
                    We use the information we collect in various ways, including to:
                </p>
                <ul className="list-disc pl-5 mb-4">
                    <li>Provide, operate, and maintain our website</li>
                    <li>Improve, personalize, and expand our website</li>
                    <li>Understand and analyze how you use our website</li>
                    <li>Develop new products, services, features, and functionality</li>
                    <li>Send you emails relating to your account (e.g. Smart Reminders)</li>
                </ul>

                <h2 className="text-brand-blue mt-6 font-bold">4. Security of Your Information</h2>
                <p>
                    We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                <a href={route('register')} className="text-brand-blue font-bold hover:underline">Return to registration</a>
            </div>
        </GuestLayout>
    );
}
