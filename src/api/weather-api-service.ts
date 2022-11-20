import { Service } from 'typedi'
import { fetch } from 'undici'

import { ProfileService } from '../profiles/profile-service'
import { Location } from './cron-api-service'

@Service()
export class WeatherApiService {
  location: Location = { latitude: 0, longitude: 0 }

  constructor(
    private readonly profileService: ProfileService,
  ) {}

  async getAll(): Promise<any> {
    const location = this.profileService.profile.location
    const url = 'https://api.openweathermap.org/data/2.5/forecast?'
      + `lat=${location.latitude}&`
      + `lon=${location.longitude}&`
      + `appid=${this.profileService.profile.weatherApiKey}&`
      + `units=${this.profileService.profile.unitsSystem}`
    const response = await fetch(url)
    const body = await response.json()
    return body
  }
}
