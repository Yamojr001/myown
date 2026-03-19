# Phronix AI 🧠

**Phronix AI** (derived from the Greek *Phronesis* - practical wisdom) is a sophisticated, AI-powered academic architect designed to help university students master their courses with precision.

## Core Features

- **Syllabus Decomposition**: Upload your course handouts and let Phronix AI extract key topics and learning modules.
- **Adaptive Reading Plans**: Automatically generated week-by-week schedules tailored to your actual course content.
- **Active Recall Mock Exams**: Generate multiple-choice and essay-based exams directly from your study materials.
- **AI Grading**: Instant, constructive feedback on essay answers to refine your understanding.
- **Master Timetable**: A unified view of your entire semester, re-balancing your study hours based on your performance and course difficulty.
- **AI Tutor Mode**: Deep-dive explanations of complex concepts using relatable examples and step-by-step logic.

## Technology Stack

- **Backend**: Laravel 12.x (PHP)
- **Frontend**: Inertia.js with React & Tailwind CSS
- **AI Intelligence**: Google Gemini 2.5 Flash & Pro via Vertex AI / Google Generative AI SDK
- **Data Persistence**: MySQL / SQLite
- **PDF Processing**: Smalot PDF Parser & Gemini Vision for complex documents

## Getting Started

1. Clone the repository.
2. Run `composer install` and `npm install`.
3. Copy `.env.example` to `.env` and configure your `GEMINI_API_KEY`.
4. Run `php artisan key:generate` and `php artisan migrate`.
5. Start the development server with `npm run dev` (uses concurrently to run Vite and Laravel).

## License

The Phronix AI project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
