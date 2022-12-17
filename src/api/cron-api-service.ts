import {
  DayOfTheMonthRange,
  DayOfTheWeekRange,
  fieldsToExpression,
  HourRange,
  MonthRange,
  parseExpression,
  SixtyRange,
} from 'cron-parser'
import { readFile } from 'fs/promises'
import { schedule, ScheduledTask } from 'node-cron'
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

export interface CronFields {
  second: SixtyRange[]
  minute: SixtyRange[]
  hour: HourRange[]
  dayOfMonth: DayOfTheMonthRange[]
  month: MonthRange[]
  dayOfWeek: DayOfTheWeekRange[]
}

export interface Schedule {
  sunStep: SunStep
  cronFields: CronFields
}

export interface Action {
  apl: string
  value: HeaterActionType | ShutterActionType
}
export interface Cron {
  schedule: Schedule
  actions: Action[]
  job?: ScheduledTask
  cronExp?: string
}

export interface CronsResponse {
  [index: string]: Cron
}

@Service()
export class CronApiService {
  cronPath = './cron.json'
  crons: CronsResponse = {}

  constructor(
    private readonly aplApiService: AplApiService,
    private readonly profileService: ProfileService,
  ) {}

  private async handler(key: string, cron: Cron): Promise<void> {
    const now = new Date()
    console.log(`      cronApiServ.ts handler key(${key}) @ ${now.toISOString()}`)

    // trigger actions based on cron
    for (const action of cron.actions) {
      if (Object.prototype.hasOwnProperty.call(this.aplApiService.appliances, action.apl)) {
        await this.aplApiService.appliances[action.apl].update({ value: action.value })
      } else {
        console.log(`      cronApiServ.ts handler apl(${action.apl}) doesn't exist`)
      }
    }

    // reschedule if based on sunlight
    if (cron.schedule.sunStep !== 'none') {
      // get the date of the next event
      const interval = parseExpression(cron.cronExp!)
      const ts = interval.next().getTime()
      const next = new Date(ts)

      // get the time of the sun step
      const times = SunCalc.getTimes(
        next,
        this.profileService.profile.location.latitude,
        this.profileService.profile.location.longitude,
      )
      const date = new Date(times[cron.schedule.sunStep])

      // override the time in the cron fields
      const fields = { ...interval.fields } // fileds are immutable
      fields.hour = [date.getHours() as HourRange]
      fields.minute = [date.getMinutes() as SixtyRange]
      fields.second = [date.getSeconds() as SixtyRange]

      // abd override the cron with the new schedule
      const nextInterval = fieldsToExpression(fields)
      cron.cronExp = nextInterval.stringify()
      cron.job!.stop()
      cron.job = schedule(cron.cronExp, () => {
        void this.handler(key, cron)
      })
      console.log(c(this), `job(${key}) rechedule on ${date.toLocaleString()}`)
    }
  }

  async setup(): Promise<void> {
    try {
      const raw = await readFile(this.cronPath, 'utf-8')
      this.crons = JSON.parse(raw)
    } catch (error) {
      console.log(c(this), 'setup parse cron.json failed', error)
    }

    // create a schedule for each cron entries
    for (const [key, cron] of Object.entries(this.crons)) {
      if (cron.schedule.sunStep !== 'none') { // // sun based hour / min
        const location = this.profileService.profile.location
        const times = SunCalc.getTimes(new Date(), location.latitude, location.longitude)
        const date = new Date(times[cron.schedule.sunStep])
        cron.schedule.cronFields.hour = [date.getHours() as HourRange]
        cron.schedule.cronFields.minute = [date.getMinutes() as SixtyRange]
      }

      const fullInterval = parseExpression('* * * * * *')
      const fields = { ...fullInterval.fields, ...cron.schedule.cronFields }
      const interval = fieldsToExpression(fields)
      cron.cronExp = interval.stringify()

      cron.job = schedule(cron.cronExp, () => {
        void this.handler(key, cron)
      })
      const next = interval.next().toString()
      console.log(c(this), `setup arm id(${key}) next(${next})`)
    }
  }

  has(id: string): boolean {
    return Object.hasOwnProperty.call(this.crons, id)
  }

  getAll(): CronsResponse {
    // remove job before serialization
    const out: CronsResponse = {}
    for (const [key, cron] of Object.entries(this.crons)) {
      out[key] = { schedule: cron.schedule, actions: cron.actions }
    }
    return out
  }

  getOne(id: string): Cron {
    // job isn't serializable
    const { job, ...cron } = this.crons[id]
    return cron
  }

  async putOne(id: string, body: any): Promise<boolean> {
    return true
  }
}
