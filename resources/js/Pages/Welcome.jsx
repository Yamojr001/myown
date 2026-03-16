import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

// Reusable Button Component
const Button = ({ href, children, className }) => (
    <Link href={href} className={`inline-block px-8 py-4 rounded-2xl font-semibold transition-transform duration-300 ${className}`}>
        {children}
    </Link>
);

// Feature Card Component
const FeatureCard = ({ icon, title, text, pro = false, freeText = null }) => (
    <div className={`p-8 bg-brand-white rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative border ${pro ? 'border-brand-orange border-t-4' : 'border-gray-100'} group`}>
        {pro && <span className="absolute top-4 right-4 bg-brand-orange/15 text-brand-orange text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">PRO ONLY</span>}
        {freeText && <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">{freeText}</span>}
        <div className={`flex items-center justify-center w-16 h-16 mb-5 rounded-xl text-2xl transition-colors duration-300 ${pro ? 'bg-brand-orange text-white' : 'bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white'}`}>
            <i className={`fas ${icon}`}></i>
        </div>
        <h3 className="text-xl font-extrabold text-brand-dark mb-3">{title}</h3>
        <p className="text-brand-secondary font-medium leading-relaxed">{text}</p>
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
                <section className="relative pt-32 pb-24 overflow-hidden bg-brand-dark">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[70%] rounded-full bg-brand-blue/20 blur-[120px]"></div>
                        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] rounded-full bg-brand-orange/20 blur-[100px]"></div>
                    </div>

                    <div className="container mx-auto px-6 text-center relative z-10">
                        <span className="inline-block bg-brand-orange/20 text-brand-orange border border-brand-orange/30 px-5 py-2 rounded-full font-bold text-sm mb-6 tracking-wide shadow-lg">🚀 The Ultimate AI-Powered Study Architect</span>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">Master Your Syllabus with <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-yellow-400">Precision AI</span></h1>
                        <p className="max-w-3xl mx-auto text-xl text-gray-300 mb-10 font-light leading-relaxed">Upload any course material and let our AI generate a perfectly optimized reading plan, diagnostic tests, and an adaptive weekly timetable tailored to your weak spots.</p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Button href={route('register')} className="bg-brand-orange text-white hover:bg-orange-600 shadow-xl shadow-brand-orange/30 w-full sm:w-auto text-lg">Start for Free Today <i className="fas fa-arrow-right ml-2"></i></Button>
                            <Button href="#pricing" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-md w-full sm:w-auto text-lg border border-white/20">View Pricing Plans</Button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-brand-light relative z-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-4xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-brand-dark">Everything You Need to <span className="text-brand-blue">Excel</span></h2>
                            <p className="text-xl text-brand-secondary mt-6 font-medium">Powered by ultra-fast Gemini 2.5 AI that reads your syllabus and builds an actionable, week-by-week success plan.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard icon="fa-book" title="AI Reading Plans" text="Upload your PDFs to instantly generate beautiful, week-by-week reading checklists and summaries." freeText="Free Tier Included" />
                            <FeatureCard icon="fa-layer-group" title="5 Course Limit" text="Start your semester strong by organizing up to 5 complete courses totally for free." freeText="Free Tier Included" />
                            <FeatureCard icon="fa-microscope" title="Text-Only Extraction" text="Upload standard Text, PPT, and Word files and our algorithm will instantly parse your topics." freeText="Free Tier Included" />

                            {/* Pro Features */}
                            <FeatureCard icon="fa-robot" title="AI Image & PPT Vision" text="Upload complex PowerPoints, Images, and scanned PDFs. Our Gemini Vision AI will accurately read them." pro />
                            <FeatureCard icon="fa-calendar-day" title="Adaptive Timetables" text="Generate a Master Grid Schedule that automatically prioritizes courses you score low in and re-balances hours." pro />
                            <FeatureCard icon="fa-infinity" title="Unlimited Courses" text="Never worry about caps. Manage your entire degree program across all semesters simultaneously." pro />
                            <FeatureCard icon="fa-chart-pie" title="Pre-Tests & Analytics" text="Take auto-generated diagnostic tests before reading to let the AI pinpoint exactly what topics you need to focus on." pro />
                            <FeatureCard icon="fa-volume-up" title="Read Aloud Audio" text="Tired of reading? Hit play and let our seamless narrator read your course plans to you loop-by-loop." pro />
                            <FeatureCard icon="fa-file-export" title="Printable Exports" text="Download your finalized Master Timetables and Reading Plans as stunning, printable PDF documents." pro />
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

                {/* Pricing / CTA Section */}
                <section id="pricing" className="py-24 bg-brand-blue relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0">
                        <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[80%] rounded-full bg-brand-orange/30 blur-[130px]"></div>
                    </div>
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white">Upgrade to Limitless Learning</h2>
                        <p className="text-xl text-blue-100 mt-6 mb-12 max-w-2xl mx-auto font-medium">Join thousands of students who are already achieving top decile grades with the full power of PrepAI Adaptive Timetables and Vision Analysis.</p>

                        <div className="flex flex-col md:flex-row justify-center w-full max-w-5xl mx-auto gap-8 text-left">

                            {/* Free Tier */}
                            <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl transition-transform hover:-translate-y-2">
                                <h3 className="text-3xl font-bold text-white mb-2">Basic Plan</h3>
                                <p className="text-blue-200 mb-6 text-lg">Perfect to get started</p>
                                <div className="text-5xl font-black text-white mb-8">$0<span className="text-xl font-normal text-blue-200">/forever</span></div>
                                <ul className="space-y-4 mb-10 text-white">
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Up to 5 Courses</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Standard Text/PDF Extraction</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> AI Reading Summaries</li>
                                    <li className="flex items-center gap-3 opacity-50"><i className="fas fa-times text-red-400"></i> <strike>No AI Timetable Generation</strike></li>
                                    <li className="flex items-center gap-3 opacity-50"><i className="fas fa-times text-red-400"></i> <strike>No Image/PPT AI Vision</strike></li>
                                </ul>
                                <Button href={route('register')} className="w-full bg-white text-brand-blue hover:bg-gray-100 shadow-lg text-center justify-center">Sign Up Free</Button>
                            </div>

                            {/* Pro Tier */}
                            <div className="flex-1 bg-white rounded-3xl p-10 shadow-2xl scale-105 border-4 border-brand-orange relative transition-transform hover:-translate-y-2">
                                <div className="absolute top-0 right-10 transform -translate-y-1/2 bg-brand-orange text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg uppercase tracking-wide">Most Popular</div>
                                <h3 className="text-3xl font-bold text-brand-dark mb-2">Pro Scholar</h3>
                                <p className="text-brand-secondary mb-6 text-lg">Everything you need to master exams</p>
                                <div className="text-5xl font-black text-brand-dark mb-8">$9<span className="text-xl font-normal text-brand-secondary">/mo</span></div>
                                <ul className="space-y-4 mb-10 text-brand-dark font-medium">
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-orange"></i> <b>Unlimited</b> Courses</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-orange"></i> <b>Gemini Vision</b> Image & PPT Parse</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-orange"></i> <b>Adaptive Timetable Generation</b></li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-orange"></i> <b>Diagnostic Pre-Testing</b></li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-orange"></i> PDF Export & Read Aloud Audio</li>
                                </ul>
                                <Button href={route('register')} className="w-full bg-brand-orange text-white hover:bg-orange-600 shadow-xl shadow-brand-orange/30 text-center justify-center">Start Pro Trial</Button>
                            </div>

                        </div>
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