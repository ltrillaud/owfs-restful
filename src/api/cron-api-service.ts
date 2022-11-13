import { readFile } from 'fs/promises'
import { Job, scheduleJob } from 'node-schedule'
import { Service } from 'typedi'
import { c } from '../console'
import { HeaterActionType } from '../models/appliances/heater.appliance'
import { ShutterActionType } from '../models/appliances/shutter.appliance'
import { AplApiService } from './apl-api-service'

export interface Schedule {
  cron: string
  useDawn: boolean
  useDusk: boolean
  dayOfWeek: string
  month: string
  dayOfMonth: string
  hour: string
  minute: string
}

export interface Action {
  apl: string
  value: HeaterActionType | ShutterActionType
}
export interface Cron {
  schedule: Schedule
  actions: Action[]
  job?: Job
}

export interface CronsResponse {
  [index: string]: Cron
}

@Service()
export class CronApiService {
  cronPath = './cron.json'
  crons: Cron[] = []

  constructor(
    private readonly aplApiService: AplApiService,
  ) {}

  async setup(): Promise<void> {
    try {
      const raw = await readFile(this.cronPath, 'utf-8')
      this.crons = JSON.parse(raw)
    } catch (error) {
      console.log(c(this), 'setup parse cron.json failed', error)
    }

    for (const [key, cron] of Object.entries(this.crons)) {
      console.log(c(this), `setup arm id(${key}) cron(${cron.schedule.cron})`)

      cron.job = scheduleJob(
        cron.schedule.cron,
        function(this: any, actions: Action[]) {
          console.log('>>> appliances', this.aplApiService.appliances)
          for (const action of actions) {
            console.log(`>>> action key(${action.apl}) val(${action.value})`)
            this.aplApiService.appliances[action.apl].update({ value: action.value })
          }
        }.bind(this, cron.actions),
      )
    }
  }

  getAll(): CronsResponse {
    // remove job before serialization
    const out: CronsResponse = {}
    for (const [key, cron] of Object.entries(this.crons)) {
      out[key] = { schedule: cron.schedule, actions: cron.actions }
    }
    return out
  }

  async getOne(id: string): Promise<Cron> {
    return this.crons[0]
  }

  async putOne(id: string, body: any): Promise<boolean> {
    return true
  }
}
