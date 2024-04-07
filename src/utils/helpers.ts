import type { SKRSContext2D } from "@napi-rs/canvas";
import type {
	BaseOpenWeatherArgs,
	ColoursTime,
	ColoursTimeArgs,
	ForecastResponse,
	GeocodingResponse,
	Locales,
	TimeLocalised,
	Units,
} from "./types";
import i18n from "./i18n";

export async function grabData(args: BaseOpenWeatherArgs) {
	const { key, cityName, stateCode, countryCode, units, locale } = args;

	let query = cityName;
	if (stateCode) query += `,${stateCode}`;
	if (countryCode) query += `,${countryCode}`;

	const GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&appid=${key}&limit=1`;
	const allGecodingResponses =
		await getResponse<GeocodingResponse[]>(GEOCODING_URL);

	if (allGecodingResponses === undefined || !allGecodingResponses.length)
		throw "Could not find the location, please try again!";

	const geocodingResponse = allGecodingResponses[0];
	const { lat, lon, country } = geocodingResponse;
	const unitsToUse = getUnits(country, units);

	const FORECAST_URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${key}&units=${unitsToUse}&lang=${locale}`;
	const forecastResponse = await getResponse<ForecastResponse>(FORECAST_URL);

	if (!forecastResponse) throw "Error getting forecast data.";

	return { geocodingResponse, forecastResponse };
}

async function getResponse<T>(URL: string) {
	try {
		const res = await fetch(URL);
		return (await res.json()) as T;
	} catch (err) {
		console.error(`An API error has occurred | ${err}`);
	}
}

const IMPERIAL_PREFERRED_COUNTRIES = ["US", "LR", "MM"];
export function getUnits(country: string, units?: Units): Units {
	if (units) return units;
	return IMPERIAL_PREFERRED_COUNTRIES.includes(country) ? "imperial" : "metric";
}

export function getColoursTime(args: ColoursTimeArgs): ColoursTime {
	const { dt, sunrise, sunset, theme } = args;
	const isDay = dt >= sunrise && dt < sunset;

	const {
		dayThemeLeft = "#FFD982",
		dayThemeRight = "#5ECEF6",
		dayThemeText = "black",
		dayThemeSymbol = "black",
		nightThemeLeft = "#25395C",
		nightThemeRight = "#1C2A4F",
		nightThemeText = "white",
		nightThemeSymbol = "white",
		forecastBgTheme = "#DDDDDD",
		forecastBoxTheme = "#EEEEEE",
		forecastText = "black",
		forecastSymbolColour = "black",
		forecastBoxDivider = "black",
	} = theme;

	let textColour: string;
	let leftColour: string;
	let rightColour: string;
	let symbolColour: string;

	if (isDay) {
		textColour = dayThemeText;
		leftColour = dayThemeLeft;
		rightColour = dayThemeRight;
		symbolColour = dayThemeSymbol;
	} else {
		textColour = nightThemeText;
		leftColour = nightThemeLeft;
		rightColour = nightThemeRight;
		symbolColour = nightThemeSymbol;
	}

	return {
		isDay,
		textColour,
		leftColour,
		rightColour,
		symbolColour,
		forecastBgTheme,
		forecastBoxTheme,
		forecastText,
		forecastBoxDivider,
		forecastSymbolColour,
	};
}

export function isImperial(tempUnit: Units) {
	return tempUnit === "imperial";
}

export function font(size: number, name = "Arial") {
	return `${size}px ${name}`;
}

export function icon(iconCode: string) {
	switch (iconCode) {
		case "01d":
			return "\uf00d";
		case "01n":
			return "\uf02e";
		case "02d":
			return "\uf002";
		case "02n":
			return "\uf086";
		case "03d":
		case "03n":
			return "\uf041";
		case "04d":
		case "04n":
			return "\uf013";
		case "09d":
			return "\uf009";
		case "09n":
			return "\uf029";
		case "10d":
		case "10n":
			return "\uf019";
		case "11d":
		case "11n":
			return "\uf01e";
		case "13d":
		case "13n":
			return "\uf01b";
		case "50d":
			return "\uf003";
		case "50n":
			return "\uf04a";
		default:
			return "\uf07b";
	}
}

export function fitText(
	ctx: SKRSContext2D,
	text: string,
	areaWidth: number,
	fontSizeBase: number,
	fontName?: string,
) {
	let fontSize = fontSizeBase;
	do {
		ctx.font = font(fontSize, fontName);
		fontSize -= 2;
	} while (ctx.measureText(text).width > areaWidth);

	return ctx.font;
}

export const timestampConverter = (
	timestamp: number,
	timeZone: string,
	locale: Locales,
): TimeLocalised => {
	const date = new Date(timestamp * 1000);

	const timeOptions: Intl.DateTimeFormatOptions = {
		timeStyle: "short",
		timeZone,
	};
	const dateOptions: Intl.DateTimeFormatOptions = {
		weekday: "short",
		month: "long",
		day: "numeric",
		timeZone,
	};

	return {
		date: new Intl.DateTimeFormat(locale, dateOptions)
			.format(date)
			.replace(",", ""),
		time: new Intl.DateTimeFormat(locale, timeOptions).format(date),
	};
};

export function capitaliseFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function convertToKPH(metrePerSec: number) {
	return metrePerSec * 3.6;
}

export function roundTo2(number: number) {
	return Number.parseFloat(number.toFixed(2));
}

export function dir(deg: number, locale: Locales) {
	let dir: string;

	if (deg >= 0 && deg < 22.5) dir = i18n[locale].directions.n;
	else if (deg >= 22.5 && deg < 67.5) dir = i18n[locale].directions.ne;
	else if (deg >= 67.5 && deg < 112.5) dir = i18n[locale].directions.e;
	else if (deg >= 112.5 && deg < 157.5) dir = i18n[locale].directions.se;
	else if (deg >= 157.5 && deg < 202.5) dir = i18n[locale].directions.s;
	else if (deg >= 202.5 && deg < 247.5) dir = i18n[locale].directions.sw;
	else if (deg >= 247.5 && deg < 292.5) dir = i18n[locale].directions.w;
	else if (deg >= 292.5 && deg < 337.5) dir = i18n[locale].directions.nw;
	else if (deg >= 337.5 && deg <= 360) dir = i18n[locale].directions.n;
	else dir = i18n[locale].error;

	return dir;
}

export function uvIndexServeness(uvIndex: number, locale: Locales) {
	let uviServeness: string;

	if (uvIndex > 0 && uvIndex <= 2.5)
		uviServeness = i18n[locale].uv_serveness.low;
	else if (uvIndex > 2.5 && uvIndex <= 5.5)
		uviServeness = i18n[locale].uv_serveness.moderate;
	else if (uvIndex > 5.5 && uvIndex <= 7.5)
		uviServeness = i18n[locale].uv_serveness.high;
	else if (uvIndex > 7.5 && uvIndex <= 10.5)
		uviServeness = i18n[locale].uv_serveness.very_high;
	else if (uvIndex > 10.5) uviServeness = i18n[locale].uv_serveness.extreme;
	else uviServeness = i18n[locale].error;

	return uviServeness;
}

export function fallAmount(volume: number, units: Units) {
	return isImperial(units) ? `${roundTo2(mmToIn(volume))}in` : `${volume}mm`;
}

function mmToIn(mm: number) {
	return mm / 25.4;
}
