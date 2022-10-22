import 'reflect-metadata'

import * as https from 'https'
import * as path from 'path'
import * as fs from 'fs'
import * as routingCtrl from 'routing-controllers'
import * as prom from 'prom-client'

import favicon from 'serve-favicon'
import morgan from 'morgan'
import { Container, Service } from 'typedi'
import { Express } from 'express'

import { version } from '../package.json'
import { c } from './console'
import { ProfileService } from './profiles/profile-service'
import { AplApiService } from './api/apl-api-service'

// --- prepare dependency injection
routingCtrl.useContainer(Container)

@Service()
class AppService {
  private readonly app: Express
  private readonly httpServer: https.Server

  constructor(private readonly profileService: ProfileService, private readonly applianceService: AplApiService) {
    console.log(c(this), 'constructor')

    // --- create the express application
    this.app = routingCtrl.createExpressServer({
      controllers: [path.join(__dirname, '**/*-api-controller.js')],
      cors: {
        origin: '*',
      },
    })

    // --- initialize a simple http server
    this.httpServer = https.createServer(
      {
        key: fs.readFileSync(this.profileService.profile.ca.key),
        cert: fs.readFileSync(this.profileService.profile.ca.cert),
      },
      this.app
    )

    // --- serve favicon
    this.app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')))

    // --- configure logger, but not for technical urls
    const urls = ['/ready', '/isalive', '/metrics']
    console.log(c(this), `desactivate morgan logs for urls`, urls)
    this.app.use(
      morgan(this.profileService.profile.morgan, {
        skip: (req, res) => urls.includes(req.url),
      })
    )

    // --- configure metric
    prom.collectDefaultMetrics({ prefix: 'owfs_restful_' })
  }

  public async launchServer(): Promise<void> {
    // --- run express application
    const currentVersion: string = version
    this.httpServer.listen(this.profileService.profile.port, '0.0.0.0', () => {
      console.log(
        c(this),
        `owfs_restful V${currentVersion} listening on https://0.0.0.0:${this.profileService.profile.port}`
      )
    })

    await this.applianceService.register()
  }
}

Container.get(AppService)
  .launchServer()
  .then(() => {
    console.log(c(this), 'started ok')
  })
  .catch((reason) => {
    console.log(c(this), 'started ko', reason)
  })
