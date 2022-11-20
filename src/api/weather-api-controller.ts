import { Authorized, Get, JsonController } from 'routing-controllers'
import { Service } from 'typedi'
import { c } from '../console'
import { WeatherApiService } from './weather-api-service'

export interface IWriteRequest {
  value: string
}

@JsonController('/weather')
@Authorized()
@Service()
export class WeatherApiController {
  // eslint-disable-next-line @typescript-eslint/space-before-function-paren
  constructor(private readonly weatherApiService: WeatherApiService) {}

  @Get('/')
  async all(): Promise<any> {
    const now = new Date().toISOString()
    console.log(c(this), `GET apl(all) @ ${now}`)
    return await this.weatherApiService.getAll()
  }
}
