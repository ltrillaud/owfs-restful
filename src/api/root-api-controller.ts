import { Response } from 'express'
import * as prom from 'prom-client'
import { ContentType, Get, JsonController, Res } from 'routing-controllers'
import { Service } from 'typedi'

import { IRootResult, RootApiService } from './root-api-service'

/**
 * RootController : handle root path
 */
@JsonController()
@Service()
export class RootApiController {
  constructor(private readonly rootService: RootApiService) {}

  /**
   * Display server name and his version number
   */
  @Get('/')
  public getRoot(): IRootResult {
    return this.rootService.getRoot()
  }

  /**
   * check if the service is alive
   */
  @Get('/alive')
  public getAlive(@Res() res: Response): { alive: boolean } {
    const alive: boolean = this.rootService.getAlive()
    if (!alive) {
      res.sendStatus(503)
    }
    return { alive }
  }

  /**
   * check if the service is ready
   */
  @Get('/ready')
  public doReady(@Res() res: Response): { ready: boolean } {
    const ready: boolean = this.rootService.getReady()
    if (!ready) {
      res.sendStatus(503)
    }
    return { ready }
  }

  @Get('/metrics')
  @ContentType('text/plain')
  public async getMetrics(): Promise<string> {
    return await prom.register.metrics()
  }
}
