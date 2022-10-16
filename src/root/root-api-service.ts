import { Service } from 'typedi'

import { version } from '../../package.json'

export interface IRootResult {
  app: string
  version: string
}

@Service()
export class RootApiService {
  private readonly isAlive = true
  private readonly isReady = true

  constructor() {
    console.log('     rootApiServ.ts constructor')
  }

  public getRoot(): IRootResult {
    return { app: 'owfs_restful', version }
  }

  public getAlive(): boolean {
    return this.isAlive
  }

  public getReady(): boolean {
    return this.isReady
  }
}
