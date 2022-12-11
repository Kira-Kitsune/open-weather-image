import { createCanvas, SKRSContext2D, Image } from '@napi-rs/canvas';
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
import { Theme } from './utils/theme';
import {
    OpenWeatherArgs,
    GeocodingResponse,
    TempUnit,
    ThemeInput,
} from './utils/types';

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

let forecastBgColour: string;
let forecastBoxColour: string;
let forecastText: string;
let forecastBoxDivider: string;

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
        theme ? theme : new Theme(),
        tempUnit ? tempUnit : getTempUnitForCountry(geocodedCountryCode)
    );

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

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

    const imgTodayFile = dayTime
        ? await readFile(icon(iconToday))
        : await readFile(icon(iconToday.replace('d', 'n')));
    const imgToday = new Image();
    imgToday.src = imgTodayFile;

    ctx.drawImage(imgToday, 383.333, 100, 100, 100);

    ctx.fillStyle = textColour;
    ctx.strokeStyle = textColour;

    leftPos = 22;

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
        `${Math.round(tempMin)}${tempLabel} / ${Math.round(
            tempMax
        )}${tempLabel}`,
        leftPos,
        167.5
    );

    ctx.font = font(16);
    ctx.fillText(capitaliseFirstLetter(description), 48, 191);

    const imgCurrentFile = await readFile(icon(iconCurrent));
    const imgCurrent = new Image();
    imgCurrent.src = imgCurrentFile;

    ctx.drawImage(imgCurrent, leftPos, 174, 22, 22);

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

    const imgSunriseFile = await readFile(
        icon(dayTime ? 'sunrised' : 'sunrisen')
    );
    const imgSunrise = new Image();
    imgSunrise.src = imgSunriseFile;

    const imgSunsetFile = await readFile(icon(dayTime ? 'sunsetd' : 'sunsetn'));
    const imgSunset = new Image();
    imgSunset.src = imgSunsetFile;

    ctx.drawImage(imgSunrise, nextLeftPos, 204, 44, 22);
    ctx.fillText(sunrise, nextLeftPos + 52, 221);

    ctx.drawImage(imgSunset, nextLeftPos, 234, 44, 22);
    ctx.fillText(sunset, nextLeftPos + 52, 251);
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

    const imgForecastFile = await readFile(icon(forecastIcon));
    const imgForecast = new Image();
    imgForecast.src = imgForecastFile;
    ctx.drawImage(imgForecast, centre - 20, topPos, 40, 40);

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
        forecastBgTheme: fbg,
        forecastBoxTheme: fbox,
        forecastText: ft,
        forecastBoxDivider: fboxd,
    } = await getDaytimeAndColours({
        forecastResponse: await forecastResponse,
        theme,
    });

    dayTime = dt;
    leftColour = lc;
    rightColour = rc;
    textColour = tc;
    forecastBgColour = fbg;
    forecastBoxColour = fbox;
    forecastText = ft;
    forecastBoxDivider = fboxd;

    tempLabel = isImperial(tempUnit) ? '°F' : '°C';

    canvasHeight = withForecast
        ? currentHeight + forecastHeight
        : currentHeight;
};

export { OpenWeatherArgs, createWeatherImage, ThemeInput, Theme };
