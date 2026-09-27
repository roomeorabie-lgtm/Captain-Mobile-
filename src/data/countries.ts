export interface CountryInfo {
  name: string;
  nameEn: string;
  code: string; // ISO 2 code
  dialCode: string; // e.g. "+20"
  flag: string;
}

export const COUNTRIES: CountryInfo[] = [
  // Middle East & North Africa (Top Priority)
  { name: 'مصر', nameEn: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'السعودية', nameEn: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'الإمارات', nameEn: 'UAE', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'الكويت', nameEn: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'قطر', nameEn: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'عمان', nameEn: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'البحرين', nameEn: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'الأردن', nameEn: 'Jordan', code: 'JO', dialCode: '+962', flag: '🇯🇴' },
  { name: 'العراق', nameEn: 'Iraq', code: 'IQ', dialCode: '+964', flag: '🇮🇶' },
  { name: 'لبنان', nameEn: 'Lebanon', code: 'LB', dialCode: '+961', flag: '🇱🇧' },
  { name: 'فلسطين', nameEn: 'Palestine', code: 'PS', dialCode: '+970', flag: '🇵🇸' },
  { name: 'سوريا', nameEn: 'Syria', code: 'SY', dialCode: '+963', flag: '🇸🇾' },
  { name: 'اليمن', nameEn: 'Yemen', code: 'YE', dialCode: '+967', flag: '🇾🇪' },
  { name: 'ليبيا', nameEn: 'Libya', code: 'LY', dialCode: '+218', flag: '🇱🇾' },
  { name: 'السودان', nameEn: 'Sudan', code: 'SD', dialCode: '+249', flag: '🇸🇩' },
  { name: 'تونس', nameEn: 'Tunisia', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
  { name: 'الجزائر', nameEn: 'Algeria', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'المغرب', nameEn: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
  { name: 'موريتانيا', nameEn: 'Mauritania', code: 'MR', dialCode: '+222', flag: '🇲🇷' },
  { name: 'الصومال', nameEn: 'Somalia', code: 'SO', dialCode: '+252', flag: '🇸🇴' },

  // Other Major Global Countries
  { name: 'تركيا', nameEn: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'الولايات المتحدة', nameEn: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'المملكة المتحدة', nameEn: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'ألمانيا', nameEn: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'فرنسا', nameEn: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'إيطاليا', nameEn: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'إسبانيا', nameEn: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'روسيا', nameEn: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
  { name: 'الصين', nameEn: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'كندا', nameEn: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'أستراليا', nameEn: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'الهند', nameEn: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'باكستان', nameEn: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'بنغلاديش', nameEn: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'إندونيسيا', nameEn: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'ماليزيا', nameEn: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'اليابان', nameEn: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'كوريا الجنوبية', nameEn: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷' },
  { name: 'البرازيل', nameEn: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'الأرجنتين', nameEn: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
  { name: 'المكسيك', nameEn: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'هولندا', nameEn: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'بلجيكا', nameEn: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'السويد', nameEn: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'سويسرا', nameEn: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'النمسا', nameEn: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹' },
  { name: 'اليونان', nameEn: 'Greece', code: 'GR', dialCode: '+30', flag: '🇬🇷' },
  { name: 'بولندا', nameEn: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱' },
  { name: 'أوكرانيا', nameEn: 'Ukraine', code: 'UA', dialCode: '+380', flag: '🇺🇦' },
  { name: 'جنوب إفريقيا', nameEn: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'نيجيريا', nameEn: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'كينيا', nameEn: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'غانا', nameEn: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭' },
  { name: 'الفلبين', nameEn: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭' },
  { name: 'تايلاند', nameEn: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
  { name: 'فيتنام', nameEn: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Egypt (+20)
