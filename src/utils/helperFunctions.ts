import axios, { AxiosError } from 'axios';
import {
    BaseOpenWeatherArgs,
    DaytimeAndColourArgs,
    DaytimeAndColours,
    TimeLocalised,
} from './types';
import { join } from 'path';
import { SKRSContext2D } from '@napi-rs/canvas';

const getResponse = async (URL: string): Promise<any> => {
    return await axios
        .get(URL)
        .then((res) => res.data)
        .catch(async (err: AxiosError) =>
            console.error(`An API error has occurred | ${err}`)
        );
};

export const icon = (iconCode: string): string => {
    return join(__dirname, `../svg/${iconCode}.svg`);
};

export const uvIndexServeness = (uvIndex: number): string => {
    let uviServeness: string;

    if (uvIndex > 0 && uvIndex <= 2.5) uviServeness = 'Low';
    else if (uvIndex > 2.5 && uvIndex <= 5.5) uviServeness = 'Moderate';
    else if (uvIndex > 5.5 && uvIndex <= 7.5) uviServeness = 'High';
    else if (uvIndex > 7.5 && uvIndex <= 10.5) uviServeness = 'Very High';
    else if (uvIndex > 10.5) uviServeness = 'Extreme';
    else uviServeness = 'Error';

    return uviServeness;
};

export const dir = (deg: number): string => {
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

export const font = (size: number, name: string = 'Arial'): string => {
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

export const capitaliseFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const convertToKPH = (metrePerSec: number): number => {
    return metrePerSec * 3.6;
};

export const grabData = async (
    args: BaseOpenWeatherArgs
): Promise<{ weatherResponse: any; forecastResponse: any }> => {
    const { key, cityName, stateCode, countryCode, imperialUnits } = args;

    const units: string = imperialUnits ? `imperial` : `metric`;

    let query: string = cityName;
    if (stateCode) query += ',' + stateCode;
    if (countryCode) query += ',' + countryCode;

    const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${key}&units=${units}&lang={en}`;

    const weatherResponse = await getResponse(WEATHER_URL);

    const { coord } = await weatherResponse;
    const { lat, lon } = coord;

    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${key}&units=${units}&lang={en}`;
    const forecastResponse = await getResponse(FORECAST_URL);

    return { weatherResponse, forecastResponse };
};

export const getDaytimeAndColours = async (
    args: DaytimeAndColourArgs
): Promise<DaytimeAndColours> => {
    const { forecastResponse, theme } = args;

    const { current } = forecastResponse;
    const { dt, sunrise, sunset } = current;

    const dayTime = dt >= sunrise && dt < sunset;
    let textColour: string;
    let leftColour: string;
    let rightColour: string;

    if (dayTime) {
        textColour = theme.dayThemeText;
        leftColour = theme.dayThemeLeft;
        rightColour = theme.dayThemeRight;
    } else {
        textColour = theme.nightThemeText;
        leftColour = theme.nightThemeLeft;
        rightColour = theme.nightThemeRight;
    }

    return {
        dayTime,
        textColour,
        leftColour,
        rightColour,
    };
};

export const applyText = (
    ctx: SKRSContext2D,
    text: string,
    areaWidth: number,
    fontSize: number
) => {
    do {
        ctx.font = font(fontSize);
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

export const rain = (rainVolume: number, imperial: boolean) => {
    return imperial ? `${roundTo2(mmToIn(rainVolume))}in` : `${rainVolume}mm`;
};
