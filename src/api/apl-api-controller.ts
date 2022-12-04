import { Authorized, Body, Get, JsonController, NotFoundError, Param, Put } from 'routing-controllers'
import { Service } from 'typedi'
import { c } from '../console'
import { AplApiService, IApplianceResponse, IAppliancesResponse } from './apl-api-service'

export interface IWriteRequest {
  value: string
}

@JsonController('/apl')
@Authorized()
@Service()
export class AplApiController {
  // eslint-disable-next-line @typescript-eslint/space-before-function-paren
  constructor(private readonly aplApiService: AplApiService) {}

  @Get('/')
  all(): IAppliancesResponse {
    const now = new Date().toISOString()
    console.log(c(this), `GET apl(all) @ ${now}`)
    return this.aplApiService.getAll()
  }

  @Get('/:apl')
  async list(@Param('apl') apl: string): Promise<IApplianceResponse> {
    const now = new Date().toISOString()
    console.log(c(this), `GET apl(${apl}) @ ${now}`)
    if (!this.aplApiService.has(apl)) {
      throw (new NotFoundError(`apl(${apl}) doesn't exist`))
    }
    return await this.aplApiService.getOne(apl)
  }

  @Put('/:apl')
  async write(@Param('apl') apl: string, @Body() body: IWriteRequest): Promise<any[]> {
    const now = new Date().toISOString()
    console.log(c(this), `PUT apl(${apl}) @ ${now} with body`, body)
    if (!this.aplApiService.has(apl)) {
      throw (new NotFoundError(`apl(${apl}) doesn't exist`))
    }
    return await this.aplApiService.appliances[apl].update(body)
  }
}
