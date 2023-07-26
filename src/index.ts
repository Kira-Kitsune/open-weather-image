import {
    createCanvas,
    SKRSContext2D,
    Image,
    GlobalFonts,
} from '@napi-rs/canvas';
import { readFile } from 'fs/promises';
import {
    icon,
    uvIndexServeness,
    dir,
    font,
    timestampConverter,
    capitaliseFirstLetter,
    grabData,
    getDaytimeAndColours,
    convertToKPH,
    applyText,
    roundTo2,
    rain,
    isImperial,
    getTempUnitForCountry,
} from './utils/helperFunctions';
import {
    OpenWeatherArgs,
    GeocodingResponse,
    TempUnit,
    Theme,
} from './utils/types';
import { join } from 'path';

const currentHeight = 320;
const forecastHeight = 140;

const canvasWidth = 520;
let canvasHeight: number;

let dayTime: boolean;

let tempUnit: TempUnit;
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
const createWeatherImage = async (args: OpenWeatherArgs) => {
    const {
        stateCode,
        countryCode,
        bufferOutput,
        tempUnit,
        withForecast,
        theme,
    } = args;

    if (stateCode && !countryCode) {
        throw `stateCode requires a countryCode provided with it`;
    }

    const { geocodingResponse, forecastResponse } = await grabData(args);

    let geocodedCountryCode = geocodingResponse.country;

    await setupVariables(
        forecastResponse,
        withForecast,
        theme || {},
        tempUnit ? tempUnit : getTempUnitForCountry(geocodedCountryCode)
    );

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    console.log(__dirname);

    GlobalFonts.registerFromPath(
        join(__dirname, 'weathericons-font.ttf'),
        'Weather Icons'
    );

    drawBackground(ctx, withForecast);
    await drawCurrent(ctx, geocodingResponse, forecastResponse);
    withForecast && (await drawForecast(ctx, forecastResponse));

    return bufferOutput ? canvas.toBuffer('image/png') : canvas.toDataURL();
};

const drawCurrent = async (
    ctx: SKRSContext2D,
    geocodingResponse: GeocodingResponse,
    forecastResponse: any
) => {
    const { name, state, country } = geocodingResponse;
    const { current, daily, timezone } = forecastResponse;

    const {
        temp,
        feels_like,
        dt,
        wind_speed,
        wind_deg,
        sunrise: sunriseDT,
        sunset: sunsetDT,
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

    let leftPos: number;
    ctx.textAlign = 'center';
    ctx.fillStyle = symbolColour;

    ctx.font = font(80, 'Weather Icons');
    ctx.fillText(
        icon(dayTime ? iconToday : iconToday.replace('d', 'n')),
        canvasWidth * (2 / 3) + canvasWidth / 3 / 2,
        currentHeight / 2 + 30
    );

    ctx.textAlign = 'start';
    ctx.fillStyle = textColour;
    ctx.strokeStyle = textColour;

    leftPos = 22;

    ctx.font = font(10);
    const title: string = `${name}, ${country}`;
    applyText(ctx, title, canvasWidth * (2 / 3) - leftPos, 32);
    ctx.fillText(title, leftPos, 62);

    ctx.font = font(16);
    const { date, time } = timestampConverter(dt, timezone);
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
        `Feels Like: ${Math.round(feels_like)}${tempLabel}`,
        leftPos + tempWidth + 4,
        145
    );

    ctx.fillText(
        `${Math.round(tempMax)}${tempLabel} / ${Math.round(
            tempMin
        )}${tempLabel}`,
        leftPos,
        167.5
    );

    ctx.font = font(20, 'Weather Icons');
    ctx.fillText(icon(iconCurrent), leftPos, 191);

    ctx.font = font(16);
    ctx.fillText(capitaliseFirstLetter(description), 56, 191);

    ctx.beginPath();
    ctx.lineTo(15, 200);
    ctx.lineTo(304, 200);
    ctx.stroke();

    ctx.font = font(12);

    const { time: sunrise } = timestampConverter(sunriseDT, timezone);
    const { time: sunset } = timestampConverter(sunsetDT, timezone);

    const windSpeed: string = isImperial(tempUnit)
        ? `${roundTo2(wind_speed)}mph`
        : `${roundTo2(convertToKPH(wind_speed))}kph`;

    ctx.fillText(`Wind: ${windSpeed} (${dir(wind_deg)})`, leftPos, 218);
    ctx.fillText(`Humidity: ${humidity}%`, leftPos, 233);
    ctx.fillText(`UV Index: ${uvi} (${uvIndexServeness(uvi)})`, leftPos, 248);
    ctx.fillText(`Chance of Rain: ${Math.round(pop * 100)}%`, leftPos, 263);

    const nextLeftPos = canvasWidth / 3 + 26;
    let upPosRain = 278;

    if (rainToday) {
        ctx.fillText(
            `Today's Rain: ${rain(rainToday, tempUnit)}`,
            leftPos,
            upPosRain
        );
        if (!rainCurrent) {
            upPosRain += 15;
        }
    }

    if (rainCurrent) {
        ctx.fillText(
            `Rain Last Hour: ${rain(rainCurrent['1h'], tempUnit)}`,
            nextLeftPos - 15,
            upPosRain
        );
        upPosRain += 15;
    }

    if (snowToday) {
        ctx.fillText(
            `Today's Snow: ${rain(snowToday, tempUnit)}`,
            leftPos,
            upPosRain
        );
    }

    if (snowCurrent) {
        ctx.fillText(
            `Snow Last Hour: ${rain(snowCurrent['1h'], tempUnit)}`,
            nextLeftPos - 15,
            263
        );
    }

    ctx.font = font(24, 'Weather Icons');
    ctx.fillText('\uf051', nextLeftPos, 228);
    ctx.font = font(12);
    ctx.fillText(sunrise, nextLeftPos + 36, 221);

    ctx.font = font(24, 'Weather Icons');
    ctx.fillText('\uf052', nextLeftPos, 258);
    ctx.font = font(12);
    ctx.fillText(sunset, nextLeftPos + 36, 251);
};

