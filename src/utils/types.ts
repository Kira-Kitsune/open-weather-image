import { Theme } from './theme';

export type TimeLocalised = {
    date: string;
    time: string;
};

export interface ThemeInput {
    dayThemeLeft?: string;
    dayThemeRight?: string;
    dayThemeText?: string;
    nightThemeLeft?: string;
    nightThemeRight?: string;
    nightThemeText?: string;
    forecastBgTheme?: string;
    forecastBoxTheme?: string;
    forecastText?: string;
    forecastBoxDivider?: string;
}

export type DaytimeAndColours = {
    dayTime: boolean;
    textColour: string;
    leftColour: string;
    rightColour: string;
    forecastBgTheme: string;
    forecastBoxTheme: string;
    forecastText: string;
    forecastBoxDivider: string;
};

export interface OpenWeatherArgs extends BaseOpenWeatherArgs {
    bufferOutput?: boolean;
    theme?: Theme;
    withForecast?: boolean;
}

export type TempUnit = 'metric' | 'imperial';

export interface BaseOpenWeatherArgs {
    key: string;
    cityName: string;
    stateCode?: string;
    countryCode?: string;
    tempUnit?: TempUnit;
}

export interface DaytimeAndColourArgs {
    forecastResponse: any;
    theme: Theme;
}

export interface GeocodingResponse {
    name: string;
    local_names: { [lang: string]: string };
    lat: number;
    lon: number;
    country: string;
    state: string;
}
