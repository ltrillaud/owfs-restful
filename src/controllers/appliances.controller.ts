import { JsonController, Get, Put, Param, Body } from 'routing-controllers';
import { AppliancesModel } from '../models/appliances.model';
import { BaseAppliance } from '../models/appliances/base.appliance';

@JsonController('/apl')
export class ApplianceController {

    @Get('/')
    all() {
        let result: any = {};
        for (let key in AppliancesModel.appliances) {
            const val: BaseAppliance = AppliancesModel.appliances[key];
            result[key] = val.type;
        }
        return result;
    }

    @Get('/:apl')
    list( @Param('apl') apl: string) {
        console.log('   aplCtrl.ts Get apl=(' + apl + ')');
        return AppliancesModel.appliances[apl].read();
    }

    @Put('/:apl')
    write( @Param('apl') apl: string, @Body('value') value : any) {
        return AppliancesModel.appliances[apl].update();
    }
};