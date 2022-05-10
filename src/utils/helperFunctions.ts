import axios, { AxiosError } from 'axios';
import { TimeLocalised } from './types';

export const icon = (iconCode: string): string => {
    return __dirname + `/svg/${iconCode}.svg`;
};

export const getResponse = async (URL: string): Promise<any> => {
    return await axios
        .get(URL)
        .then((res) => res.data)
        .catch(async (err: AxiosError) =>
            console.error(`An API error has occurred | ${err}`)
        );
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
