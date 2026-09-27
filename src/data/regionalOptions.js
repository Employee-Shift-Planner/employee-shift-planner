export const COUNTRY_OPTIONS = [
  ["JM", "Jamaica"], ["US", "United States"], ["CA", "Canada"], ["GB", "United Kingdom"],
  ["TT", "Trinidad and Tobago"], ["BB", "Barbados"], ["BS", "Bahamas"], ["KY", "Cayman Islands"],
  ["AG", "Antigua and Barbuda"], ["GD", "Grenada"], ["GY", "Guyana"], ["LC", "Saint Lucia"],
  ["VC", "Saint Vincent and the Grenadines"], ["BZ", "Belize"], ["AU", "Australia"], ["NZ", "New Zealand"],
  ["IN", "India"], ["JP", "Japan"], ["CN", "China"], ["DE", "Germany"], ["FR", "France"],
  ["ES", "Spain"], ["IT", "Italy"], ["NL", "Netherlands"],
].map(([code, name]) => ({ code, name }));

export const CURRENCY_OPTIONS = ["JMD", "USD", "CAD", "GBP", "TTD", "BBD", "BSD", "KYD", "XCD", "BZD", "GYD", "AUD", "NZD", "INR", "JPY", "CNY", "EUR"];

const FALLBACK_TIME_ZONES = [
  "America/Jamaica", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "America/Port_of_Spain", "America/Barbados", "America/Nassau", "America/Cayman",
  "America/Guyana", "America/Belize", "Europe/London", "Europe/Berlin", "Europe/Paris", "Europe/Madrid",
  "Asia/Kolkata", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney", "Pacific/Auckland",
];

export const timeZoneOptions = () => {
  try { return Intl.supportedValuesOf("timeZone"); }
  catch { return FALLBACK_TIME_ZONES; }
};

export const withCurrentOption = (options, current) => current && !options.includes(current) ? [current, ...options] : options;
export const withCurrentCountry = (current) => current && !COUNTRY_OPTIONS.some(option => option.code === current)
  ? [{ code: current, name: "Current country" }, ...COUNTRY_OPTIONS]
  : COUNTRY_OPTIONS;
