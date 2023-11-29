# open-weather-image

open-weather-image is a image creation (base64 or buffer (png format)) to show current weather data of a provided area

Forecast data is loaded from [OpenWeather API](https://openweathermap.org)

The theme changes if it's daytime or nighttime as shown below

![Daytime](https://github.com/Kira-Kitsune/open-weather-image/blob/main/daytime.png?raw=true)

![Nighttime](https://github.com/Kira-Kitsune/open-weather-image/blob/main/nighttime.png?raw=true)

Or alternatively you can include it with a forecast

![WithForecast](https://github.com/Kira-Kitsune/open-weather-image/blob/main/withforecast.png?raw=true)

Optionally if you don't like the default colours, you can customise the theme (Only with solid colours, all arguments are optional, gradients will be added in future version)

# Installation

```sh
$ npm install open-weather-image
```

# Usage

First you will need to register and account on OpenWeather to obtain an API key

Recommended to put your API key as an environment variable.

[How to Start OpenWeather](https://openweathermap.org/appid)

With Metric Units

```ts
import { createWeatherImage } from 'open-weather-image';

const image = await createWeatherImageToday({
    key: process.env.WEATHER_API_KEY,
    cityName: 'Adelaide',
    tempUnit: 'metric',
});
```

With Imperial Units

![Imperial](https://github.com/Kira-Kitsune/open-weather-image/blob/main/imperial.png?raw=true)

Note: if a country by default uses Imperial or Metric units, it will default to it (e.g. in the US: Imperial, in UK: Metric)

```ts
import { createWeatherImage } from 'open-weather-image';

const image = await createWeatherImageToday({
    key: process.env.WEATHER_API_KEY,
    cityName: 'Springfield',
    stateCode: 'OR',
    countryCode: 'US',
    tempUnit: 'imperial',
});
```

> Omitting the `tempUnit` property will use the preferred temperature unit of the target country.

With Forecast

```ts
import { createWeatherImage } from 'open-weather-image';

const image = await createWeatherImage({
    key: process.env.WEATHER_API_KEY,
    cityName: 'Adelaide',
    withForecast: true,
});
```

With a Theme

```ts
import { createWeatherImage } from 'open-weather-image';

const myTheme = {
    dayThemeRight: '#373CC4',
    forecastBgTheme: '#242424',
    forecastBoxDivider: '#FFFFFF',
    dayThemeText: '#FF00FF',
    dayThemeSymbol: '#00FF00',
};

const image = await createWeatherImage({
    key: process.env.WEATHER_API_KEY,
    cityName: 'Adelaide',
    withForecast: true,
    theme: myTheme,
});
```

Result:

![WithTheme](https://github.com/Kira-Kitsune/open-weather-image/blob/main/withtheme.png?raw=true)

Importing the theme type (TypeScript)

```ts
import type { Theme } from 'open-weather-image';
```

Default Theme

```ts
const defaultTheme = {
    dayThemeLeft: '#FFD982',
    dayThemeRight: '#5ECEF6',
    dayThemeText: 'black', // #000000
    dayThemeSymbol: 'black',
    nightThemeLeft: '#25395C',
    nightThemeRight: '#1C2A4F',
    nightThemeText: 'white', // #FFFFFF
    nightThemeSymbol: 'white',
    forecastBgTheme: '#DDDDDD',
    forecastBoxTheme: '#EEEEEE',
    forecastText: 'black',
    forecastSymbolColour: 'black',
    forecastBoxDivider: 'black',
};
```

# Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested.
You are free to submit a PR to this repo, please fork first, english and german is the preferred languages.

# License

open-weather-image is available under the MIT license. See the LICENSE.md file for more info.

Copyright &copy; 2022-2023 Kira Kitsune <https://kirakitsune.com>, All rights reserved.
