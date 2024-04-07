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

npm:
```sh
npm install open-weather-image
```

bun:
```sh
bun add open-weather-image
```

# Usage

First you will need to register and account on OpenWeather to obtain an API key

Recommended to put your API key as an environment variable.

[How to Start OpenWeather](https://openweathermap.org/appid)

### Basic Usage
> You can output with a buffer or base64 string. `Default: "buffer"`

Base 64:
```ts
import { createWeatherImage } from 'open-weather-image';

const image = await createWeatherImageToday({
    key: process.env.WEATHER_API_KEY,
    cityName: 'Munich',
    output: 'base64',
});
```

Buffer:
```ts
import { createWeatherImage } from 'open-weather-image';

const image = await createWeatherImageToday({
    key: process.env.WEATHER_API_KEY,
    cityName: 'Munich',
    output: 'buffer',
});
```



### With Metric Units

```ts
import { createWeatherImage } from 'open-weather-image';

const image = await createWeatherImageToday({
    key: process.env.WEATHER_API_KEY,
    cityName: 'Munich',
    units: 'metric',
});
```

### With Imperial Units

![Imperial](https://github.com/Kira-Kitsune/open-weather-image/blob/main/imperial.png?raw=true)

> Omitting the `units` property will use the preferred temperature unit of the target country.

```ts
import { createWeatherImage } from 'open-weather-image';

const image = await createWeatherImageToday({
    key: process.env.WEATHER_API_KEY,
    cityName: 'Springfield',
    stateCode: 'OR',
    countryCode: 'US',
    units: 'imperial',
});
```

### With Forecast

![WithForecast](https://github.com/Kira-Kitsune/open-weather-image/blob/main/withforecast.png?raw=true)

```ts
import { createWeatherImage } from 'open-weather-image';

const image = await createWeatherImage({
    key: process.env.WEATHER_API_KEY,
    cityName: 'Munich',
    withForecast: true,
});
```

### Choosing a Locale

> Currently only English and German is supported, and tested with, feel free to [contribute](#contributing) with other langauges within the [i18n.ts](./src/utils/i18n.ts) file. `Default: "en"`

![ChangingLocale](https://github.com/Kira-Kitsune/open-weather-image/blob/main/localeDE.png?raw=true)

```ts
import { createWeatherImage } from "open-weather-image"

const image = await createWeatherImage({
    key: process.env.WEATHER_API_KEY,
    cityName: 'Munich',
    withForecast: true,
    locale: "de",
});
```

#### Possible Locales (All the ones that don't have full support are disabled)
    af - Afrikaans
    al - Albanian
    ar - Arabic
    az - Azerbaijani
    bg - Bulgarian
    ca - Catalan
    cz - Czech
    da - Danish
    de - German (Full Support)
    el - Greek
    en - English (Full Support)
    eu - Basque
    fa - Persian (Farsi)
    fi - Finnish
    fr - French
    gl - Galician
    he - Hebrew
    hi - Hindi
    hr - Croatian
    hu - Hungarian
    id - Indonesian
    it - Italian
    ja - Japanese
    kr - Korean
    la - Latvian
    lt - Lithuanian
    mk - Macedonian
    no - Norwegian
    nl - Dutch
    pl - Polish
    pt - Portuguese
    pt_br - Português Brasil
    ro - Romanian
    ru - Russian
    sv, se - Swedish
    sk - Slovak
    sl - Slovenian
    sp, es - Spanish
    sr - Serbian
    th - Thai
    tr - Turkish
    ua, uk - Ukrainian
    vi - Vietnamese
    zh_cn - Chinese Simplified
    zh_tw - Chinese Traditional
    zu - Zulu

### With a Theme
![WithTheme](https://github.com/Kira-Kitsune/open-weather-image/blob/main/withtheme.png?raw=true)

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
    cityName: 'Munich',
    withForecast: true,
    theme: myTheme,
});
```

Importing the theme type in TypeScript
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

You are free to submit a PR to this repo, please fork first, please only communicate in English or German.

# License
open-weather-image is available under the MIT license. See the LICENSE.md file for more info.

Copyright &copy; 2022-2024 Kira Kitsune <https://kirakitsune.com>, All rights reserved.
