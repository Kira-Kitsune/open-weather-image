import { GlobalFonts, type SKRSContext2D, createCanvas } from "@napi-rs/canvas";
import type {
	ForecastResponse,
	OpenWeatherArgs,
	OpenWeatherArgsBase64,
	OpenWeatherArgsBuffer,
	Theme,
	Units,
	Locales,
	GeocodingResponse,
	DayForecast,
} from "./utils/types";
import {
	getColoursTime,
	getUnits,
	grabData,
	icon,
	isImperial,
	font,
	fitText,
	timestampConverter,
	capitaliseFirstLetter,
	convertToKPH,
	roundTo2,
	dir,
	uvIndexServeness,
	fallAmount,
} from "./utils/helpers";
import { join } from "node:path";
import i18n from "./utils/i18n";

const currentHeight = 320;
const forecastHeight = 140;

const canvasWidth = 520;
let canvasHeight: number;

let isDay: boolean;

let locale: Locales;
let units: Units;
let tempLabel: string;

let leftColour: string;
let rightColour: string;
let textColour: string;
let symbolColour: string;

let forecastBgColour: string;
let forecastBoxColour: string;
let forecastText: string;
let forecastBoxDivider: string;
let forecastSymbolColour: string;

// Weather Icons font https://erikflowers.github.io/weather-icons/

async function createWeatherImage(args: OpenWeatherArgsBase64): Promise<string>;
async function createWeatherImage(args: OpenWeatherArgsBuffer): Promise<Buffer>;
async function createWeatherImage(args: OpenWeatherArgs) {
	const { output, stateCode, countryCode, theme, units, withForecast } = args;
	if (!args.locale) args.locale = "en";

	if (stateCode && !countryCode) {
		throw "stateCode requires a countryCode to be provided with it.";
	}

	const { geocodingResponse, forecastResponse } = await grabData(args);

	setVariables(
		forecastResponse,
		theme ?? {},
		getUnits(geocodingResponse.country, units),
		args.locale,
		withForecast,
	);

	const canvas = createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext("2d");

	GlobalFonts.registerFromPath(
		join(__dirname, "weathericons-font.ttf"),
		"Weather Icons",
	);

	drawBackground(ctx, withForecast);
	await drawCurrent(ctx, geocodingResponse, forecastResponse);
	withForecast && (await drawForecast(ctx, forecastResponse));

	switch (output) {
		case "base64":
			return canvas.toDataURL("image/png");
		default:
			return canvas.toBuffer("image/png");
	}
}

function drawBackground(ctx: SKRSContext2D, withForecast?: boolean) {
	ctx.fillStyle = leftColour;
	ctx.fillRect(0, 0, canvasWidth * (2 / 3) + 1, currentHeight);

	ctx.fillStyle = rightColour;
	ctx.fillRect(canvasWidth * (2 / 3), 0, canvasWidth, currentHeight);

	if (withForecast) {
		ctx.fillStyle = forecastBgColour;
		ctx.fillRect(0, currentHeight, canvasWidth, canvasHeight);
	}
}

