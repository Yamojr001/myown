<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subjectLine }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f0f4f8;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .email-wrapper {
            background-color: #ffffff;
            border-radius: 40px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(30, 58, 138, 0.1);
            border: 1px solid rgba(30, 58, 138, 0.1);
            position: relative;
        }

        .header {
            padding: 42px 24px 34px;
            text-align: center;
            background-color: #1e3a8a;
            color: #ffffff;
        }

        .logo-container {
            display: inline-block;
            margin-bottom: 5px;
        }

        .logo-svg {
            width: 72px;
            height: 72px;
            display: block;
            margin: 0 auto;
        }

        .logo-text {
            font-size: 26px;
            font-weight: 950;
            color: #ffffff;
            letter-spacing: -1px;
            display: block;
            margin-top: 5px;
        }

        .header-subtitle {
            margin-top: 10px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.8px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.82);
        }

        .content {
            padding: 20px 45px 60px;
            position: relative;
            background-color: #ffffff;
        }

        /* Modern Watermark - Safely positioned */
        .watermark-container {
            text-align: center;
            opacity: 0.04;
            pointer-events: none;
            margin-bottom: -150px; /* Pull content up over it slightly */
        }

        .watermark-svg {
            width: 150px;
            height: 150px;
            display: block;
            margin: 0 auto;
        }

        h1 {
            color: #1e3a8a;
            font-size: 26px;
            font-weight: 900;
            margin-bottom: 30px;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 2;
        }

        p {
            color: #334155;
            font-size: 16px;
            line-height: 1.9;
            margin-bottom: 25px;
            position: relative;
            z-index: 2;
        }

        .footer {
            padding: 50px 40px;
            text-align: center;
            background-color: #1e3a8a;
            color: #ffffff;
        }

        .unsubscribe-link {
            color: #93c5fd;
            text-decoration: none;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border: 1px solid rgba(147, 197, 253, 0.3);
            padding: 8px 16px;
            border-radius: 10px;
            display: inline-block;
            margin-top: 20px;
        }

        .brand-footer {
            margin-top: 30px;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 3px;
            color: rgba(255, 255, 255, 0.4);
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <div style="text-align: center; margin: 0 auto 15px; padding: 0;">
                    <img src="{{ $message->embed(public_path('images/branding/logo.png')) }}" alt="Phronix AI Logo" style="height: 120px; vertical-align: middle;">
                </div>
                <div class="header-subtitle">Phronix AI Administrative Broadcast</div>
            </div>

            <div class="content">
                <div style="text-align: center; height: 0; padding: 0; margin: 0; overflow: visible; position: relative; pointer-events: none;">
                    <div style="display: inline-block; opacity: 0.15; padding-top: 45px;">
                        <img src="{{ $message->embed(public_path('images/branding/watermark.png')) }}" alt="Phronix AI Watermark" style="width: 350px; height: 350px;">
                    </div>
                </div>
                <h1>Hello, {{ $user->name }}</h1>

                <p>
                    {!! nl2br(e($contentBody)) !!}
                </p>
                <p style="font-weight: 700;">Stay ahead of your academic journey with Phronix AI.</p>
            </div>

            <div class="footer">
                <p style="font-size: 14px; margin-bottom: 20px; font-weight: 700;">{{ config('app.name') }} &middot; Future-Proof Learning</p>
                <a href="{{ $unsubscribeUrl }}" class="unsubscribe-link">Click here to Unsubscribe</a>
                <div class="brand-footer opacity-50">Sent via Phronix AI Administrative Broadcast Engine</div>
            </div>
        </div>
    </div>
</body>
</html>
