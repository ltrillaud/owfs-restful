import { IBaseProfile } from './profile-model'
import { isMainThread } from 'worker_threads'
import { c } from '../console'

export class ProfileBaseService<P extends IBaseProfile> {
  constructor(public name: string, public profile: P) {
    // --- import profile
    console.log(c(this), `profile (${this.name})`)

    // --- override with process env
    Object.keys(this.profile).forEach((key) => {
      const envKey = this.camel2snake(key)
      const val = process.env[envKey]
      const tmp: any = this.profile // desactivate typescript typings
      if (val != null) {
        tmp[key] = val
      }
    })

    // --- allow self signed certificate in debug mode
    if (!this.profile.prod) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    }

    if (isMainThread) {
      const excludedKeys = ['ca']
      for (const [key, val] of Object.entries(this.profile).filter(([_key, _]) => !excludedKeys.includes(_key))) {
        console.log(c(this), `profile (${key})=(${JSON.stringify(val)})`)
      }
    } else {
      console.log(c(this), `reload profile for worker`)
    }
  }

  private snake2camel(s: string): string {
    return s.toLowerCase().replace(/(_\w)/g, (m) => m[1].toUpperCase())
  }

  private camel2snake(s: string): string {
    return s
      .split(/(?=[A-Z])/)
      .join('_')
      .toUpperCase()
  }
}
