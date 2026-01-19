/**
 * Language to Flag Emoji Mapping
 * Maps MediaInfo language strings to flag emojis
 */

// Common language to country code mappings
const languageToCountry: Record<string, string> = {
    // Comprehensive list of languages (ISO 639-1 & Common Names)
    'afrikaans': 'ZA', 'af': 'ZA',
    'albanian': 'AL', 'sq': 'AL',
    'amharic': 'ET', 'am': 'ET',
    'arabic': 'SA', 'ar': 'SA',
    'armenian': 'AM', 'hy': 'AM',
    'azerbaijani': 'AZ', 'az': 'AZ',
    'basque': 'ES', 'eu': 'ES',
    'belarusian': 'BY', 'be': 'BY',
    'bengali': 'BD', 'bn': 'BD',
    'bosnian': 'BA', 'bs': 'BA',
    'bulgarian': 'BG', 'bg': 'BG',
    'burmese': 'MM', 'my': 'MM',
    'cambodian': 'KH', 'km': 'KH',
    'catalan': 'ES', 'ca': 'ES',
    'cebuano': 'PH',
    'chinese': 'CN', 'zh': 'CN',
    'chinese (simplified)': 'CN',
    'chinese (traditional)': 'CN',
    'cantonese': 'HK',
    'croatian': 'HR', 'hr': 'HR',
    'czech': 'CZ', 'cs': 'CZ',
    'danish': 'DK', 'da': 'DK',
    'dutch': 'NL', 'nl': 'NL',
    'english': 'US', 'en': 'US',
    'esperanto': 'PL', 'eo': 'PL',
    'estonian': 'EE', 'et': 'EE',
    'filipino': 'PH', 'fil': 'PH',
    'finnish': 'FI', 'fi': 'FI',
    'french': 'FR', 'fr': 'FR',
    'galician': 'ES', 'gl': 'ES',
    'georgian': 'GE', 'ka': 'GE',
    'german': 'DE', 'de': 'DE',
    'greek': 'GR', 'el': 'GR',
    'gujarati': 'IN', 'gu': 'IN',
    'haitian creole': 'HT', 'ht': 'HT',
    'hebrew': 'IL', 'he': 'IL',
    'hindi': 'IN', 'hi': 'IN',
    'hungarian': 'HU', 'hu': 'HU',
    'icelandic': 'IS', 'is': 'IS',
    'indonesian': 'ID', 'id': 'ID',
    'irish': 'IE', 'ga': 'IE',
    'italian': 'IT', 'it': 'IT',
    'japanese': 'JP', 'ja': 'JP',
    'javanese': 'ID', 'jv': 'ID',
    'kannada': 'IN', 'kn': 'IN',
    'kazakh': 'KZ', 'kk': 'KZ',
    'khmer': 'KH',
    'korean': 'KR', 'ko': 'KR',
    'kurdish': 'TR', 'ku': 'TR',
    'kyrgyz': 'KG', 'ky': 'KG',
    'lao': 'LA', 'lo': 'LA',
    'latin': 'VA', 'la': 'VA',
    'latvian': 'LV', 'lv': 'LV',
    'lithuanian': 'LT', 'lt': 'LT',
    'luxembourgish': 'LU', 'lb': 'LU',
    'macedonian': 'MK', 'mk': 'MK',
    'malay': 'MY', 'ms': 'MY',
    'malayalam': 'IN', 'ml': 'IN',
    'maltese': 'MT', 'mt': 'MT',
    'maori': 'NZ', 'mi': 'NZ',
    'marathi': 'IN', 'mr': 'IN',
    'mongolian': 'MN', 'mn': 'MN',
    'nepali': 'NP', 'ne': 'NP',
    'norwegian': 'NO', 'no': 'NO',
    'pashto': 'AF', 'ps': 'AF',
    'persian': 'IR', 'fa': 'IR',
    'polish': 'PL', 'pl': 'PL',
    'portuguese': 'PT', 'pt': 'PT',
    'portuguese (brazil)': 'BR',
    'punjabi': 'PK', 'pa': 'PK',
    'romanian': 'RO', 'ro': 'RO',
    'russian': 'RU', 'ru': 'RU',
    'serbian': 'RS', 'sr': 'RS',
    'sinhala': 'LK', 'si': 'LK',
    'slovak': 'SK', 'sk': 'SK',
    'slovenian': 'SI', 'sl': 'SI',
    'somali': 'SO', 'so': 'SO',
    'spanish': 'ES', 'es': 'ES',
    'spanish (latin america)': 'MX',
    'sundanese': 'ID', 'su': 'ID',
    'swahili': 'KE', 'sw': 'KE',
    'swedish': 'SE', 'sv': 'SE',
    'tagalog': 'PH', 'tl': 'PH',
    'tajik': 'TJ', 'tg': 'TJ',
    'tamil': 'IN', 'ta': 'IN',
    'tatar': 'RU', 'tt': 'RU',
    'telugu': 'IN', 'te': 'IN',
    'thai': 'TH', 'th': 'TH',
    'turkish': 'TR', 'tr': 'TR',
    'turkmen': 'TM', 'tk': 'TM',
    'ukrainian': 'UA', 'uk': 'UA',
    'urdu': 'PK', 'ur': 'PK',
    'uyghur': 'CN', 'ug': 'CN',
    'uzbek': 'UZ', 'uz': 'UZ',
    'vietnamese': 'VN', 'vi': 'VN',
    'welsh': 'GB-WLS', 'cy': 'GB-WLS',
    'xhosa': 'ZA', 'xh': 'ZA',
    'yiddish': 'IL', 'yi': 'IL',
    'yoruba': 'NG', 'yo': 'NG',
    'zulu': 'ZA', 'zu': 'ZA',
};

