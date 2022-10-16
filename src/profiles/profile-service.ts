import { Service } from 'typedi'
import { ProfileBaseService } from './profile-base-service'
import { IProfile } from './profile-model'

@Service()
export class ProfileService extends ProfileBaseService<IProfile> {
  constructor() {
    const name = process.env.PROFILE ?? 'local'
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    super(name, require(`./${name}.js`).profile)
  }
}