const drawForecast = async (ctx: SKRSContext2D, forecastResponse: any) => {
    const { daily, timezone } = forecastResponse;

    for (let i = 0; i < 4; i++) {
        await drawForecastBox(ctx, daily[i + 1], timezone, i);
    }
};

const drawForecastBox = async (
    ctx: SKRSContext2D,
    dayForecast: any,
    timezone: string,
    boxNum: number
) => {
    ctx.fillStyle = forecastBoxColour;
    ctx.strokeStyle = forecastBoxDivider;

    ctx.textAlign = 'center';

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
    const { date } = timestampConverter(dt, timezone);

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
        forecastHeight - topPadding * 2
    );

    ctx.fillStyle = forecastText;
    ctx.font = font(12);

    ctx.fillText(date, centre, (topPos += 12), boxWidth - sidePadding * 2);

    topPos += 12;

    ctx.fillStyle = forecastSymbolColour;
    ctx.font = font(36, 'Weather Icons');
    ctx.fillText(icon(forecastIcon), centre, topPos + 32);

    ctx.font = font(10);
    ctx.fillText(
        capitaliseFirstLetter(description),
        centre,
        (topPos += 56),
        boxWidth - sidePadding * 2
    );

    ctx.fillText(
        `${Math.round(min)}${tempLabel} / ${Math.round(max)}${tempLabel}`,
        centre,
        boxBottom - 6
    );
};

const drawBackground = async (
    ctx: SKRSContext2D,
    forecast: boolean = false
) => {
    ctx.fillStyle = leftColour;
    ctx.fillRect(0, 0, canvasWidth * (2 / 3) + 1, currentHeight);

    ctx.fillStyle = rightColour;
    ctx.fillRect(canvasWidth * (2 / 3), 0, canvasWidth, currentHeight);

    if (forecast) {
        ctx.fillStyle = forecastBgColour;
        ctx.fillRect(0, currentHeight, canvasWidth, canvasHeight);
    }
};

const setupVariables = async (
    forecastResponse: any,
    withForecast: boolean = false,
    theme: Theme,
    tempUnit: TempUnit
) => {
    const {
        dayTime: dt,
        leftColour: lc,
        rightColour: rc,
        textColour: tc,
        symbolColour: sc,
        forecastBgTheme: fbg,
        forecastBoxTheme: fbox,
        forecastText: ft,
        forecastBoxDivider: fboxd,
        forecastSymbolColour: fsc,
    } = await getDaytimeAndColours({
        forecastResponse: await forecastResponse,
        theme,
    });

    dayTime = dt;
    leftColour = lc;
    rightColour = rc;
    textColour = tc;
    symbolColour = sc;
    forecastBgColour = fbg;
    forecastBoxColour = fbox;
    forecastText = ft;
    forecastBoxDivider = fboxd;
    forecastSymbolColour = fsc;

    tempLabel = isImperial(tempUnit) ? '°F' : '°C';

    canvasHeight = withForecast
        ? currentHeight + forecastHeight
        : currentHeight;
};

export { OpenWeatherArgs, createWeatherImage, Theme as ThemeInput, Theme };
