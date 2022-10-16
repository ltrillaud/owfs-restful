import { Service } from 'typedi'
import { JsonController, Get, Put, Param, Body, BadRequestError } from 'routing-controllers'

import { IListResponse, IReadResponse, IWriteResponse, RawApiService } from './raw-api-service'

interface IWriteRequest {
  value: string
}

@JsonController('/raw')
@Service()
export class RawApiController {
  constructor(private readonly rawApiService: RawApiService) {}

  @Get('/')
  async all(): Promise<IListResponse> {
    return await this.rawApiService.list('/')
  }

  @Get('/:id')
  async list(@Param('id') id: string): Promise<IListResponse> {
    return await this.rawApiService.list(`/${id}`)
  }

  @Get('/:id/:att')
  async read(@Param('id') id: string, @Param('att') att: string): Promise<IReadResponse> {
    return await this.rawApiService.read(`/${id}/${att}`)
  }

  @Put('/:id/:att')
  async write(
    @Param('id') id: string,
    @Param('att') att: string,
    @Body() body: IWriteRequest
  ): Promise<IWriteResponse> {
    let result: IWriteResponse
    if (Object.prototype.hasOwnProperty.call(body, 'value')) {
      if (body.value.length !== 0) {
        result = await this.rawApiService.write(`/${id}/${att}`, body.value)
      } else {
        throw new BadRequestError(`JSON Body 'value' attribut is empty`)
      }
    } else {
      throw new BadRequestError(`JSON Body haven't 'value' attribut`)
    }
    return result
  }
}
