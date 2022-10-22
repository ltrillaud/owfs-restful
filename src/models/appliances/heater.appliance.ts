import { BaseAppliance } from './base.appliance'

type HeaterMode = 'E' | '1' | '2' | 'C'

export class HeaterAppliance extends BaseAppliance {
  private readonly mode: HeaterMode = 'E'

  get(): { mode: HeaterMode } {
    // --- return the current mode
    return { mode: this.mode }
  }
}
