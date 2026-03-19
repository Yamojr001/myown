<?php

namespace App\Helpers;

class DeviceHelper
{
    public static function parse($userAgent)
    {
        $browser = 'Unknown';
        $platform = 'Unknown';
        $deviceType = 'Desktop';

        // Simple Platform Detection
        if (preg_match('/linux/i', $userAgent)) {
            $platform = 'Linux';
        } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
            $platform = 'Mac';
        } elseif (preg_match('/windows|win32/i', $userAgent)) {
            $platform = 'Windows';
        } elseif (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
            $platform = 'iOS';
            $deviceType = preg_match('/ipad/i', $userAgent) ? 'Tablet' : 'Mobile';
        } elseif (preg_match('/android/i', $userAgent)) {
            $platform = 'Android';
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
