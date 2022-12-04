import 'reflect-metadata'

import * as fs from 'fs'
import * as https from 'https'
import * as path from 'path'
import * as prom from 'prom-client'
import * as routingCtrl from 'routing-controllers'

import { Express } from 'express'
import morgan from 'morgan'
import favicon from 'serve-favicon'
import { Container, Service } from 'typedi'

import { Action } from 'routing-controllers'
import { version } from '../package.json'
import { AplApiController } from './api/apl-api-controller'
import { AplApiService } from './api/apl-api-service'
import { CronApiController } from './api/cron-api-controller'
import { CronApiService } from './api/cron-api-service'
import { RawApiController } from './api/raw-api-controller'
import { RootApiController } from './api/root-api-controller'
import { WeatherApiController } from './api/weather-api-controller'
import { c } from './console'
import { expressAuthentication } from './jwt-auth'
import { ProfileService } from './profiles/profile-service'

// --- prepare dependency injection
routingCtrl.useContainer(Container)

@Service()
class AppService {
  private readonly app: Express
  private readonly httpServer: https.Server

  constructor(
    private readonly profileService: ProfileService,
    private readonly applianceService: AplApiService,
    private readonly cronService: CronApiService,
  ) {
    console.log(c(this), 'constructor')

    // --- create the express application
    this.app = routingCtrl.createExpressServer({
      controllers: [RootApiController, RawApiController, AplApiController, CronApiController, WeatherApiController],
      cors: {
        origin: true,
      },
      authorizationChecker: async (action: Action, roles: string[]) => {
        // allow if header authorization is set
        let isAllowed: boolean
        try {
          await expressAuthentication(action.request, 'jwt')
          isAllowed = true
        } catch (error) {
          isAllowed = false
        }
        return isAllowed
      },
    })

    // --- initialize a simple http server
    this.httpServer = https.createServer(
      {
        key: fs.readFileSync(this.profileService.profile.ca.key),
        cert: fs.readFileSync(this.profileService.profile.ca.cert),
      },
      this.app,
    )

    // --- serve favicon
    this.app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')))

    // --- configure logger, but not for technical urls
    const urls = ['/ready', '/isalive', '/metrics']
    console.log(c(this), 'desactivate morgan logs for urls', urls)
    this.app.use(
      morgan(this.profileService.profile.morgan, {
        skip: (req, res) => urls.includes(req.url),
      }),
    )

    // --- configure metric
    prom.collectDefaultMetrics({ prefix: 'owfs_restful_' })
  }

  public async launchServer(): Promise<void> {
    await this.applianceService.register()
    // --- restore cron
    await this.cronService.setup()

    // --- run express application
    const currentVersion: string = version
    this.httpServer.listen(this.profileService.profile.port, '0.0.0.0', () => {
      console.log(
        c(this),
        `owfs_restful V${currentVersion} listening on https://0.0.0.0:${this.profileService.profile.port}`,
      )
    })
  }
}

Container.get(AppService)
  .launchServer()
  .then(() => {
    console.log('             app.ts started ok')
  })
  .catch((reason) => {
    console.log('             app.ts started ko', reason)
  })
