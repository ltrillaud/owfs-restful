import SunCalc from 'suncalc'
import { Service } from 'typedi'
import { fetch } from 'undici'

import { ProfileService } from '../profiles/profile-service'
import { Location } from './cron-api-service'

export interface Sun {
  date: string
  times: SunCalc.GetTimesResult
  position: SunCalc.GetSunPositionResult
}

export interface Moon {
  date: string
  times: SunCalc.GetMoonTimes
  position: SunCalc.GetMoonPositionResult
  illumination: SunCalc.GetMoonIlluminationResult
}

@Service()
export class WeatherApiService {
  location: Location = { latitude: 0, longitude: 0 }

  constructor(
    private readonly profileService: ProfileService,
  ) {}

  async getAll(): Promise<any> {
    const location = this.profileService.profile.location
    const lang = 'fr'
    const url = 'https://api.openweathermap.org/data/2.5/forecast?'
      + `lat=${location.latitude}&`
      + `lon=${location.longitude}&`
      + `lang=${lang}&`
      + `appid=${this.profileService.profile.weatherApiKey}&`
      + `units=${this.profileService.profile.unitsSystem}`
    const response = await fetch(url)
    const body = await response.json()
    return body
  }

  getSun(date: Date = new Date()): Sun {
    const location = this.profileService.profile.location
    return {
      date: date.toISOString(),
      times: SunCalc.getTimes(date, location.latitude, location.longitude),
      position: SunCalc.getPosition(date, location.latitude, location.longitude),
    }
  }

  getMoon(date: Date = new Date()): Moon {
    const location = this.profileService.profile.location
    return {
      date: date.toISOString(),
      times: SunCalc.getMoonTimes(date, location.latitude, location.longitude),
      position: SunCalc.getMoonPosition(date, location.latitude, location.longitude),
      illumination: SunCalc.getMoonIllumination(date),
    }
  }
}