async function drawCurrent(
	ctx: SKRSContext2D,
	geocodingResponse: GeocodingResponse,
	forecastResponse: ForecastResponse,
) {
	const { local_names, country, name: baseName } = geocodingResponse;
	const { current, daily, timezone } = forecastResponse;

	const {
		temp,
		feels_like,
		dt,
		wind_speed,
		wind_deg,
		sunrise: sunriseTS,
		sunset: sunsetTS,
		humidity,
		weather: currentWeather,
		rain: rainCurrent,
		snow: snowCurrent,
	} = current;
	const { description, icon: iconCurrent } = currentWeather[0];

	const today = daily[0];
	const {
		temp: tempToday,
		uvi,
		pop,
		weather: weatherToday,
		rain: rainToday,
		snow: snowToday,
	} = today;

	const { min: tempMin, max: tempMax } = tempToday;
	const { icon: iconToday } = weatherToday[0];

	const leftPos = 22;
	ctx.textAlign = "center";
	ctx.fillStyle = symbolColour;

	ctx.font = font(80, "Weather Icons");
	ctx.fillText(
		icon(isDay ? iconToday : iconToday.replace("d", "n")),
		canvasWidth * (2 / 3) + canvasWidth / 3 / 2,
		currentHeight / 2 + 30,
	);

	ctx.textAlign = "start";
	ctx.fillStyle = textColour;
	ctx.strokeStyle = textColour;

	ctx.font = font(10);
	const name = local_names[locale] ?? baseName;
	const title: string = `${name}, ${country}`;
	fitText(ctx, title, canvasWidth * (2 / 3) - leftPos, 32);
	ctx.fillText(title, leftPos, 62);

	ctx.font = font(16);
	const { date, time } = timestampConverter(dt, timezone, locale);
	ctx.fillText(`${date} // ${time}`, leftPos, 88);

	ctx.lineWidth = 0.5;
	ctx.beginPath();
	ctx.lineTo(15, 100);
	ctx.lineTo(304, 100);
	ctx.stroke();

	ctx.font = font(44);
	const currentTemp: string = `${Math.round(temp)}${tempLabel}`;
	const { width: tempWidth } = ctx.measureText(currentTemp);
	ctx.fillText(currentTemp, leftPos - 2, 145);

	ctx.font = font(16);
	ctx.fillText(
		`${i18n[locale].feels_like} ${Math.round(feels_like)}${tempLabel}`,
		leftPos + tempWidth + 4,
		145,
	);

	ctx.fillText(
		`${Math.round(tempMax)}${tempLabel} / ${Math.round(tempMin)}${tempLabel}`,
		leftPos,
		167.5,
	);

	ctx.font = font(20, "Weather Icons");
	ctx.fillText(icon(iconCurrent), leftPos, 191);

	ctx.font = font(16);
	// Maybe change to only do in "en" locale
	ctx.fillText(capitaliseFirstLetter(description), 56, 191);

	ctx.beginPath();
	ctx.lineTo(15, 200);
	ctx.lineTo(304, 200);
	ctx.stroke();

	ctx.font = font(12);

	const { time: sunrise } = timestampConverter(sunriseTS, timezone, locale);
	const { time: sunset } = timestampConverter(sunsetTS, timezone, locale);

	const windSpeed: string = isImperial(units)
		? `${roundTo2(wind_speed)}mph`
		: `${roundTo2(convertToKPH(wind_speed))}kph`;

	ctx.fillText(
		`${i18n[locale].wind} ${windSpeed} (${dir(wind_deg, locale)})`,
		leftPos,
		218,
	);
	ctx.fillText(`${i18n[locale].humidity} ${humidity}%`, leftPos, 233);
	ctx.fillText(
		`${i18n[locale].uvi} ${uvi} (${uvIndexServeness(uvi, locale)})`,
		leftPos,
		248,
	);
	ctx.fillText(`${i18n[locale].pop} ${Math.round(pop * 100)}%`, leftPos, 263);

	const nextLeftPos = canvasWidth / 3 + 26;
	let upPosRain = 278;

	if (rainToday) {
		ctx.fillText(
			`${i18n[locale].todays_rain} ${fallAmount(rainToday, units)}`,
			leftPos,
			upPosRain,
		);
		if (!rainCurrent) {
			upPosRain += 15;
		}
	}

	if (rainCurrent?.["1h"]) {
		ctx.fillText(
			`${i18n[locale].rain_last_hour} ${fallAmount(rainCurrent["1h"], units)}`,
			nextLeftPos - 15,
			upPosRain,
		);
		upPosRain += 15;
	}

	if (snowToday) {
		ctx.fillText(
			`${i18n[locale].todays_snow} ${fallAmount(snowToday, units)}`,
			leftPos,
			upPosRain,
		);
	}

	if (snowCurrent?.["1h"]) {
		ctx.fillText(
			`${i18n[locale].snow_last_hour} ${fallAmount(snowCurrent["1h"], units)}`,
			nextLeftPos - 15,
			263,
		);
	}

	ctx.font = font(24, "Weather Icons");
	ctx.fillText("\uf051", nextLeftPos, 228);
	ctx.font = font(12);
	ctx.fillText(sunrise, nextLeftPos + 36, 221);

	ctx.font = font(24, "Weather Icons");
	ctx.fillText("\uf052", nextLeftPos, 258);
	ctx.font = font(12);
	ctx.fillText(sunset, nextLeftPos + 36, 251);
}

