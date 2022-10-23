/* eslint-disable @typescript-eslint/no-misused-promises */
import { IWriteRequest } from '../../api/apl-api-controller'
import { BaseDevice } from '../devices/base.device'
import { BaseAppliance } from './base.appliance'

type HeaterActionType = 'E' | '1' | '2' | 'C'

export class HeaterAppliance extends BaseAppliance {
  private readonly fiveMins = 5 * 60 * 1000
  private mode: HeaterActionType = 'E'
  private longInterval: NodeJS.Timer | null = null
  private shortInterval: NodeJS.Timer | null = null

  public async update (body: IWriteRequest): Promise<any[]> {
    if (Object.prototype.hasOwnProperty.call(this.devices, 'PIO')) {
      const device = this.devices.PIO

      // clear interval
      let hasIntervalRunning = false
      if (this.longInterval !== null) {
        clearInterval(this.longInterval)
        this.longInterval = null
        hasIntervalRunning = true
      }
      if (this.shortInterval !== null) {
        clearInterval(this.shortInterval)
        this.shortInterval = null
        hasIntervalRunning = true
      }

      if (hasIntervalRunning) {
        // invert PIO to reset mode
        const current = await device.read()
        await device.write(current === '0' ? '1' : '0')
      }

      switch (body.value) {
        case 'E':
          this.mode = 'E'
          await device.write('0')
          break
        case '1':
          this.mode = '1'
          await this.initInterval('1', device)
          break
        case '2':
          this.mode = '2'
          await this.initInterval('2', device)
          break
        case 'C':
          this.mode = 'C'
          await device.write('1')
          break
        default:
          throw new Error('Heater action must be \'E\' to economy, \'C\' to confort, \'1\', eco1 or \'2\' to eco2')
      }
    } else {
      throw new Error(`Action(PIO) doesn't exist in appliance(${this.type}) `)
    }

    return await Promise.resolve(['ok'])
  }

  private async initInterval (action: HeaterActionType, device: BaseDevice): Promise<void> {
    this.shortInterval = setInterval(async () => {
      await device.write('0')
    }, this.fiveMins)
    setTimeout(async (): Promise<void> => {
      this.longInterval = setInterval(async () => {
        await device.write('1')
      }, this.fiveMins)
      await device.write('1')
    }, action === '1' ? 3000 : 7000)
    await device.write('0')
  }
}
