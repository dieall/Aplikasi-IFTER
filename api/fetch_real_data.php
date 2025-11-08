<?php
/**
 * Fetch Real Data from External APIs
 * Mengambil data aplikasi kesehatan dari sumber eksternal
 */

// Load configuration
require_once __DIR__ . '/config.php';

// Cache configuration
define('CACHE_DIR', __DIR__ . '/cache/');
$cacheDuration = defined('CACHE_DURATION') ? CACHE_DURATION : 3600;

// Create cache directory if not exists
if (!file_exists(CACHE_DIR)) {
    mkdir(CACHE_DIR, 0755, true);
}

/**
 * Get cached data
 */
function getCachedData($key) {
    global $cacheDuration;
    $cacheFile = CACHE_DIR . md5($key) . '.json';
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheDuration) {
        return json_decode(file_get_contents($cacheFile), true);
    }
    return null;
}

/**
 * Save data to cache
 */
function saveCache($key, $data) {
    $cacheFile = CACHE_DIR . md5($key) . '.json';
    file_put_contents($cacheFile, json_encode($data));
}

/**
 * Fetch app data from Google Play Store
 */
function fetchFromPlayStore($packageName) {
    $cacheKey = "playstore_{$packageName}";
    $cached = getCachedData($cacheKey);
    if ($cached) return $cached;
    
    try {
        // Method 1: Try RapidAPI if available
        $rapidApiKey = defined('RAPIDAPI_KEY') ? RAPIDAPI_KEY : '';
        if (!empty($rapidApiKey)) {
            $url = "https://google-play-store-api.p.rapidapi.com/app/details?appId=" . urlencode($packageName);
            $headers = [
                "X-RapidAPI-Key: {$rapidApiKey}",
                "X-RapidAPI-Host: google-play-store-api.p.rapidapi.com"
            ];
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode === 200 && $response) {
                $data = json_decode($response, true);
                if (isset($data['data'])) {
                    $app = $data['data'];
                    $result = [
                        'name' => $app['title'] ?? '',
                        'rating' => round($app['score'] ?? 0, 1),
                        'reviews' => $app['reviews'] ?? 0,
                        'user_count' => formatDownloads($app['installs'] ?? ''),
                        'downloads' => $app['installs'] ?? '',
                        'description' => $app['description'] ?? '',
                        'icon' => $app['icon'] ?? '',
                        'version' => $app['version'] ?? '',
                        'updated' => $app['updated'] ?? '',
                        'size' => $app['size'] ?? '',
                        'content_rating' => $app['contentRating'] ?? '',
                        'developer' => $app['developer'] ?? '',
                        'genre' => $app['genre'] ?? '',
                        'price' => $app['price'] ?? 0,
                        'screenshots' => $app['screenshots'] ?? []
                    ];
                    saveCache($cacheKey, $result);
                    return $result;
                }
            }
        }
        
        // Method 2: Scrape from Play Store (fallback)
        $url = "https://play.google.com/store/apps/details?id={$packageName}&hl=id";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 && $html) {
            $result = parsePlayStoreHTML($html, $packageName);
            if ($result) {
                saveCache($cacheKey, $result);
                return $result;
            }
        }
        
    } catch (Exception $e) {
        error_log("Error fetching from Play Store: " . $e->getMessage());
        return null;
    }
    
    return null;
}

/**
 * Parse HTML from Play Store
 */
