<?php

namespace App\Helpers;

class DeviceHelper
{
    public static function parse($userAgent)
    {
        $browser = 'Unknown';
        $platform = 'Unknown';
        $deviceType = 'Desktop';

        // Prioritized Platform & Device Detection
        if (preg_match('/android/i', $userAgent)) {
            $platform = 'Android';
            $deviceType = preg_match('/tablet|tab|ipad/i', $userAgent) ? 'Tablet' : 'Mobile';
        } elseif (preg_match('/iphone|ipod/i', $userAgent)) {
            $platform = 'iOS';
            $deviceType = 'Mobile';
        } elseif (preg_match('/ipad/i', $userAgent)) {
            $platform = 'iOS';
            $deviceType = 'Tablet';
        } elseif (preg_match('/windows|win32/i', $userAgent)) {
            $platform = 'Windows';
            $deviceType = 'Desktop';
        } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
            $platform = 'Mac';
            $deviceType = 'Desktop';
        } elseif (preg_match('/linux/i', $userAgent)) {
            $platform = 'Linux';
            $deviceType = 'Desktop';
        }

        // Final sanity check for device type if platform was unknown
        if ($deviceType === 'Desktop' && preg_match('/mobile/i', $userAgent)) {
            $deviceType = 'Mobile';
        }

        // Simple Browser Detection
        if (preg_match('/msie/i', $userAgent) && !preg_match('/opera/i', $userAgent)) {
            $browser = 'IE';
        } elseif (preg_match('/firefox/i', $userAgent)) {
            $browser = 'Firefox';
        } elseif (preg_match('/chrome/i', $userAgent)) {
            $browser = 'Chrome';
        } elseif (preg_match('/safari/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/opera/i', $userAgent)) {
            $browser = 'Opera';
        } elseif (preg_match('/netscape/i', $userAgent)) {
            $browser = 'Netscape';
        }

        return [
            'browser' => $browser,
            'platform' => $platform,
            'device_type' => $deviceType,
        ];
    }
}
