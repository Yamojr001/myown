import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import WhatsAppFloatingButton from '@/Components/WhatsAppFloatingButton';

// Reusable Button Component
const Button = ({ href, children, className }) => (
    <Link href={href} className={`inline-block px-8 py-4 rounded-2xl font-semibold transition-transform duration-300 ${className}`}>
        {children}
    </Link>
);

// Feature Card Component
const FeatureCard = ({ icon, title, text, pro = false, freeText = null }) => (
    <div className={`p-8 bg-brand-white rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative border ${pro ? 'border-brand-blue border-t-4' : 'border-gray-100'} group`}>
        {pro && <span className="absolute top-4 right-4 bg-brand-blue/15 text-brand-blue text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">PRO ONLY</span>}
        {freeText && <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">{freeText}</span>}
        <div className={`flex items-center justify-center w-16 h-16 mb-5 rounded-xl text-2xl transition-colors duration-300 ${pro ? 'bg-brand-blue text-white' : 'bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white'}`}>
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

// Typing Effect Component
const TypingEffect = ({ words, speed = 150, delay = 2000 }) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);

    useEffect(() => {
        if (index === words.length) return;

        if (subIndex === words[index].length + 1 && !reverse) {
            setTimeout(() => setReverse(true), delay);
            return;
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, speed);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words, speed, delay]);

    return (
        <span className="text-brand-blue border-r-4 border-brand-blue animate-pulse">
            {words[index].substring(0, subIndex)}
        </span>
    );
};

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

    const typingWords = ["Syllabus", "Lecture Notes", "PowerPoints", "Textbooks", "Exam Goals"];

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-brand-white text-brand-text font-inter">
                {/* Header */}
                <header className="fixed top-0 left-0 w-full z-50 transition-shadow duration-300 shadow-md bg-white">
                    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-brand-dark flex items-center gap-2">
                            <i className="fas fa-brain text-brand-blue"></i> Phronix AI
                        </Link>
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map(link => <a key={link.href} href={link.href} className="font-semibold text-brand-dark hover:text-brand-blue transition-colors">{link.label}</a>)}
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <a href="https://whatsapp.com/channel/0029Vb7jHBj8F2pE6Vzb961R" target="_blank" className="font-bold text-brand-blue hover:text-blue-700 flex items-center gap-2 mr-4 text-sm">
                                <i className="fab fa-whatsapp"></i> Join Channel
                            </a>
                            {auth.user ? (
                                <Button href={route('dashboard')} className="bg-brand-blue text-white hover:shadow-lg text-sm px-6">Dashboard</Button>
                            ) : (
                                <>
                                    <Button href={route('login')} className="bg-transparent text-brand-dark hover:bg-gray-100 text-sm px-6">Login</Button>
                                    <Button href={route('register')} className="bg-brand-blue text-white hover:shadow-lg text-sm px-6">Get Started</Button>
                                </>
                            )}
                        </div>
                        <button className="md:hidden text-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <i className="fas fa-bars"></i>
                        </button>
                    </nav>
                </header>

                {/* Mobile Menu */}
                <div className={`fixed top-0 left-0 w-full h-full bg-white z-[60] p-6 transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex justify-between items-center mb-8">
                        <Link href="/" className="text-xl font-bold text-brand-dark flex items-center gap-2">
                            <i className="fas fa-brain text-brand-blue"></i> Phronix AI
                        </Link>
                        <button className="text-2xl" onClick={() => setIsMobileMenuOpen(false)}><i className="fas fa-times"></i></button>
                    </div>
                    <div className="flex flex-col items-center gap-6">
                        {navLinks.map(link => <a key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="font-semibold text-xl">{link.label}</a>)}
                        <a href="https://whatsapp.com/channel/0029Vb7jHBj8F2pE6Vzb961R" target="_blank" className="font-bold text-brand-blue text-xl flex items-center gap-2">
                            <i className="fab fa-whatsapp text-2xl"></i> Join WhatsApp Channel
                        </a>
                        <hr className="w-full my-4" />
                        {auth.user ? (
                            <Button href={route('dashboard')} className="bg-brand-blue text-white w-full text-center justify-center">Dashboard</Button>
                        ) : (
                            <>
                                <Button href={route('login')} className="bg-gray-100 text-brand-dark w-full text-center justify-center">Login</Button>
                                <Button href={route('register')} className="bg-brand-blue text-white w-full text-center justify-center">Get Started</Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Hero Section */}
                <section className="relative pt-48 pb-24 overflow-hidden bg-white">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[70%] rounded-full bg-brand-blue/10 blur-[120px]"></div>
                        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] rounded-full bg-brand-blue/10 blur-[100px]"></div>
                    </div>

                    <div className="container mx-auto px-6 text-center relative z-10">
                        <span className="inline-block bg-brand-blue/10 text-brand-blue border border-brand-blue/20 px-5 py-2 rounded-full font-bold text-xs mb-8 tracking-widest shadow-sm uppercase">🚀 The Ultimate AI-Powered Study Architect</span>
                        <h1 className="text-5xl md:text-8xl font-black text-brand-dark mb-8 leading-tight tracking-tighter">
                            Master Your <br />
                            <TypingEffect words={typingWords} />
                        </h1>
                        <p className="max-w-3xl mx-auto text-xl text-brand-secondary mb-12 font-medium leading-relaxed">
                            Upload any course material and let our AI generate a perfectly optimized reading plan, diagnostic tests, and an adaptive weekly timetable tailored to your academic excellence.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                            <Button href={route('register')} className="bg-brand-blue text-white hover:bg-blue-700 shadow-2xl shadow-brand-blue/30 w-full sm:w-auto text-lg px-12 py-5 scale-105 active:scale-95">Start for Free Today <i className="fas fa-arrow-right ml-2 animate-bounce-x"></i></Button>
                            <a href="https://whatsapp.com/channel/0029Vb7jHBj8F2pE6Vzb961R" target="_blank" className="bg-green-500 text-white hover:bg-green-600 px-8 py-5 rounded-2xl font-bold shadow-xl shadow-green-500/20 w-full sm:w-auto text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform">
                                <i className="fab fa-whatsapp text-2xl"></i> Join Channel
                            </a>
                        </div>
                    </div>
                </section>

                {/* AI Spotlight Section */}
                <section className="py-24 bg-brand-dark relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                         <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-blue rounded-full blur-[100px]"></div>
                    </div>
                    
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="lg:w-1/2">
                                <div className="inline-flex items-center gap-2 bg-brand-blue/20 text-brand-blue px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest mb-6 border border-brand-blue/30">
                                    <i className="fas fa-bolt"></i> Powered by Phronix AI
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Your Personal <span className="text-brand-blue">AI Scholar</span> that Never Sleeps</h2>
                                <p className="text-xl text-gray-400 mb-8 leading-relaxed font-medium">
                                    Gone are the days of manual scheduling. Phronix AI leverages cutting-edge LLM technology to "understand" your notes. It parses topics, determines bulkiness, and calculates exactly how many hours you need to study to hit an A.
                                </p>
                                <ul className="space-y-4 mb-10">
                                    <li className="flex items-center gap-4 text-white font-bold">
                                        <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                                            <i className="fas fa-check"></i>
                                        </div>
                                        Instant Syllabus Decomposition
                                    </li>
                                    <li className="flex items-center gap-4 text-white font-bold">
                                        <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                                            <i className="fas fa-check"></i>
                                        </div>
                                        Weak-Spot Identification via Pre-Tests
                                    </li>
                                    <li className="flex items-center gap-4 text-white font-bold">
                                        <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                                            <i className="fas fa-check"></i>
                                        </div>
                                        Dynamic Time Allocation based on Credits
                                    </li>
                                </ul>
                            </div>
                            <div className="lg:w-1/2 relative">
                                <div className="bg-gradient-to-br from-brand-blue to-blue-800 p-1 rounded-3xl shadow-2xl relative overflow-hidden group">
                                    <div className="bg-brand-dark rounded-[22px] overflow-hidden p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                                        <div className="relative mb-8">
                                            <div className="w-32 h-32 rounded-full bg-brand-blue flex items-center justify-center text-white text-5xl animate-pulse">
                                                <i className="fas fa-robot"></i>
                                            </div>
                                            <div className="absolute -top-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-brand-dark flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter">AI Analysis System</h4>
                                        <div className="mt-6 w-full max-w-xs bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
                                            <div className="h-2 bg-brand-blue rounded-full w-[85%]"></div>
                                            <div className="h-2 bg-brand-blue/30 rounded-full w-[60%]"></div>
                                            <div className="h-2 bg-brand-blue/50 rounded-full w-[40%]"></div>
                                        </div>
                                        <p className="mt-8 text-brand-blue font-bold italic">Processing Syllabus Materials...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-brand-light relative z-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-4xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-brand-dark">Everything You Need to <span className="text-brand-blue">Excel</span></h2>
                            <p className="text-xl text-brand-secondary mt-6 font-medium">Powered by ultra-fast Advanced AI that reads your syllabus and builds an actionable, week-by-week success plan.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FeatureCard icon="fa-clock" title="Adaptive Timetabling" text="AI-generated reading schedules that sync with your personal life. Never miss a study session again." />
                            <FeatureCard icon="fa-robot" title="AI Image & PPT Vision" text="Upload complex PowerPoints, Images, and scanned PDFs. Our Advanced Vision AI will accurately read them." pro />
                            <FeatureCard icon="fa-bullseye" title="Diagnostic Testing" text="Take quick tests to identify what you actually know vs. what you need to study. No more passive reading." />
                            <FeatureCard icon="fa-chart-line" title="Progress Analytics" text="Watch your mastery grow with beautiful visualizations of your learning journey." />
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
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Path to Excellence in <span className="text-brand-blue">4 Simple Steps</span></h2>
                            <p className="text-lg text-brand-secondary mt-4">From course upload to exam success - we've streamlined the entire learning process.</p>
                        </div>
                        {/* Steps can be added here if desired */}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Frequently Asked <span className="text-brand-blue">Questions</span></h2>
                        </div>
                        <FaqItem question="How does the AI generate study plans?" answer="Our AI analyzes your course materials to identify key topics. After you complete the diagnostic test, it assesses your strengths and weaknesses to create a personalized study timetable." isActive={activeFaq === 0} onClick={() => handleFaqClick(0)} />
                        <FaqItem question="What file formats are supported?" answer="We currently support PDF documents for course syllabi and lecture notes." isActive={activeFaq === 1} onClick={() => handleFaqClick(1)} />
                        <FaqItem question="Can I use Phronix AI for multiple courses?" answer="Yes! The Free plan allows up to 5 courses, while the Pro plan offers unlimited course management." isActive={activeFaq === 2} onClick={() => handleFaqClick(2)} />
                    </div>
                </section>

                {/* Pricing / CTA Section */}
                <section id="pricing" className="py-24 bg-brand-blue relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0">
                        <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[80%] rounded-full bg-brand-blue/30 blur-[130px]"></div>
                    </div>
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white">Upgrade to Limitless Learning</h2>
                        <p className="text-xl text-blue-100 mt-6 mb-12 max-w-2xl mx-auto font-medium">Join thousands of students who are already achieving top decile grades with the full power of Phronix AI Adaptive Timetables and Vision Analysis.</p>

                        <div className="flex flex-col md:flex-row justify-center w-full max-w-6xl mx-auto gap-8 text-left">
                            {/* Free Tier */}
                            <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-xl transition-transform hover:-translate-y-1">
                                <h3 className="text-2xl font-bold text-white mb-2">Free Plan</h3>
                                <p className="text-blue-200 mb-6 text-sm">Explore Phronix AI</p>
                                <div className="text-4xl font-black text-white mb-8">N0<span className="text-lg font-normal text-blue-300">/forever</span></div>
                                <ul className="space-y-4 mb-10 text-white/90 text-sm">
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Diagnostic Testing (1 Course)</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Basic Study Recommendations</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Manual Timetable Manager</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Access to Community Channel</li>
                                </ul>
                                <Button href={route('register')} className="w-full bg-white/10 text-white border border-white/20 hover:bg-white/20 text-center justify-center">Get Started</Button>
                            </div>

                            {/* Semester Tier */}
                            <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl transition-transform hover:-translate-y-2">
                                <h3 className="text-2xl font-bold text-white mb-2">Semester Pro</h3>
                                <p className="text-blue-200 mb-6 text-sm">Perfect for one semester</p>
                                <div className="text-4xl font-black text-white mb-8">N3,000<span className="text-lg font-normal text-blue-300">/6 mo</span></div>
                                <ul className="space-y-4 mb-10 text-white text-sm">
                                    <li className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-wider text-blue-300 border-b border-white/10 pb-2">Everything in Free +</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Unlimited Courses & Architect</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Advanced Vision AI Parse</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Detailed Daily Study Plan</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Smart AI Tutor (24/7 Chat)</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Read Aloud AI Narrator</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-green-400"></i> Offline PDF Handouts</li>
                                </ul>
                                <Button href={route('register')} className="w-full bg-white text-brand-blue hover:bg-gray-100 shadow-lg text-center justify-center">Go Semester Pro</Button>
                            </div>

                            {/* Yearly Tier */}
                            <div className="flex-1 bg-white rounded-3xl p-8 shadow-2xl border-4 border-brand-blue relative transition-transform hover:-translate-y-2">
                                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-brand-blue text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg uppercase tracking-wide">Best Value</div>
                                <h3 className="text-2xl font-bold text-brand-dark mb-2">Yearly Pro</h3>
                                <p className="text-brand-secondary mb-6 text-sm">Maximum success strategy</p>
                                <div className="text-4xl font-black text-brand-dark mb-8">N5,000<span className="text-lg font-normal text-brand-secondary">/year</span></div>
                                <ul className="space-y-4 mb-10 text-brand-dark text-sm font-medium">
                                    <li className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-wider text-brand-blue border-b border-gray-100 pb-2">Everything in Semester +</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-blue"></i> Personalized Email Reminders</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-blue"></i> Priority AI Processing</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-blue"></i> Early Access to Mock Exams</li>
                                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-blue"></i> 24/7 Priority VIP Support</li>
                                </ul>
                                <Button href={route('register')} className="w-full bg-brand-blue text-white hover:bg-blue-700 shadow-lg text-center justify-center">Get Annual Pro</Button>
                            </div>

                        </div>
                    </div>
                </section>

                <WhatsAppFloatingButton />

                {/* Footer */}
                <footer className="bg-brand-dark text-brand-secondary pt-20">
                    <div className="container mx-auto px-6 pb-8">
                        <div className="text-center">
                            <Link href="/" className="text-2xl font-bold text-white flex items-center justify-center gap-2 mb-4">
                                <i className="fas fa-brain text-brand-blue"></i> Phronix AI
                            </Link>
                            <p className="max-w-md mx-auto mb-6">Your personal AI study architect, designed for academic excellence.</p>
                            <div className="flex justify-center gap-6 mb-8">
                                <a href="#" className="hover:text-brand-blue"><i className="fab fa-twitter"></i></a>
                                <a href="#" className="hover:text-brand-blue"><i className="fab fa-facebook-f"></i></a>
                                <a href="#" className="hover:text-brand-blue"><i className="fab fa-instagram"></i></a>
                            </div>
                        </div>
                        <div className="border-t border-gray-700 pt-8 text-center text-sm">
                            <p>&copy; {new Date().getFullYear()} Phronix AI. All Rights Reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}