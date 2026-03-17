import { Head, Link } from '@inertiajs/react';

export default function TestResult({ testResult }) {
    const score = testResult.score;
    const weakTopics = testResult.weak_topics || [];
    const courseTitle = testResult.course.title;

    let scoreColorClass = 'text-brand-blue';
    let scoreBgClass = 'bg-brand-blue/10';
    if (score < 50) {
        scoreColorClass = 'text-brand-dark';
        scoreBgClass = 'bg-gray-200';
    } else if (score < 75) {
        scoreColorClass = 'text-brand-blue';
        scoreBgClass = 'bg-brand-blue/5';
    }

    return (
        <>
            <Head title="Test Results" />
            <div className="min-h-screen bg-brand-light flex items-center justify-center font-sans p-4">
                <div className="max-w-2xl w-full bg-brand-white p-8 sm:p-12 rounded-2xl shadow-xl text-center">

                    <h1 className="text-3xl font-bold text-brand-text">Pre-Test Results</h1>
                    <p className="text-brand-secondary mt-1 mb-8">For {courseTitle}</p>

                    <div className="my-8">
                        <div className={`relative w-48 h-48 mx-auto rounded-full flex items-center justify-center ${scoreBgClass}`}>
                            <div className={`text-6xl font-extrabold ${scoreColorClass}`}>{score}<span className="text-4xl">%</span></div>
                        </div>
                        <p className="font-semibold text-xl text-brand-text mt-4">Overall Score</p>
                    </div>

                    {weakTopics.length > 0 ? (
                        <div className="mt-10">
                            <h3 className="text-xl font-semibold text-brand-text flex items-center justify-center gap-2">
                                <i className="fas fa-bullseye text-brand-blue"></i>
                                Your AI-Identified Focus Areas
                            </h3>
                            <p className="text-brand-secondary mt-2 mb-5">Your new study plan will prioritize these topics.</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {weakTopics.map((topic, index) => (
                                    <span key={index} className="bg-brand-blue/10 text-brand-blue text-sm font-semibold px-4 py-2 rounded-full">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-10 text-center">
                            <i className="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                            <h3 className="text-xl font-semibold text-brand-text">Excellent Work!</h3>
                            <p className="text-brand-secondary mt-1">No specific weak areas were identified. Your study plan will be well-balanced.</p>
                        </div>
                    )}

                    <div className="mt-12">
                        <Link
                            href={route('courses.index')}
                            className="w-full sm:w-auto px-8 py-3 bg-brand-blue text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-transform hover:scale-105"
                        >
                            Back to My Courses
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}