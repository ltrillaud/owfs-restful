/* eslint-disable quote-props */
import Container from 'typedi'
import { RawApiService } from '../../../api/raw-api-service'
import { c } from '../../../console'
import { BaseDevice, IDeviceModel, IDeviceReadResponse } from '../base.device'

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

  async read(): Promise<IDeviceReadResponse> {
    let output: string
    try {
      const result = await this.rawApiService.read(
        `/${this.device.id}/${OwfsDevice.family2defaultPath[this.owId.family]}`,
      )
      output = result.payload.trim()
      // format result based on family
      switch (this.owId.family) {
        case '10':
          output = parseFloat(output).toFixed(2).toString()
          break
        default:
          break
      }
    } catch (error) {
      output = 'NaN'
    }

    return {
      family: OwfsDevice.family2defaultPath[this.owId.family],
      value: output,
    }
  }

  async write(value: string): Promise<string> {
    console.log(c(this), `writing value(${value}) in id(${this.device.id}) ...`)

    const response = await this.rawApiService.write(
      `/${this.device.id}/${OwfsDevice.family2defaultPath[this.owId.family]}`,
      value,
    )
    // console.log('>>> owFsDevice write response', response)
    return response.header.ret === 0 ? 'ok' : 'ko'
  }
}
