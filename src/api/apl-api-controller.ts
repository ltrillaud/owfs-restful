import { JsonController, Get, Put, Param, Body } from 'routing-controllers'
import { Service } from 'typedi'
import { AplApiService, IApplianceResponse, IAppliancesResponse } from './apl-api-service'

export interface IWriteRequest {
  value: string
}

@JsonController('/apl')
@Service()
export class AplApiController {
  constructor(private readonly aplApiService: AplApiService) { }

  @Get('/')
  all(): IAppliancesResponse {
    return this.aplApiService.getAll()
  }

  @Get('/:apl')
  async list(@Param('apl') apl: string): Promise<IApplianceResponse> {
    return await this.aplApiService.getOne(apl)
  }

  @Put('/:apl')
  async write(@Param('apl') apl: string, @Body() body: IWriteRequest): Promise<any[]> {
    return await this.aplApiService.appliances[apl].update(body)
  }
}
