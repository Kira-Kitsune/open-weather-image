import axios, { AxiosError } from 'axios';
import {
    BaseOpenWeatherArgs,
    DaytimeAndColourArgs,
    DaytimeAndColours,
    TempUnit,
    GeocodingResponse,
    TimeLocalised,
} from './types';
import { SKRSContext2D } from '@napi-rs/canvas';

const FAHRENHEIT_PREFERRED_COUNTRIES = ['US', 'LR', 'MM'];

const getResponse = async (URL: string) => {
    return await axios
        .get(URL)
        .then((res) => res.data)
        .catch(async (err: AxiosError) =>
            console.error(`An API error has occurred | ${err}`)
        );
};

export const icon = (iconCode: string) => {
    switch (iconCode) {
        case '01d':
            return '\uf00d';
        case '01n':
            return '\uf02e';
        case '02d':
            return '\uf002';
        case '02n':
            return '\uf086';
        case '03d':
        case '03n':
            return '\uf041';
        case '04d':
        case '04n':
            return '\uf013';
        case '09d':
            return '\uf009';
        case '09n':
            return '\uf029';
        case '10d':
        case '10n':
            return '\uf019';
        case '11d':
        case '11n':
            return '\uf01e';
        case '13d':
        case '13n':
            return '\uf01b';
        case '50d':
            return '\uf003';
        case '50n':
            return '\uf04a';
        default:
            return '\uf07b';
    }
};

export const uvIndexServeness = (uvIndex: number) => {
    let uviServeness: string;

    if (uvIndex > 0 && uvIndex <= 2.5) uviServeness = 'Low';
    else if (uvIndex > 2.5 && uvIndex <= 5.5) uviServeness = 'Moderate';
    else if (uvIndex > 5.5 && uvIndex <= 7.5) uviServeness = 'High';
    else if (uvIndex > 7.5 && uvIndex <= 10.5) uviServeness = 'Very High';
    else if (uvIndex > 10.5) uviServeness = 'Extreme';
    else uviServeness = 'Error';

    return uviServeness;
};

export const dir = (deg: number) => {
    let dir: string;

    if (deg >= 0 && deg < 22.5) dir = 'N';
    else if (deg >= 22.5 && deg < 67.5) dir = 'NE';
    else if (deg >= 67.5 && deg < 112.5) dir = 'E';
    else if (deg >= 112.5 && deg < 157.5) dir = 'SE';
    else if (deg >= 157.5 && deg < 202.5) dir = 'S';
    else if (deg >= 202.5 && deg < 247.5) dir = 'SW';
    else if (deg >= 247.5 && deg < 292.5) dir = 'W';
    else if (deg >= 292.5 && deg < 337.5) dir = `NW`;
    else if (deg >= 337.5 && deg <= 360) dir = 'N';
    else dir = 'Error';

    return dir;
};

export const font = (size: number, name: string = 'Arial') => {
    return `${size}px ${name}`;
};

export const timestampConverter = (
    timestamp: number,
    timeZone: string
): TimeLocalised => {
    const date = new Date(timestamp * 1000);

    const timeOptions: Intl.DateTimeFormatOptions = {
        timeStyle: 'short',
        timeZone,
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        timeZone,
    };

    return {
        date: new Intl.DateTimeFormat('en-AU', dateOptions)
            .format(date)
            .replace(',', ''),
        time: new Intl.DateTimeFormat('en-AU', timeOptions).format(date),
    };
};

export const capitaliseFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const convertToKPH = (metrePerSec: number) => {
    return metrePerSec * 3.6;
};

export const grabData = async (args: BaseOpenWeatherArgs) => {
    const { key, cityName, stateCode, countryCode, tempUnit } = args;

    let query: string = cityName;
    if (stateCode) query += ',' + stateCode;
    if (countryCode) query += ',' + countryCode;

    const GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&appid=${key}&limit=1`;

    const geocodingResponse: GeocodingResponse[] = await getResponse(
        GEOCODING_URL
    );

    if (geocodingResponse.length === 0) {
        throw `Could not find location`;
    }

    const { lat, lon, country } = geocodingResponse[0];

    let tempUnitToUse = tempUnit || getTempUnitForCountry(country);

    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${key}&units=${tempUnitToUse}&lang={en}`;
    const forecastResponse = await getResponse(FORECAST_URL);

    return { geocodingResponse: geocodingResponse[0], forecastResponse };
};

export const getDaytimeAndColours = async (
    args: DaytimeAndColourArgs
): Promise<DaytimeAndColours> => {
    const { forecastResponse, theme } = args;

    const { current } = forecastResponse;
    const { dt, sunrise, sunset } = current;

    const dayTime = dt >= sunrise && dt < sunset;

    const {
        dayThemeLeft = '#FFD982',
        dayThemeRight = '#5ECEF6',
        dayThemeText = 'black',
        dayThemeSymbol = 'black',
        nightThemeLeft = '#25395C',
        nightThemeRight = '#1C2A4F',
        nightThemeText = 'white',
        nightThemeSymbol = 'white',
        forecastBgTheme = '#DDDDDD',
        forecastBoxTheme = '#EEEEEE',
        forecastText = 'black',
        forecastSymbolColour = 'black',
        forecastBoxDivider = 'black',
    } = theme;

    let textColour: string;
    let leftColour: string;
    let rightColour: string;
    let symbolColour: string;

    if (dayTime) {
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
        dayTime,
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
};

export const applyText = (
    ctx: SKRSContext2D,
    text: string,
    areaWidth: number,
    fontSize: number,
    fontName?: string
) => {
    do {
        ctx.font = font(fontSize, fontName);
        fontSize -= 2;
    } while (ctx.measureText(text).width > areaWidth);

    return ctx.font;
};

export const roundTo2 = (number: number): number => {
    return parseFloat(number.toFixed(2));
};

const mmToIn = (number: number): number => {
    return number / 25.4;
};

export const rain = (rainVolume: number, tempUnit: TempUnit) => {
    return isImperial(tempUnit)
        ? `${roundTo2(mmToIn(rainVolume))}in`
        : `${rainVolume}mm`;
};

export const getTempUnitForCountry = (country: string): TempUnit => {
    return FAHRENHEIT_PREFERRED_COUNTRIES.includes(country)
        ? 'imperial'
        : 'metric';
};

export const isImperial = (tempUnit: TempUnit) => {
    return tempUnit === 'imperial';
};
