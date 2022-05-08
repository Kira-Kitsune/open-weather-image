import axios, { AxiosError } from 'axios';
import { createCanvas, CanvasRenderingContext2D, loadImage } from 'canvas';

const defaultTheme = {
    dayThemeLeft: '#FFD982',
    dayThemeRight: '#5ECEF6',
    dayThemeText: 'black',
    nightThemeLeft: '#25395C',
    nightThemeRight: '#1C2A4F',
    nightThemeText: 'white',
};

export interface OpenWeatherArgs {
    key: string;
    cityName: string;
    stateCode?: string;
    countryCode?: string;
}

type TimeLocalised = {
    date: string;
    time: string;
};

const icon = (iconCode: string): string => {
    return __dirname + `/svg/${iconCode}.svg`;
};

const getResponse = async (URL: string): Promise<any> => {
    return await axios
        .get(URL)
        .then((res) => res.data)
        .catch(async (err: AxiosError) =>
            console.error(`An API error has occurred | ${err}`)
        );
};

const uvIndexServeness = (uvIndex: number): string => {
    let uviServeness: string;

    if (uvIndex > 0 && uvIndex <= 2.5) uviServeness = 'Low';
    else if (uvIndex > 2.5 && uvIndex <= 5.5) uviServeness = 'Moderate';
    else if (uvIndex > 5.5 && uvIndex <= 7.5) uviServeness = 'High';
    else if (uvIndex > 7.5 && uvIndex <= 10.5) uviServeness = 'Very High';
    else if (uvIndex > 10.5) uviServeness = 'Extreme';
    else uviServeness = 'Error';

    return uviServeness;
};

const dir = (deg: number): string => {
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

const font = (size: number, name: string = 'Arial'): string => {
    return `${size}px ${name}`;
};

const timestampConverter = (
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

const capitaliseFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const createWeatherImageToday = async (
    args: OpenWeatherArgs
): Promise<string> => {
    const { key, cityName, stateCode, countryCode } = args;

    let query: string = cityName;
    if (stateCode) query.concat(',', stateCode);
    if (countryCode) query.concat(',', countryCode);

    const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${key}&units=metric&lang={en}`;

    const weatherResponse = await getResponse(WEATHER_URL);

    const { coord } = await weatherResponse;
    const { lat, lon } = coord;

    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${key}&units=metric&lang={en}`;
    const forecastResponse = await getResponse(FORECAST_URL);

    const currentWidth = 520;
    const canvasWidth = currentWidth;
    const currentHeight = 320;
    const canvasHeight = currentHeight;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    await createCurrentCtx(
        ctx,
        currentWidth,
        currentHeight,
        await weatherResponse,
        await forecastResponse
    );

    return canvas.toDataURL();
};

const createCurrentCtx = async (
    ctx: CanvasRenderingContext2D,
    currentWidth: number,
    currentHeight: number,
    weatherResponse: any,
    forecastResponse: any,
    theme = defaultTheme
) => {
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
    let leftColour: string;
    let rightColour: string;
    let colour;

    const dayTime: boolean = dt >= sunriseDT && dt < sunsetDT;

    if (dayTime) {
        leftColour = theme.dayThemeLeft;
        rightColour = theme.dayThemeRight;
        colour = theme.dayThemeText;
    } else {
        leftColour = theme.nightThemeLeft;
        rightColour = theme.nightThemeRight;
        colour = theme.nightThemeText;
    }

    ctx.fillStyle = leftColour;
    ctx.fillRect(0, 0, (currentWidth * 2) / 3 + 21, currentHeight + 20);

    ctx.fillStyle = rightColour;
    ctx.fillRect(
        (currentWidth * 2) / 3,
        0,
        currentWidth + 20,
        currentHeight + 20
    );

    const imgToday = dayTime
        ? await loadImage(icon(iconToday))
        : await loadImage(icon(iconToday.replace('d', 'n')));

    ctx.drawImage(imgToday, 383.333, 100, 100, 100);

    ctx.fillStyle = colour;
    ctx.strokeStyle = colour;

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
    ctx.fillText(`Today's Chance of Rain: ${pop * 100}%`, leftPos, 263);

    const nextLeftPos = currentWidth / 3 + 26;
    let upPosRain = 278;

    if (rainToday) {
        ctx.fillText(`Today's Rain: ${rainToday}mm`, leftPos, upPosRain);
        if (!rainCurrent) {
            upPosRain += 15;
        }
    }

    if (rainCurrent) {
        ctx.fillText(
            `Rain Last 1hr: ${rainCurrent['1h']}mm`,
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
            `Snow Last 1hr: ${snowCurrent['1h']}mm`,
            nextLeftPos - 15,
            263
        );
    }

    const imgSunrise = await loadImage(icon(dayTime ? 'sunrised' : 'sunrisen'));
    ctx.drawImage(imgSunrise, nextLeftPos, 204, 44, 22);
    ctx.fillText(`${sunrise}`, nextLeftPos + 52, 221);

    const imgSunset = await loadImage(icon(dayTime ? 'sunsetd' : 'sunsetn'));
    ctx.drawImage(imgSunset, nextLeftPos, 234, 44, 22);
    ctx.fillText(`${sunset}`, nextLeftPos + 52, 251);
};
