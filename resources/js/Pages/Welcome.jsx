import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

// Reusable Button Component
const Button = ({ href, children, className }) => (
    <Link href={href} className={`inline-block px-8 py-4 rounded-2xl font-semibold transition-transform duration-300 ${className}`}>
        {children}
    </Link>
);

// Feature Card Component
const FeatureCard = ({ icon, title, text, pro = false }) => (
    <div className={`p-8 bg-brand-white rounded-2xl shadow-lg transition-transform duration-300 hover:-translate-y-2 relative ${pro ? 'border-t-4 border-brand-orange' : ''}`}>
        {pro && <span className="absolute top-4 right-4 bg-brand-orange/10 text-brand-orange text-xs font-bold px-3 py-1 rounded-full">PRO</span>}
        <div className="flex items-center justify-center w-16 h-16 mb-5 bg-brand-light rounded-xl text-brand-dark text-2xl">
            <i className={`fas ${icon}`}></i>
        </div>
        <h3 className="text-xl font-bold text-brand-dark mb-3">{title}</h3>
        <p className="text-brand-secondary">{text}</p>
    </div>
);

// FAQ Item Component
const FaqItem = ({ question, answer, isActive, onClick }) => (
    <div className="border-b border-gray-200">
        <button onClick={onClick} className="flex justify-between items-center w-full py-5 text-left font-semibold text-brand-dark">
            <span>{question}</span>
            <i className={`fas fa-chevron-down transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}></i>
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <p className="pb-5 text-brand-secondary">{answer}</p>
            </div>
        </div>
    </div>
);

export default function Welcome({ auth }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleFaqClick = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const navLinks = [
        { href: '#features', label: 'Features' },
        { href: '#how-it-works', label: 'How It Works' },
        { href: '#pricing', label: 'Pricing' },
    ];

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-brand-white text-brand-text">
                {/* Header */}
                <header className={`fixed top-0 left-0 w-full z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-lg bg-white/80 backdrop-blur-lg' : 'bg-transparent'}`}>
                    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-brand-dark flex items-center gap-2">
                            <i className="fas fa-brain text-brand-orange"></i> PrepAI
                        </Link>
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map(link => <a key={link.href} href={link.href} className="font-semibold hover:text-brand-orange transition-colors">{link.label}</a>)}
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            {auth.user ? (
                                <Button href={route('dashboard')} className="bg-brand-orange text-white hover:shadow-lg">Dashboard</Button>
                            ) : (
                                <>
                                    <Button href={route('login')} className="bg-transparent text-brand-dark hover:bg-gray-100">Login</Button>
                                    <Button href={route('register')} className="bg-brand-orange text-white hover:shadow-lg">Get Started</Button>
                                </>
                            )}
                        </div>
                        <button className="md:hidden text-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <i className="fas fa-bars"></i>
                        </button>
                    </nav>
                </header>

                {/* Mobile Menu */}
                <div className={`fixed top-0 left-0 w-full h-full bg-white z-40 p-6 transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex justify-end mb-8">
                        <button className="text-2xl" onClick={() => setIsMobileMenuOpen(false)}><i className="fas fa-times"></i></button>
                    </div>
                    <div className="flex flex-col items-center gap-6">
                        {navLinks.map(link => <a key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="font-semibold text-xl">{link.label}</a>)}
                        <hr className="w-full my-4" />
                        {auth.user ? (
                            <Button href={route('dashboard')} className="bg-brand-orange text-white w-full text-center justify-center">Dashboard</Button>
                        ) : (
                            <>
                                <Button href={route('login')} className="bg-gray-100 text-brand-dark w-full text-center justify-center">Login</Button>
                                <Button href={route('register')} className="bg-brand-orange text-white w-full text-center justify-center">Get Started</Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Hero Section */}
                <section className="bg-brand-light pt-32 pb-20">
                    <div className="container mx-auto px-6 text-center">
                        <span className="inline-block bg-brand-orange/10 text-brand-orange px-4 py-2 rounded-full font-semibold text-sm mb-4">🚀 AI-Powered Learning Platform</span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark mb-6">From Syllabus to Success in <br /><span className="text-brand-orange">One Platform</span></h1>
                        <p className="max-w-3xl mx-auto text-lg text-brand-secondary mb-8">Transform your course materials into personalized AI study plans. Get adaptive timetables, smart assessments, and real-time progress tracking.</p>
                        <div className="flex justify-center gap-4">
                            <Button href={route('register')} className="bg-brand-orange text-white hover:shadow-lg">Start Free Trial <i className="fas fa-arrow-right"></i></Button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Everything You Need to <span className="text-brand-orange">Excel</span></h2>
                            <p className="text-lg text-brand-secondary mt-4">Powered by advanced AI that understands your learning patterns and adapts to your needs.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard icon="fa-robot" title="AI-Powered Pre-Tests" text="Upload your PDF and get instant diagnostic tests that pinpoint exactly where you need to focus." pro />
                            <FeatureCard icon="fa-calendar-alt" title="Adaptive Timetables" text="Smart weekly schedules that automatically adjust based on your progress and weak areas." pro />
                            <FeatureCard icon="fa-file-alt" title="AI Reading Summaries" text="Get concise, AI-generated summaries of your course materials with key concepts highlighted." />
                            <FeatureCard icon="fa-chart-bar" title="Progress Analytics" text="Detailed performance tracking with visual reports showing your improvement over time." />
                            <FeatureCard icon="fa-download" title="PDF Export" text="Download your study guides, summaries, and progress reports as professional PDF documents." pro />
                            <FeatureCard icon="fa-bell" title="Smart Reminders" text="Email and push notifications to keep you on track with your study schedule and upcoming tests." pro />
                        </div>
                    </div>
                </section>
                
                {/* How It Works */}
                <section id="how-it-works" className="py-20 bg-brand-light">
                     <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Path to Excellence in <span className="text-brand-orange">4 Simple Steps</span></h2>
                            <p className="text-lg text-brand-secondary mt-4">From course upload to exam success - we've streamlined the entire learning process.</p>
                        </div>
                        {/* Steps can be added here if desired */}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Frequently Asked <span className="text-brand-orange">Questions</span></h2>
                        </div>
                        <FaqItem question="How does the AI generate study plans?" answer="Our AI analyzes your course materials to identify key topics. After you complete the diagnostic test, it assesses your strengths and weaknesses to create a personalized study timetable." isActive={activeFaq === 0} onClick={() => handleFaqClick(0)} />
                        <FaqItem question="What file formats are supported?" answer="We currently support PDF documents for course syllabi and lecture notes." isActive={activeFaq === 1} onClick={() => handleFaqClick(1)} />
                        <FaqItem question="Can I use PrepAI for multiple courses?" answer="Yes! The Free plan allows up to 5 courses, while the Pro plan offers unlimited course management." isActive={activeFaq === 2} onClick={() => handleFaqClick(2)} />
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-brand-dark">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Transform Your Study Experience?</h2>
                        <p className="text-lg text-brand-secondary mt-4 mb-8 max-w-2xl mx-auto">Join thousands of students who are already achieving academic excellence with PrepAI. Start your journey today!</p>
                        <Button href={route('register')} className="bg-brand-orange text-white hover:shadow-lg">Start My Free Trial</Button>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-brand-dark text-brand-secondary pt-20">
                    <div className="container mx-auto px-6 pb-8">
                         <div className="text-center">
                            <Link href="/" className="text-2xl font-bold text-white flex items-center justify-center gap-2 mb-4">
                                <i className="fas fa-brain text-brand-orange"></i> PrepAI
                            </Link>
                            <p className="max-w-md mx-auto mb-6">Your personal AI study architect, designed for academic excellence.</p>
                            <div className="flex justify-center gap-6 mb-8">
                                <a href="#" className="hover:text-brand-orange"><i className="fab fa-twitter"></i></a>
                                <a href="#" className="hover:text-brand-orange"><i className="fab fa-facebook-f"></i></a>
                                <a href="#" className="hover:text-brand-orange"><i className="fab fa-instagram"></i></a>
                            </div>
                        </div>
                        <div className="border-t border-gray-700 pt-8 text-center text-sm">
                            <p>&copy; {new Date().getFullYear()} PrepAI. All Rights Reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}