export type TimeLocalised = {
	date: string;
	time: string;
};

/**
 * The styling and theming of the generated images.
 */
export interface Theme {
	dayThemeLeft?: string;
	dayThemeRight?: string;
	dayThemeText?: string;
	dayThemeSymbol?: string;
	nightThemeLeft?: string;
	nightThemeRight?: string;
	nightThemeText?: string;
	nightThemeSymbol?: string;
	forecastBgTheme?: string;
	forecastBoxTheme?: string;
	forecastSymbolColour?: string;
	forecastText?: string;
	forecastBoxDivider?: string;
}

export type DaytimeAndColours = {
	dayTime: boolean;
	textColour: string;
	leftColour: string;
	rightColour: string;
	symbolColour: string;
	forecastBgTheme: string;
	forecastBoxTheme: string;
	forecastText: string;
	forecastBoxDivider: string;
	forecastSymbolColour: string;
};

/**
 * The input into createWeatherImage
 */
export interface OpenWeatherArgs extends OpenWeatherArgsTheming {
	output?: "base64" | "buffer";
}

export interface OpenWeatherArgsBuffer extends OpenWeatherArgsTheming {
	output?: "buffer";
}

export interface OpenWeatherArgsBase64 extends OpenWeatherArgsTheming {
	output: "base64";
}

interface OpenWeatherArgsTheming extends BaseOpenWeatherArgs {
	theme?: Theme;
	withForecast?: boolean;
}

export type Units = "metric" | "imperial";

export interface BaseOpenWeatherArgs {
	key: string;
	cityName: string;
	stateCode?: string;
	countryCode?: string;
	units?: Units;
	locale?: "en" | "de";
}

export interface ColoursTimeArgs {
	dt: number;
	sunrise: number;
	sunset: number;
	theme: Theme;
}

export type ColoursTime = {
	isDay: boolean;
	textColour: string;
	leftColour: string;
	rightColour: string;
	symbolColour: string;
	forecastBgTheme: string;
	forecastBoxTheme: string;
	forecastText: string;
	forecastBoxDivider: string;
	forecastSymbolColour: string;
};

export interface DaytimeAndColoursArgs {
	forecastResponse: ForecastResponse;
	theme: Theme;
}

export type Locales =
	| "af"
	| "al"
	| "ar"
	| "az"
	| "bg"
	| "ca"
	| "cz"
	| "da"
	| "de"
	| "el"
	| "en"
	| "eu"
	| "fa"
	| "fi"
	| "fr"
	| "gl"
	| "he"
	| "hi"
	| "hr"
	| "hu"
	| "id"
	| "it"
	| "ja"
	| "kr"
	| "la"
	| "lt"
	| "mk"
	| "no"
	| "nl"
	| "no"
	| "nl"
	| "pl"
	| "pt"
	| "pt_br"
	| "ro"
	| "ru"
	| "sv"
	| "se"
	| "sk"
	| "sl"
	| "sp"
	| "es"
	| "sr"
	| "th"
	| "tr"
	| "ua"
	| "uk"
	| "vi"
	| "zh_cn"
	| "zh_tw"
	| "zu";

export interface I18nInterface {
	[locale: string]: {
		feels_like: string;
		wind: string;
		humidity: string;
		uvi: string;
		pop: string;
		todays_rain: string;
		rain_last_hour: string;
		todays_snow: string;
		snow_last_hour: string;
		uv_serveness: {
			low: string;
			moderate: string;
			high: string;
			very_high: string;
			extreme: string;
		};
		directions: {
			n: string;
			ne: string;
			e: string;
			se: string;
			s: string;
			sw: string;
			w: string;
			nw: string;
		};
		error: string;
	};
}

export interface GeocodingResponse {
	name: string;
	local_names: { [lang: string]: string };
	lat: number;
	lon: number;
	country: string;
	state: string;
}

export interface ForecastResponse {
	lat: number;
	lon: number;
	timezone: string;
	timezone_offest: number;
	current: {
		dt: number;
		sunrise: number;
		sunset: number;
		temp: number;
		feels_like: number;
		pressure: number;
		humidity: number;
		dew_point: number;
		clouds: number;
		uvi: number;
		visibility: number;
		wind_speed: number;
		wind_gust?: number;
		wind_deg: number;
		rain?: {
			"1h"?: number;
		};
		snow?: {
			"1h"?: number;
		};
		weather: {
			id: number;
			main: string;
			description: string;
			icon: string;
		}[];
	};
	daily: DayForecast[];
}

export interface DayForecast {
	dt: number;
	sunrise: number;
	sunset: number;
	moonrise: number;
	moonset: number;
	moon_phase: number;
	summary: string;
	temp: {
		morn: number;
		day: number;
		eve: number;
		night: number;
		min: number;
		max: number;
	};
	feels_like: {
		morn: number;
		day: number;
		eve: number;
		night: number;
	};
	pressure: number;
	humidity: number;
	dew_point: number;
	wind_speed: number;
	wind_gust?: number;
	wind_deg: number;
	clouds: number;
	uvi: number;
	pop: number;
	rain?: number;
	snow?: number;
	weather: {
		id: number;
		main: string;
		description: string;
		icon: string;
	}[];
}
