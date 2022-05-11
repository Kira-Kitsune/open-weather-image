import { createCanvas, CanvasRenderingContext2D, loadImage } from 'canvas';
import {
    icon,
    uvIndexServeness,
    dir,
    font,
    timestampConverter,
    capitaliseFirstLetter,
    grabData,
    getDaytimeAndColours,
} from './utils/helperFunctions';
import { OpenWeatherArgs, Theme } from './utils/types';

const defaultTheme: Theme = {
    dayThemeLeft: '#FFD982',
    dayThemeRight: '#5ECEF6',
    dayThemeText: 'black',
    nightThemeLeft: '#25395C',
    nightThemeRight: '#1C2A4F',
    nightThemeText: 'white',
};

const canvasWidth: number = 520;
const currentHeight: number = 320;
const forecastHeight: number = 140;

const canvasHeight: number = currentHeight + forecastHeight;

let dayTime: boolean;

let leftColour: string;
let rightColour: string;
let textColour: string;

const createWeatherImageToday = async (
    args: OpenWeatherArgs
): Promise<string> => {
    const { weatherResponse, forecastResponse } = await grabData(args);

    const canvas = createCanvas(canvasWidth, currentHeight);
    const ctx = canvas.getContext('2d');

    const {
        dayTime: dt,
        leftColour: lc,
        rightColour: rc,
        textColour: tc,
    } = await getDaytimeAndColours({
        forecastResponse: await forecastResponse,
        theme: defaultTheme,
    });

    dayTime = dt;
    leftColour = lc;
    rightColour = rc;
    textColour = tc;

    drawBackground(ctx);
    await drawCurrent(ctx, await weatherResponse, await forecastResponse);

    return canvas.toDataURL();
};

const createWeatherImageTodayWithForecast = async (
    args: OpenWeatherArgs
): Promise<string | Buffer> => {
    const { weatherResponse, forecastResponse } = await grabData(args);
    const { bufferOutput } = args;

    const {
        dayTime: dt,
        leftColour: lc,
        rightColour: rc,
        textColour: tc,
    } = await getDaytimeAndColours({
        forecastResponse: await forecastResponse,
        theme: defaultTheme,
    });

    dayTime = dt;
    leftColour = lc;
    rightColour = rc;
    textColour = tc;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, true);
    await drawCurrent(ctx, await weatherResponse, await forecastResponse);
    await drawForecast(ctx, await forecastResponse);

    if (!bufferOutput) {
        return canvas.toDataURL();
    } else {
        return canvas.toBuffer('image/png');
    }
};

