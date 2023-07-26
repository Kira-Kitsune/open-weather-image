export type TimeLocalised = {
    date: string;
    time: string;
};

export interface Theme {
    dayThemeLeft?: string;
    dayThemeRight?: string;
    dayThemeText?: string;
    dayThemeSymbol?: string;
    nightThemeLeft?: string;
    nightThemeRight?: string;
    nightThemeText?: string;
    nightThemeSymbol?: string;
    forecastBgTheme?: string;
    forecastBoxTheme?: string;
    forecastSymbolColour?: string;
    forecastText?: string;
    forecastBoxDivider?: string;
}

export type DaytimeAndColours = {
    dayTime: boolean;
    textColour: string;
    leftColour: string;
    rightColour: string;
    symbolColour: string;
    forecastBgTheme: string;
    forecastBoxTheme: string;
    forecastText: string;
    forecastBoxDivider: string;
    forecastSymbolColour: string;
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
