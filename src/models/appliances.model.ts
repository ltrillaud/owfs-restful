import { HeaterAppliance } from './appliances/heater.appliance';
import { SensorAppliance } from './appliances/sensor.appliance';
import { ShutterAppliance } from './appliances/shutter.appliance';
import { T1foAppliance } from './appliances/t1fo.appliance';

export class AppliancesModel {
    static appliances: { [index: string]: any } = [];

    private static proxy2class(proxy: string): string {
        return proxy.charAt(0).toUpperCase() + proxy.substring(1) + 'Appliance';
    }

    static register(appliances: { [index: string]: string }) {
        for (let key in appliances) {
            if (appliances.hasOwnProperty(key)) {
                // TODO : build instance dynamicaly
                const val: any = appliances[key];
                const appliance = val.appliance;
                switch (appliance) {
                    case 'sensor':
                        AppliancesModel.appliances[key] = new SensorAppliance( val);
                        break;
                    case 'heater':
                        AppliancesModel.appliances[key] = new HeaterAppliance( val);
                        break;
                    case 'shutter':
                        AppliancesModel.appliances[key] = new ShutterAppliance( val);
                        break;
                    case 't1fo':
                        AppliancesModel.appliances[key] = new T1foAppliance( val);
                        break;
                    default:
                        console.warn('appliances.ts unknow proxy(' + appliance + ')');    
                }
            }
        }
    }
}

