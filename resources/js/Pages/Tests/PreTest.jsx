import { Head, useForm } from '@inertiajs/react';

// This component receives `course` and `questions` as props from the controller
export default function PreTest({ course, questions }) {

    // useForm will hold all the user's answers
    const { data, setData, post, processing } = useForm({
        answers: Array(questions.length).fill(null),
    });

    const handleAnswerChange = (questionIndex, optionIndex) => {
        const newAnswers = [...data.answers];
        newAnswers[questionIndex] = optionIndex;
        setData('answers', newAnswers);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('courses.test.store', course.id));
    };

    return (
        <>
            <Head title={`Pre-Test: ${course.title}`} />
            <div className="min-h-screen bg-brand-light font-sans">
                <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-brand-text">Pre-Test: {course.title}</h1>
                        <p className="text-brand-secondary mt-2">This initial assessment will help us tailor your study plan.</p>
                    </div>

                    <div className="bg-brand-white p-6 sm:p-8 rounded-lg shadow-md">
                        <form onSubmit={submit}>
                            {questions.map((q, questionIndex) => (
                                <div key={questionIndex} className="mb-8 pb-8 border-b border-gray-200 last:border-b-0">
                                    <p className="text-lg font-semibold text-brand-text leading-relaxed">
                                        {questionIndex + 1}. {q.question}
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        {q.options.map((option, optionIndex) => (
                                            <label key={optionIndex} className="flex items-center p-3 w-full rounded-lg border border-gray-300 has-[:checked]:bg-brand-blue/10 has-[:checked]:border-brand-blue transition-colors">
                                                <input
                                                    type="radio"
                                                    name={`question_${questionIndex}`}
                                                    className="h-4 w-4 text-brand-blue focus:ring-brand-blue"
                                                    onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                                                    required
                                                />
                                                <span className="ml-3 text-brand-text">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            
                            <div className="mt-8 text-center">
                                <button type="submit" disabled={processing} className="w-full sm:w-auto px-12 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                                    {processing ? 'Submitting...' : 'Submit & See Results'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}