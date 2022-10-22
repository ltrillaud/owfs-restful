import Container from 'typedi'
import { RawApiService } from '../../../api/raw-api-service'
import { BaseDevice, IDeviceModel } from '../base.device'

export class OwId {
  private static readonly pattern: RegExp = /^([0-9A-F]{2})\.([0-9A-F]{12})/i
  public family: string = ''
  public address: string = ''

  constructor(public id: string) {
    const result: RegExpMatchArray | null = id.match(OwId.pattern)
    if (result !== null) {
      this.family = result[1]
      this.address = result[2]
    }
  }
}

export class OwfsDevice extends BaseDevice {
  public owId: OwId

  private readonly rawApiService: RawApiService = Container.get(RawApiService)
  private static readonly family2defaultPath: { [index: string]: string } = {
    '10': 'temperature',
    '26': 'humidity',
    '05': 'PIO',
  }

  constructor(public id: string, public device: IDeviceModel) {
    super(id, device)
    this.owId = new OwId(device.id)
  }

  async read(): Promise<string> {
    const result = await this.rawApiService.read(
      `/${this.device.id}/${OwfsDevice.family2defaultPath[this.owId.family]}`
    )
    // format result based on family
    let output: string = result.payload.trim()
    switch (this.owId.family) {
      case '10':
        output = parseFloat(output).toFixed(2).toString()
        break
      default:
        break
    }
    return output
  }

  async write(value: string): Promise<string> {
    const response = await this.rawApiService.write(
      `/${this.device.id}/${OwfsDevice.family2defaultPath[this.owId.family]}`,
      value
    )
    console.log(`>>> owFsDevice write response`, response)
    return 'ok'
  }
}
