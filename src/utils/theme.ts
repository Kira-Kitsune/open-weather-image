import { ThemeInput } from './types';

export class Theme {
    dayThemeLeft: string;
    dayThemeRight: string;
    dayThemeText: string;
    nightThemeLeft: string;
    nightThemeRight: string;
    nightThemeText: string;

    forecastBgTheme: string;
    forecastBoxTheme: string;
    forecastText: string;
    forecastBoxDivider: string;

    constructor(args?: ThemeInput) {
        if (args) {
            const {
                dayThemeLeft,
                dayThemeRight,
                dayThemeText,
                nightThemeLeft,
                nightThemeRight,
                nightThemeText,
                forecastBgTheme,
                forecastBoxTheme,
                forecastText,
                forecastBoxDivider,
            } = args;

            this.dayThemeLeft = dayThemeLeft || '#FFD982';
            this.dayThemeRight = dayThemeRight || '#5ECEF6';
            this.dayThemeText = dayThemeText || 'black';
            this.nightThemeLeft = nightThemeLeft || '#25395C';
            this.nightThemeRight = nightThemeRight || '#1C2A4F';
            this.nightThemeText = nightThemeText || 'white';
            this.forecastBgTheme = forecastBgTheme || '#DDDDDD';
            this.forecastBoxTheme = forecastBoxTheme || '#EEEEEE';
            this.forecastText = forecastText || 'black';
            this.forecastBoxDivider = forecastBoxDivider || 'black';
        }

        this.dayThemeLeft = '#FFD982';
        this.dayThemeRight = '#5ECEF6';
        this.dayThemeText = 'black';
        this.nightThemeLeft = '#25395C';
        this.nightThemeRight = '#1C2A4F';
        this.nightThemeText = 'white';
        this.forecastBgTheme = '#DDDDDD';
        this.forecastBoxTheme = '#EEEEEE';
        this.forecastText = 'black';
        this.forecastBoxDivider = 'black';
    }
}
