import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function Terms() {
    return (
        <GuestLayout>
            <Head title="Terms and Conditions" />

            <div className="prose prose-sm sm:prose max-w-none text-brand-dark">
                <h1 className="text-2xl font-black mb-6 text-brand-dark border-b pb-4">Terms and Conditions</h1>

                <p className="mb-4">
                    <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                </p>

                <h2 className="text-brand-blue mt-6 font-bold">1. Agreement to Terms</h2>
                <p>
                    By accessing or using the Phronix AI platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service.
                </p>

                <h2 className="text-brand-blue mt-6 font-bold">2. Intellectual Property</h2>
                <p>
                    The platform and its original content, features, and functionality are owned by Phronix AI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. AI-generated study materials are provided for personal educational use only.
                </p>

                <h2 className="text-brand-blue mt-6 font-bold">3. User Accounts</h2>
                <p>
                    When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                </p>

                <h2 className="text-brand-blue mt-6 font-bold">4. Acceptable Use</h2>
                <p>
                    You agree not to use the platform to generate misleading content, attempt to bypass access controls, or distribute malware. The syllabus files you upload must be materials you have the legal right to access and use for personal study.
                </p>

                <h2 className="text-brand-blue mt-6 font-bold">5. Limitation of Liability</h2>
                <p>
                    In no event shall Phronix AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                <a href={route('register')} className="text-brand-blue font-bold hover:underline">Return to registration</a>
            </div>
        </GuestLayout>
    );
}