function parsePlayStoreHTML($html, $packageName) {
    $result = [
        'name' => '',
        'rating' => 0,
        'reviews' => 0,
        'user_count' => '',
        'downloads' => '',
        'description' => ''
    ];
    
    // Extract rating - multiple patterns
    $ratingPatterns = [
        '/<div[^>]*class="[^"]*BHMmbe[^"]*"[^>]*>([0-9.]+)<\/div>/',
        '/<div[^>]*class="[^"]*TT9eCd[^"]*"[^>]*>([0-9.]+)<\/div>/',
        '/"ratingValue":\s*([0-9.]+)/',
        '/<span[^>]*>([0-9.]+)\s*<span[^>]*>bintang/i'
    ];
    
    foreach ($ratingPatterns as $pattern) {
        if (preg_match($pattern, $html, $matches)) {
            $result['rating'] = round(floatval($matches[1]), 1);
            break;
        }
    }
    
    // Extract reviews count - multiple patterns
    $reviewPatterns = [
        '/<span[^>]*class="[^"]*AYi5wd[^"]*"[^>]*>([0-9,]+)/',
        '/"ratingCount":\s*([0-9,]+)/',
        '/<span[^>]*>([0-9,]+)\s*(ulasan|review)/i',
        '/<span[^>]*>([0-9,]+)\s*<span[^>]*>rating/i'
    ];
    
    foreach ($reviewPatterns as $pattern) {
        if (preg_match($pattern, $html, $matches)) {
            $result['reviews'] = intval(str_replace(',', '', $matches[1]));
            break;
        }
    }
    
    // Extract downloads/installs - multiple patterns for Indonesian and English
    $downloadPatterns = [
        '/>([0-9,]+(\+)?)\s*(downloads|installs|pengunduhan|pengguna|unduhan)   /i',
        '/"([0-9,]+(\+)?)\s*(downloads|installs|pengunduhan)"/i',
        '/<span[^>]*>([0-9,]+(\+)?)\s*(downloads|installs|pengunduhan|pengguna)/i',
        '/"([0-9,]+(\+)?)\s*(M\+|B\+|K\+|juta|ribu|miliar)"/i',
        '/<div[^>]*>([0-9,]+(\+)?)\s*(downloads|installs|pengunduhan)/i'
    ];
    
    foreach ($downloadPatterns as $pattern) {
        if (preg_match($pattern, $html, $matches)) {
            $downloads = $matches[1];
            $result['downloads'] = $downloads;
            $result['user_count'] = formatDownloads($downloads);
            break;
        }
    }
    
    // Try to find in JSON-LD structured data
    if (preg_match('/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/is', $html, $matches)) {
        $jsonData = json_decode($matches[1], true);
        if ($jsonData && isset($jsonData['aggregateRating'])) {
            if (!isset($result['rating']) || $result['rating'] == 0) {
                $result['rating'] = round($jsonData['aggregateRating']['ratingValue'] ?? 0, 1);
            }
            if (!isset($result['reviews']) || $result['reviews'] == 0) {
                $result['reviews'] = intval($jsonData['aggregateRating']['reviewCount'] ?? 0);
            }
        }
        if ($jsonData && isset($jsonData['offers']['price'])) {
            // Additional data
        }
    }
    
    // Extract app name
    $namePatterns = [
        '/<h1[^>]*class="[^"]*Fd93Bb[^"]*"[^>]*>([^<]+)<\/h1>/',
        '/<h1[^>]*itemprop="name"[^>]*>([^<]+)<\/h1>/',
        '/"name":\s*"([^"]+)"/'
    ];
    
    foreach ($namePatterns as $pattern) {
        if (preg_match($pattern, $html, $matches)) {
            $result['name'] = trim($matches[1]);
            break;
        }
    }
    
    // Extract description
    $descPatterns = [
        '/<div[^>]*jsname="[^"]*sngebd[^"]*"[^>]*>([^<]+)/',
        '/<div[^>]*itemprop="description"[^>]*>([^<]+)/',
        '/"description":\s*"([^"]+)"/'
    ];
    
    foreach ($descPatterns as $pattern) {
        if (preg_match($pattern, $html, $matches)) {
            $desc = strip_tags($matches[1]);
            $result['description'] = substr($desc, 0, 500);
            break;
        }
    }
    
    return $result;
}

/**
 * Format user count from downloads string
 */
function formatDownloads($downloads) {
    if (empty($downloads)) return '';
    
    // Remove non-numeric characters except + and ,
    $clean = preg_replace('/[^0-9,+\+]/', '', $downloads);
    
    // If contains +, it's already formatted
    if (strpos($clean, '+') !== false) {
        return $clean;
    }
    
    // Convert to number and format
    $num = intval(str_replace(',', '', $clean));
    
    if ($num >= 1000000000) {
        return number_format($num / 1000000000, 1) . 'B+';
    } elseif ($num >= 1000000) {
        return number_format($num / 1000000, 1) . 'M+';
    } elseif ($num >= 1000) {
        return number_format($num / 1000, 1) . 'K+';
    }
    
    return $num . '+';
}

