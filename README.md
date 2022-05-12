# open-weather-image

open-weather-image is a image creation (base64 or buffer (png format)) to show current weather data of a provided area

Forecast data is loaded from [OpenWeather API](https://openweathermap.org)

The theme changes if it's daytime or nighttime as shown below

![Daytime](https://github.com/Kira-Kitsune/open-weather-image/blob/main/daytime.png?raw=true)

![Nighttime](https://github.com/Kira-Kitsune/open-weather-image/blob/main/nighttime.png?raw=true)

Or alternatively you can include it with a forecast

![WithForecast](https://github.com/Kira-Kitsune/open-weather-image/blob/main/withforecast.png?raw=true)

# Installation

```sh
$ npm install open-weather-image
```

# Usage

First you will need to register and account on OpenWeather to obtain an API key

[How to Start OpenWeather](https://openweathermap.org/appid)

With Metric Units
```ts
import { createWeatherImageToday } from 'open-weather-image'

const image = await createWeatherImageToday({ 
    key: 'YOUR API KEY', cityName: 'Adelaide' 
})
```

With Imperial Units
```ts
import { createWeatherImageToday } from 'open-weather-image'

const image = await createWeatherImageToday({ 
    key: 'YOUR API KEY', cityName: 'Springfield', stateCode: 'OR', 
    countryCode: 'US', imperialUnits: true 
})
```

With Forecast
```ts
import { createWeatherImageTodayWithForecast } from 'open-weather-image'

const image = await createWeatherImageTodayWithForecast({ 
    key: 'YOUR API KEY', cityName: 'Adelaide'
})
```

# License

open-weather-image is available under the MIT license. See the LICENSE.md file for more info.

Copyright &copy; 2022 Kira Kitsune <https://kirakitsune.com>, All rights reserved.