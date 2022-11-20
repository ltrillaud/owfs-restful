import { readFile } from 'fs/promises'
import { Job, RecurrenceRule, RecurrenceSpecObjLit, scheduleJob } from 'node-schedule'
import { join } from 'path'
import SunCalc from 'suncalc'
import { Service } from 'typedi'

import { c } from '../console'
import { HeaterActionType } from '../models/appliances/heater.appliance'
import { ShutterActionType } from '../models/appliances/shutter.appliance'
import { ProfileService } from '../profiles/profile-service'
import { AplApiService } from './apl-api-service'

export interface Location {
  latitude: number
  longitude: number
}

export type SunStep =
  | 'nightEnd' //      06:27 morning astronomical twilight starts
  | 'nauticalDawn' //  07:04 morning nautical twilight starts
  | 'dawn' //          07:42 morning nautical twilight ends, morning civil twilight starts *
  | 'sunrise' //       08:17 top edge of the sun appears on the horizon
  | 'sunriseEnd' //    08:20 bottom edge of the sun touches the horizon
  | 'goldenHourEnd' // 09:06 soft light, best time for photography ends
  | 'solarNoon' //     12:49 sun is in the highest position
  | 'goldenHour' //    16:32 evening golden hour starts
  | 'sunsetStart' //   17:18 bottom edge of the sun touches the horizon
  | 'sunset' //        17:22 sun disappears below the horizon, evening civil twilight starts
  | 'dusk' //          17:56 evening nautical twilight starts
  | 'nauticalDusk' //  18:34 evening astronomical twilight starts
  | 'night' //         19:11 dark enough for astronomical observations
  | 'nadir' //         00:49 darkest moment of the night, sun is in the lowest position
  | 'none' //          --:-- mark to don't use sunStep

export interface Schedule extends RecurrenceSpecObjLit {
  sunStep: SunStep
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
    private readonly profileService: ProfileService,
  ) {}

  static handler(this: any, key: string, cron: Cron): void {
    console.log(c(this), `handle cron id(${key}) @ ${new Date().toISOString()}`)

    for (const action of cron.actions) {
      console.log(`>>> action key(${action.apl}) val(${action.value})`)
      this.aplApiService.appliances[action.apl].update({ value: action.value })
    }

    if (cron.schedule.sunStep !== 'none') {
      // reschedule this job outside this callback
      let next = cron.job?.nextInvocation()
      const times = SunCalc.getTimes(next!, this.profile.location.latitude, this.profile.location.longitude)
      const date = new Date(times[cron.schedule.sunStep])
      const rule = new RecurrenceRule(
        cron.schedule.year,
        cron.schedule.month,
        cron.schedule.date,
        cron.schedule.dayOfWeek,
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        cron.schedule.tz,
      )
      cron.job?.reschedule(rule)
      next = cron.job?.nextInvocation()
      console.log(c(this), `job(${key}) rechedule on ${next?.toLocaleString}`)
    }
  }

  async setup(): Promise<void> {
    const locationLibPath = join(
      '../profiles/locations',
      `${this.profileService.profile.privacyName}.ts`,
    )
    const app = await import(locationLibPath)
    const location: Location = app.location

    try {
      const raw = await readFile(this.cronPath, 'utf-8')
      this.crons = JSON.parse(raw)
    } catch (error) {
      console.log(c(this), 'setup parse cron.json failed', error)
    }

    // create a schedule for each cron entries
    for (const [key, cron] of Object.entries(this.crons)) {
      const { sunStep, ...rule } = { ...cron.schedule }
      if (cron.schedule.sunStep !== 'none') { // // sun based hour / min
        const times = SunCalc.getTimes(new Date(), location.latitude, location.longitude)
        const date = new Date(times[cron.schedule.sunStep])
        rule.hour = date.getHours()
        rule.minute = date.getMinutes()
      }

      cron.job = scheduleJob(
        key,
        rule,
        CronApiService.handler.bind(this, key, cron),
      )
      const next = cron.job.nextInvocation()
      console.log(c(this), `setup arm id(${key}) next(${next.toLocaleString()})`)
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
