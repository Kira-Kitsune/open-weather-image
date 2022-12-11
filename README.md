# open-weather-image

open-weather-image is a image creation (base64 or buffer (png format)) to show current weather data of a provided area

Forecast data is loaded from [OpenWeather API](https://openweathermap.org)

The theme changes if it's daytime or nighttime as shown below

![Daytime](https://github.com/Kira-Kitsune/open-weather-image/blob/main/daytime.png?raw=true)

![Nighttime](https://github.com/Kira-Kitsune/open-weather-image/blob/main/nighttime.png?raw=true)

Or alternatively you can include it with a forecast

![WithForecast](https://github.com/Kira-Kitsune/open-weather-image/blob/main/withforecast.png?raw=true)

Optionally if you don't like the default colours, you can customise the theme (Only with solid colours, gradients will be added in future version)

> The icons are not affected currently (daytime - black, nighttime - white)

# Installation

```sh
$ npm install open-weather-image
```

# Usage

First you will need to register and account on OpenWeather to obtain an API key

[How to Start OpenWeather](https://openweathermap.org/appid)

With Metric Units

```ts
import { createWeatherImage } from 'open-weather-image';

const image = await createWeatherImageToday({
    key: 'YOUR API KEY',
    cityName: 'Adelaide',
    tempUnit: 'metric',
});
```

With Imperial Units

```ts
import { createWeatherImage } from 'open-weather-image';

const image = await createWeatherImageToday({
    key: 'YOUR API KEY',
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
    key: 'YOUR API KEY',
    cityName: 'Adelaide',
    withForecast: true,
});
```

With a Theme

```ts
import { createWeatherImage, Theme } from 'open-weather-image';

const myTheme = new Theme({
    dayThemeRight: '#373CC4',
    forecastBgTheme: '#242424',
    forecastBoxDivider: '#FFFFFF',
});

const image = await createWeatherImage({
    key: 'YOUR API KEY',
    cityName: 'Adelaide',
    withForecast: true,
    theme: myTheme,
});
```

Result:
![WithTheme](https://github.com/Kira-Kitsune/open-weather-image/blob/main/withtheme.png?raw=true)

# Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested.
You are free to submit a PR to this repo, please fork first.

# License

open-weather-image is available under the MIT license. See the LICENSE.md file for more info.

Copyright &copy; 2022 Kira Kitsune <https://kirakitsune.com>, All rights reserved.