async function drawForecast(
	ctx: SKRSContext2D,
	forecastResponse: ForecastResponse,
) {
	const { daily, timezone } = forecastResponse;

	for (let i = 0; i < 4; i++) {
		await drawForecastBox(ctx, daily[i + 1], timezone, i);
	}
}

async function drawForecastBox(
	ctx: SKRSContext2D,
	dayForecast: DayForecast,
	timezone: string,
	boxNum: number,
) {
	ctx.fillStyle = forecastBoxColour;
	ctx.strokeStyle = forecastBoxDivider;

	ctx.textAlign = "center";

	ctx.lineWidth = 1;

	const topPadding: number = 15;
	const sidePadding: number = 12;

	const boxWidth = canvasWidth / 4;
	const boxBottom = canvasHeight - topPadding;

	const leftPos = boxWidth * boxNum + sidePadding;
	const centre = boxWidth * boxNum + boxWidth / 2;
	let topPos = currentHeight + topPadding;

	const { dt, temp, weather } = dayForecast;
	const { min, max } = temp;
	const { description, icon: forecastIcon } = weather[0];
	const { date } = timestampConverter(dt, timezone, locale);

	if (boxNum !== 0) {
		ctx.beginPath();
		ctx.lineTo(boxWidth * boxNum, topPos);
		ctx.lineTo(boxWidth * boxNum, canvasHeight - topPadding);
		ctx.stroke();
	}

	ctx.fillRect(
		leftPos,
		topPos,
		boxWidth - sidePadding * 2,
		forecastHeight - topPadding * 2,
	);

	ctx.fillStyle = forecastText;
	ctx.font = font(12);

	topPos += 12;
	ctx.fillText(date, centre, topPos, boxWidth - sidePadding * 2);
	topPos += 12;

	ctx.fillStyle = forecastSymbolColour;
	ctx.font = font(36, "Weather Icons");
	ctx.fillText(icon(forecastIcon), centre, topPos + 32);

	ctx.font = font(10);
	topPos += 56;
	ctx.fillText(
		capitaliseFirstLetter(description),
		centre,
		topPos,
		boxWidth - sidePadding * 2,
	);

	ctx.fillText(
		`${Math.round(max)}${tempLabel} / ${Math.round(min)}${tempLabel}`,
		centre,
		boxBottom - 6,
	);
}

function setVariables(
	forecastResponse: ForecastResponse,
	theme: Theme,
	unitsType: Units,
	localeType: Locales,
	withForecast = false,
) {
	const { dt, sunrise, sunset } = forecastResponse.current;

	const {
		isDay: id,
		leftColour: lc,
		rightColour: rc,
		textColour: tc,
		symbolColour: sc,
		forecastBgTheme: fbg,
		forecastBoxTheme: fbox,
		forecastText: ft,
		forecastBoxDivider: fboxd,
		forecastSymbolColour: fsc,
	} = getColoursTime({
		dt,
		sunrise,
		sunset,
		theme,
	});

	isDay = id;
	leftColour = lc;
	rightColour = rc;
	textColour = tc;
	symbolColour = sc;
	forecastBgColour = fbg;
	forecastBoxColour = fbox;
	forecastText = ft;
	forecastBoxDivider = fboxd;
	forecastSymbolColour = fsc;

	units = unitsType;
	locale = localeType;
	tempLabel = isImperial(units) ? "°F" : "°C";
	canvasHeight = withForecast ? currentHeight + forecastHeight : currentHeight;
}

export { createWeatherImage, type Theme, type OpenWeatherArgs };
