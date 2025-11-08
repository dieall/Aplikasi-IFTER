<?php
/**
 * Configuration file for API
 * Copy this to config.local.php and add your API keys
 */

// RapidAPI Configuration (optional)
// Get your key from https://rapidapi.com/
define('RAPIDAPI_KEY', '');

// Enable real data fetching (set to false to use static data only)
define('ENABLE_REAL_DATA', true);

// Cache duration in seconds (default: 1 hour)
define('CACHE_DURATION', 3600);

// App Store IDs for Indonesian health apps
// Get ID from: https://apps.apple.com/app/id[ID]
$appStoreIds = [
    'Halodoc' => '1099194598',
    'Alodokter' => '1099194598', // Update with real ID
    'SehatQ' => '', // Add real IDs
    'KlikDokter' => '',
    'MyFitnessPal' => '341232718',
    'Riliv' => '',
    'NutriCheck' => '',
    'Good Doctor' => ''
];

// Google Play Store Package IDs
// Get from: https://play.google.com/store/apps/details?id=[PACKAGE_ID]
$playStoreIds = [
    'Halodoc' => 'com.halodoc.android',
    'Alodokter' => 'com.alodokter.android',
    'SehatQ' => 'com.sehatq.mobile',
    'KlikDokter' => 'com.klikdokter.android',
    'MyFitnessPal' => 'com.myfitnesspal.android',
    'Riliv' => 'com.riliv.app',
    'NutriCheck' => '', // Add if available
    'Good Doctor' => 'com.gooddoctor.id'
];

// Load local config if exists
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
}

?>

