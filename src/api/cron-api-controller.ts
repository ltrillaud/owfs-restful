import { nanoid } from 'nanoid'
import { Authorized, Body, Get, JsonController, NotFoundError, Param, Post, Put } from 'routing-controllers'
import { Service } from 'typedi'

import { c } from '../console'
import { Cron, CronApiService, CronsResponse } from './cron-api-service'

export interface IWriteRequest {
  value: string
}

@JsonController('/cron')
@Authorized()
@Service()
export class CronApiController {
  // eslint-disable-next-line @typescript-eslint/space-before-function-paren
  constructor(private readonly cronApiService: CronApiService) {}

  @Get('/')
  all(): CronsResponse {
    const now = new Date().toISOString()
    console.log(c(this), `GET apl(all) @ ${now}`)
    return this.cronApiService.getAll()
  }

  @Get('/:id')
  async get(@Param('id') id: string): Promise<Cron> {
    const now = new Date().toISOString()
    console.log(c(this), `GET cron(${id}) @ ${now}`)
    if (!this.cronApiService.has(id)) {
      throw (new NotFoundError(`cron(${id}) doesn't exist`))
    }
    return await this.cronApiService.getOne(id)
  }

  @Post()
  async post(@Body() body: IWriteRequest): Promise<boolean> {
    const now = new Date().toISOString()
    const id = await nanoid()
    // const id = '123'
    console.log(c(this), `PUT cron(${id}) @ ${now} with body`, body)
    return await this.cronApiService.putOne(id, body)
  }

  @Put('/:id')
  async put(@Param('id') id: string, @Body() body: IWriteRequest): Promise<boolean> {
    const now = new Date().toISOString()
    console.log(c(this), `PUT cron(${id}) @ ${now} with body`, body)
    if (!this.cronApiService.has(id)) {
      throw (new NotFoundError(`cron(${id}) doesn't exist`))
    }
    return await this.cronApiService.putOne(id, body)
  }
}
