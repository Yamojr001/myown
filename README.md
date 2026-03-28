# Phronix AI

**Phronix AI** (derived from Greek *Phronesis* - practical wisdom) is an AI-powered study platform that helps university students plan, read, practice, and improve performance across an entire semester.

## What The Platform Does

### 1. Course Upload And Topic Extraction
- Upload handouts/course files.
- Extract text from documents and identify key learning topics using AI.
- Build structured course data for planning and testing workflows.

### 2. Adaptive Semester Planning
- Generate a **Master Timetable** across all courses.
- Allocate study time using course load, difficulty, and test performance.
- Support custom preferences (study hours, preferred time, semester duration, semester start date).
- Automatic **current week tracking** based on semester start date.
- Week-by-week navigation and timetable PDF export.

### 3. Reading Plan System
- Generate per-course **detailed reading plans** from full course content.
- View weekly focus and tasks for each course.
- Download course reading handouts as PDF.

### 4. Personalized Daily Reading Handouts
- Dedicated **Reading Handouts** page.
- AI-generated handouts per course using:
  - course content,
  - reading plan,
  - timetable context.
- Organized by week and day (Monday-Friday).
- Stored for reuse/regeneration per course.

### 5. Daily Reading Reminder Emails
- Automated study notifications via scheduled command:
  - daily reading reminders,
  - active test alerts.
- Includes day-specific assignment slices from timetable/course workload.
- Adds AI guidance to daily assignments before email dispatch.

### 6. Testing And Assessment Engine
- Generate objective and essay assessments.
- Pre-test, mid-semester, post-test, and mock-exam flows.
- AI grading for essay responses.
- Weak-topic detection and result tracking.

### 7. AI Study Guide And Suggestions
- Generate focused study guides from weak topics.
- Show actionable recommendations and downloadable materials.

### 8. AI Tutor And Read Aloud
- Tutor mode for concept explanations and breakdowns.
- Read Aloud interface for spoken study support.

### 9. Past Questions Workspace
- Upload and manage past questions.
- Solve with AI assistance.
- Grade responses and download resources.

### 10. Dashboard, History, And Reviews
- Student dashboard with key academic indicators.
- Study/test history tracking.
- User review collection and admin moderation.

### 11. Admin Tools
- Admin dashboard and user management.
- Course and past-question oversight.
- Activity logs and settings.
- Newsletter broadcast to subscribed users with unsubscribe support.

## Technology Stack

- **Backend**: Laravel 12.x (PHP)
- **Frontend**: Inertia.js + React + Tailwind CSS
- **AI**: Gemini 2.5 Flash / Pro
- **Database**: MySQL (SQLite supported for local/testing)
- **PDF/Text Extraction**: Smalot PDF Parser + AI OCR fallback
- **Mail**: Laravel Mail (SMTP)

## Key Scheduled Job

Daily proactive notifications are sent through:

```bash
php artisan app:send-study-notifications
```

Recommended scheduler entry (production):

```bash
* * * * * php /path/to/project/artisan schedule:run >> /dev/null 2>&1
```

## Getting Started

1. Clone the repository.
2. Install dependencies:
	- `composer install`
	- `npm install`
3. Copy environment file and configure keys:
	- `cp .env.example .env`
	- set database, mail, and `GEMINI_API_KEY`
4. Generate app key and migrate database:
	- `php artisan key:generate`
	- `php artisan migrate`
5. Run development servers:
	- `npm run dev`

## Useful Commands

```bash
php artisan serve
php artisan migrate
php artisan route:list
php artisan app:send-study-notifications
npm run dev
npm run build
```

## License

Phronix AI is open-source software licensed under the [MIT License](https://opensource.org/licenses/MIT).