/**
 * Convert a country code to flag emoji
 * Uses regional indicator symbols (works on most systems)
 */
function countryCodeToFlag(code: string): string {
    const codePoints = code
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

/**
 * Get flag emoji for a language string
 * @param language - Language string from MediaInfo (e.g., "Japanese", "Chinese (Simplified)")
 * @returns Flag emoji or the first 2 chars of language as fallback
 */
export function getLanguageFlag(language: string): string {
    if (!language) return '🏳️';

    const normalized = language.toLowerCase().trim();

    // Try exact match first
    if (languageToCountry[normalized]) {
        return countryCodeToFlag(languageToCountry[normalized]);
    }

    // Try partial match (e.g., "English (SDH)" -> "English")
    for (const [key, country] of Object.entries(languageToCountry)) {
        if (normalized.startsWith(key) || key.startsWith(normalized.split('(')[0].trim())) {
            return countryCodeToFlag(country);
        }
    }

    // Fallback: return globe emoji
    return '🌐';
}

/**
 * Normalize language for deduplication (remove variants like SDH, CC, etc.)
 */
export function normalizeLanguage(language: string): string {
    if (!language) return '';

    // Extract base language (before any parentheses or special markers)
    let base = language
        .toLowerCase()
        .split('(')[0]
        .replace(/\s*(sdh|cc|forced|commentary|descriptive|hearing impaired)\s*/gi, '')
        .trim();

    // Map Chinese variants to single 'chinese' for deduplication
    // Exception: Cantonese stays separate
    if (base.includes('chinese')) {
        return 'chinese';
    }
    if (base.includes('cantonese')) {
        return 'cantonese';
    }

    // Map regional variants
    const regionalMap: Record<string, string> = {
        'spanish (latin america)': 'spanish (latin america)',
        'portuguese (brazil)': 'portuguese (brazil)',
    };

    for (const [key, value] of Object.entries(regionalMap)) {
        if (language.toLowerCase().includes(key.split('(')[0]) && language.toLowerCase().includes(key.split('(')[1]?.replace(')', '') || '')) {
            return value;
        }
    }

    return base;
}

/**
 * Deduplicate languages and return unique flags with languages
 */
export function getUniqueLanguageFlags(languages: string[]): Array<{ language: string; flag: string }> {
    const seen = new Set<string>();
    const result: Array<{ language: string; flag: string }> = [];

    for (const lang of languages) {
        const normalized = normalizeLanguage(lang);
        if (normalized && !seen.has(normalized)) {
            seen.add(normalized);
            result.push({
                language: normalized,
                flag: getLanguageFlag(normalized)
            });
        }
    }

    return result;
}