/**
 * Format user count from number
 */
function formatUserCount($count) {
    if ($count >= 1000000000) {
        return number_format($count / 1000000000, 1) . 'B+';
    } elseif ($count >= 1000000) {
        return number_format($count / 1000000, 1) . 'M+';
    } elseif ($count >= 1000) {
        return number_format($count / 1000, 1) . 'K+';
    }
    return $count . '+';
}

/**
 * Fetch app data from App Store
 */
function fetchFromAppStore($appId) {
    $cacheKey = "appstore_{$appId}";
    $cached = getCachedData($cacheKey);
    if ($cached) return $cached;
    
    try {
        // Using iTunes API (free, no auth required)
        $url = "https://itunes.apple.com/lookup?id={$appId}&country=id";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 && $response) {
            $data = json_decode($response, true);
            if (isset($data['results'][0])) {
                $app = $data['results'][0];
                
                // Format user count
                $userCount = formatUserCount($app['userRatingCount'] ?? 0);
                
                $result = [
                    'name' => $app['trackName'] ?? '',
                    'rating' => round($app['averageUserRating'] ?? 0, 1),
                    'reviews' => $app['userRatingCount'] ?? 0,
                    'user_count' => $userCount,
                    'description' => $app['description'] ?? '',
                    'icon' => $app['artworkUrl512'] ?? $app['artworkUrl100'] ?? '',
                    'version' => $app['version'] ?? '',
                    'release_date' => $app['releaseDate'] ?? '',
                    'price' => $app['price'] ?? 0,
                    'currency' => $app['currency'] ?? 'USD',
                    'genre' => $app['primaryGenreName'] ?? '',
                    'seller' => $app['sellerName'] ?? '',
                    'file_size' => $app['fileSizeBytes'] ?? 0,
                    'content_rating' => $app['contentAdvisoryRating'] ?? '',
                    'screenshots' => $app['screenshotUrls'] ?? []
                ];
                saveCache($cacheKey, $result);
                return $result;
            }
        }
    } catch (Exception $e) {
        error_log("Error fetching from App Store: " . $e->getMessage());
        return null;
    }
    
    return null;
}

/**
 * Get app data from RapidAPI (if available)
 */
function fetchFromRapidAPI($appName) {
    // This requires RapidAPI key - configure in config.php
    $apiKey = defined('RAPIDAPI_KEY') ? RAPIDAPI_KEY : '';
    
    if (empty($apiKey)) {
        return null;
    }
    
    $cacheKey = "rapidapi_{$appName}";
    $cached = getCachedData($cacheKey);
    if ($cached) return $cached;
    
    try {
        $url = "https://google-play-store-api.p.rapidapi.com/app/details?appId=" . urlencode($appName);
        $headers = [
            "X-RapidAPI-Key: {$apiKey}",
            "X-RapidAPI-Host: google-play-store-api.p.rapidapi.com"
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 && $response) {
            $data = json_decode($response, true);
            saveCache($cacheKey, $data);
            return $data;
        }
    } catch (Exception $e) {
        return null;
    }
    
    return null;
}

/**
 * Fetch app data from multiple sources and merge
 */
