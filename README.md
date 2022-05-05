﻿# open-weather-image

open-weather-image is a image creation (base64 png) to show current weather data of a provided area

Forecast data is loaded from [OpenWeather API](https://openweathermap.org)

# Installation

```sh
$ npm install open-weather-image
```

# Quick Example

First you will need to register and account on OpenWeather to obtain an API key

[How to Start OpenWeather](https://openweathermap.org/appid)

```ts
import { createWeatherImageToday } from 'open-weather-image'

const image = await createWeatherImageToday({ key: 'YOUR API KEY', cityName: 'Adelaide' })
```
