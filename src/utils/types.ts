export type TimeLocalised = {
    date: string;
    time: string;
};

export type DaytimeAndColours = {
    dayTime: boolean;
    textColour: string;
    leftColour: string;
    rightColour: string;
};

export interface Theme {
    dayThemeLeft: string;
    dayThemeRight: string;
    dayThemeText: string;
    nightThemeLeft: string;
    nightThemeRight: string;
    nightThemeText: string;
}

export interface OpenWeatherArgs extends BaseOpenWeatherArgs {
    bufferOutput?: boolean;
}

export interface BaseOpenWeatherArgs {
    key: string;
    cityName: string;
    stateCode?: string;
    countryCode?: string;
    imperialUnits?: boolean;
}

export interface DaytimeAndColourArgs {
    forecastResponse: any;
    theme: Theme;
}
