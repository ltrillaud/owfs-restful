import { Service } from 'typedi'
import { IBaseProfile } from './profile-model'
import { ProfileBaseService } from './profile-base-service'

export interface IProfile extends IBaseProfile {}

@Service()
export class ProfileService extends ProfileBaseService<IProfile> {
  constructor() {
    const name = process.env.PROFILE ?? 'local'
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    super(name, require(`./${name}.js`).profile)
  }
}