function fetchAppData($appConfig) {
    $mergedData = $appConfig; // Start with base config
    
    $appStoreData = null;
    $playStoreData = null;
    
    // Try to fetch from App Store (iOS)
    if (isset($appConfig['app_store_id']) && !empty($appConfig['app_store_id'])) {
        $appStoreData = fetchFromAppStore($appConfig['app_store_id']);
        if ($appStoreData) {
            $mergedData['store_rating'] = $appStoreData['rating'] ?? $mergedData['store_rating'];
            $mergedData['store_reviews'] = $appStoreData['reviews'] ?? 0;
            if (!empty($appStoreData['description'])) {
                $mergedData['description'] = $appStoreData['description'];
            }
            if (!empty($appStoreData['user_count'])) {
                $mergedData['active_users'] = $appStoreData['user_count'];
            }
            if (!empty($appStoreData['version'])) {
                $mergedData['app_version'] = $appStoreData['version'];
            }
            if (!empty($appStoreData['release_date'])) {
                $mergedData['release_date'] = $appStoreData['release_date'];
            }
        }
    }
    
    // Try to fetch from Play Store (Android)
    if (isset($appConfig['play_store_id']) && !empty($appConfig['play_store_id'])) {
        $playStoreData = fetchFromPlayStore($appConfig['play_store_id']);
        if ($playStoreData) {
            // Use Play Store data if available (usually more accurate for Indonesian apps)
            $mergedData['store_rating'] = $playStoreData['rating'] ?? $mergedData['store_rating'];
            $mergedData['store_reviews'] = $playStoreData['reviews'] ?? $mergedData['store_reviews'] ?? 0;
            
            // Update active users with real download count
            if (!empty($playStoreData['user_count'])) {
                $mergedData['active_users'] = $playStoreData['user_count'];
            } elseif (!empty($playStoreData['downloads'])) {
                $mergedData['active_users'] = formatDownloads($playStoreData['downloads']);
            }
            
            if (!empty($playStoreData['description'])) {
                $mergedData['description'] = $playStoreData['description'];
            }
            if (!empty($playStoreData['version'])) {
                $mergedData['app_version'] = $playStoreData['version'];
            }
            if (!empty($playStoreData['updated'])) {
                $mergedData['last_updated'] = $playStoreData['updated'];
            }
            if (!empty($playStoreData['developer'])) {
                $mergedData['developer'] = $playStoreData['developer'];
            }
        }
    }
    
    // If we got data from both stores, prefer Play Store for Android apps
    if ($playStoreData && $appStoreData) {
        // Average the ratings
        $ratings = array_filter([$playStoreData['rating'] ?? 0, $appStoreData['rating'] ?? 0]);
        if (!empty($ratings)) {
            $mergedData['store_rating'] = round(array_sum($ratings) / count($ratings), 1);
        }
        
        // Sum the reviews
        $mergedData['store_reviews'] = ($playStoreData['reviews'] ?? 0) + ($appStoreData['reviews'] ?? 0);
    }
    
    // Try RapidAPI as additional source
    if (isset($appConfig['name']) && empty($playStoreData) && empty($appStoreData)) {
        $rapidData = fetchFromRapidAPI($appConfig['name']);
        if ($rapidData) {
            if (isset($rapidData['rating']) && !isset($mergedData['store_rating'])) {
                $mergedData['store_rating'] = $rapidData['rating'];
            }
            if (isset($rapidData['installs']) && !isset($mergedData['active_users'])) {
                $mergedData['active_users'] = formatDownloads($rapidData['installs']);
            }
        }
    }
    
    return $mergedData;
}

/**
 * Enhance base apps with real data from external APIs
 * This function will be called from index.php with the base apps
 */
function enhanceAppsWithRealData($baseApps) {
    global $appStoreIds, $playStoreIds;
    
    $apps = [];
    foreach ($baseApps as $appConfig) {
        $appName = $appConfig['name'];
        
        // Add store IDs if available
        if (isset($appStoreIds[$appName])) {
            $appConfig['app_store_id'] = $appStoreIds[$appName];
        }
        if (isset($playStoreIds[$appName])) {
            $appConfig['play_store_id'] = $playStoreIds[$appName];
        }
        
        // Fetch real data if enabled
        if (defined('ENABLE_REAL_DATA') && ENABLE_REAL_DATA) {
            $app = fetchAppData($appConfig);
        } else {
            $app = $appConfig;
        }
        
        // Ensure required fields
        $app['store_rating'] = $app['store_rating'] ?? $appConfig['store_rating'] ?? 4.0;
        $app['store_reviews'] = $app['store_reviews'] ?? 0;
        $app['evaluation_date'] = $app['evaluation_date'] ?? date('Y-m-d');
        
        $apps[] = $app;
    }
    
    return $apps;
}

?>