const drawCurrent = async (
    ctx: CanvasRenderingContext2D,
    weatherResponse: any,
    forecastResponse: any
): Promise<void> => {
    const { name, sys } = weatherResponse;
    const { country } = sys;

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

    const imgToday = dayTime
        ? await loadImage(icon(iconToday))
        : await loadImage(icon(iconToday.replace('d', 'n')));

    ctx.drawImage(imgToday, 383.333, 100, 100, 100);

    ctx.fillStyle = textColour;
    ctx.strokeStyle = textColour;

    leftPos = 22;

    ctx.font = font(32);
    ctx.fillText(`${name}, ${country}`, leftPos, 62);

    ctx.font = font(16);
    const { date, time } = timestampConverter(dt, timezone);
    ctx.fillText(`${date} // ${time}`, leftPos, 88);

    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.lineTo(15, 100);
    ctx.lineTo(304, 100);
    ctx.stroke();

    ctx.font = font(44);
    const currentTemp: string = `${Math.round(temp)}°C`;
    const { width: tempWidth } = ctx.measureText(currentTemp);
    ctx.fillText(currentTemp, leftPos - 2, 145);

    ctx.font = font(16);
    ctx.fillText(
        `Feels Like: ${Math.round(feels_like)}°C`,
        leftPos + tempWidth + 4,
        145
    );

    ctx.fillText(
        `${Math.round(tempMin)}°C / ${Math.round(tempMax)}°C`,
        leftPos,
        167.5
    );

    ctx.font = font(16);
    ctx.fillText(capitaliseFirstLetter(description), 48, 191);

    const imgCurrent = await loadImage(icon(iconCurrent));
    ctx.drawImage(imgCurrent, leftPos, 174, 22, 22);

    ctx.beginPath();
    ctx.lineTo(15, 200);
    ctx.lineTo(304, 200);
    ctx.stroke();

    ctx.font = font(12);

    const { time: sunrise } = timestampConverter(sunriseDT, timezone);
    const { time: sunset } = timestampConverter(sunsetDT, timezone);

    ctx.fillText(`Wind: ${wind_speed}km/h (${dir(wind_deg)})`, leftPos, 218);
    ctx.fillText(`Humidity: ${humidity}%`, leftPos, 233);
    ctx.fillText(`UV Index: ${uvi} (${uvIndexServeness(uvi)})`, leftPos, 248);
    ctx.fillText(`Chance of Rain: ${pop * 100}%`, leftPos, 263);

    const nextLeftPos = canvasWidth / 3 + 26;
    let upPosRain = 278;

    if (rainToday) {
        ctx.fillText(`Today's Rain: ${rainToday}mm`, leftPos, upPosRain);
        if (!rainCurrent) {
            upPosRain += 15;
        }
    }

    if (rainCurrent) {
        ctx.fillText(
            `Rain Last Hour: ${rainCurrent['1h']}mm`,
            nextLeftPos - 15,
            upPosRain
        );
        upPosRain += 15;
    }

    if (snowToday) {
        ctx.fillText(`Today's Snow: ${snowToday}mm`, leftPos, upPosRain);
    }

    if (snowCurrent) {
        ctx.fillText(
            `Snow Last Hour: ${snowCurrent['1h']}mm`,
            nextLeftPos - 15,
            263
        );
    }

    const imgSunrise = await loadImage(icon(dayTime ? 'sunrised' : 'sunrisen'));
    ctx.drawImage(imgSunrise, nextLeftPos, 204, 44, 22);
    ctx.fillText(sunrise, nextLeftPos + 52, 221);

    const imgSunset = await loadImage(icon(dayTime ? 'sunsetd' : 'sunsetn'));
    ctx.drawImage(imgSunset, nextLeftPos, 234, 44, 22);
    ctx.fillText(sunset, nextLeftPos + 52, 251);
};

const drawForecast = async (
    ctx: CanvasRenderingContext2D,
    forecastResponse: any
): Promise<void> => {
    const { daily, timezone } = forecastResponse;

    for (let i = 0; i < 4; i++) {
        await drawForecastBox(ctx, daily[i + 1], timezone, i);
    }
};

const drawForecastBox = async (
    ctx: CanvasRenderingContext2D,
    dayForecast: any,
    timezone: string,
    boxNum: number
): Promise<void> => {
    ctx.fillStyle = '#EEEEEE';
    ctx.strokeStyle = 'black';

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

    ctx.fillStyle = 'black';
    ctx.font = font(12);

    ctx.fillText(date, centre, (topPos += 12), boxWidth - sidePadding * 2);

    topPos += 12;
    const imgForecast = await loadImage(icon(forecastIcon));
    ctx.drawImage(imgForecast, centre - 20, topPos, 40, 40);

    ctx.font = font(10);
    ctx.fillText(
        capitaliseFirstLetter(description),
        centre,
        (topPos += 56),
        boxWidth - sidePadding * 2
    );

    ctx.fillText(
        `${Math.round(min)}°C / ${Math.round(max)}°C`,
        centre,
        boxBottom - 6
    );
};

const drawBackground = (
    ctx: CanvasRenderingContext2D,
    forecast: boolean = false
): void => {
    ctx.fillStyle = leftColour;
    ctx.fillRect(0, 0, canvasWidth * (2 / 3) + 1, currentHeight);

    ctx.fillStyle = rightColour;
    ctx.fillRect(canvasWidth * (2 / 3), 0, canvasWidth, currentHeight);

    if (forecast) {
        ctx.fillStyle = '#DDDDDD';
        ctx.fillRect(0, currentHeight, canvasWidth, canvasHeight);
    }
};

export {
    OpenWeatherArgs,
    createWeatherImageToday,
    createWeatherImageTodayWithForecast,
};
