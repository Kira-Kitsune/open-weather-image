import axios, { AxiosError } from 'axios';
import { createCanvas } from 'canvas';

export interface IOpenWeatherImage {
    key: string;
    cityName: string;
    stateCode?: string;
    countryCode?: string;
}

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

const windArrow = (deg: number): string => {
    let windArrow: string;

    if (deg >= 0 && deg < 22.5) windArrow = '↑';
    else if (deg >= 22.5 && deg < 67.5) windArrow = '↗';
    else if (deg >= 67.5 && deg < 112.5) windArrow = '→';
    else if (deg >= 112.5 && deg < 157.5) windArrow = '↘';
    else if (deg >= 157.5 && deg < 202.5) windArrow = '↓';
    else if (deg >= 202.5 && deg < 247.5) windArrow = '↙';
    else if (deg >= 247.5 && deg < 292.5) windArrow = '←';
    else if (deg >= 292.5 && deg < 337.5) windArrow = `↖`;
    else if (deg >= 337.5 && deg <= 360) windArrow = '↑';
    else windArrow = 'Error';

    return windArrow;
};

const font = (size: number, name: string = 'Arial'): string => {
    return `${size}px ${name}`;
};

export const createWeatherImageToday = async (args: IOpenWeatherImage) => {
    const { key, cityName, stateCode, countryCode } = args;

    let query: string = cityName;
    if (stateCode) query.concat(', ', stateCode);
    if (countryCode) query.concat(', ', countryCode);

    const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${key}&units=metric&lang={en}`;

    const weatherResponse = await getResponse(WEATHER_URL);

    const { coord, weather, main, wind, name, sys, timezone, cod } =
        await weatherResponse;
    const { lat, lon } = coord;

    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=${key}&units=metric&lang={en}`;
    const forecastResponse = await getResponse(FORECAST_URL);

    const { daily } = forecastResponse;
    const today = daily[0];
    // const tomorrow = daily[1];
    // const secondDay = daily[2];
    // const thirdDay = daily[3];
    // const fourthDay = daily[4];

    const canvas = createCanvas(520, 300);
    const ctx = canvas.getContext('2d');

    let leftPos: number;

    ctx.fillStyle = '#019AF3';
    ctx.fillRect(0, 0, (canvas.width * 2) / 3 + 1, canvas.height);
    ctx.fillStyle = '#0184D0';
    ctx.fillRect((canvas.width * 2) / 3, 0, canvas.width, canvas.height);

    leftPos = 22;
    ctx.font = font(32);
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.fillText(`${name}, ${sys.country}`, leftPos, 52);

    ctx.font = font(16);
    ctx.fillText(`Wed 22 August // 10:00pm`, leftPos, 85);

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.lineTo(15, 100);
    ctx.lineTo(304, 100);
    ctx.stroke();

    ctx.font = font(45);
    ctx.fillText(`${main.temp}°C`, leftPos, 130);

    ctx.font = font(12);
    ctx.fillText(`${today.temp.min} / ${today.temp.max}°C`, leftPos, 160);

    ctx.beginPath();
    ctx.lineTo(15, 200);
    ctx.lineTo(304, 200);
    ctx.stroke();

    console.log(canvas.toDataURL());
};
