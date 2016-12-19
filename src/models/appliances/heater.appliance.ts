import { BaseAppliance } from './base.appliance';

type HeaterMode = 'E' | '1' | '2' | 'C';

export class HeaterAppliance extends BaseAppliance {
    private mode: HeaterMode = 'E';

    constructor(options: any) {
        super(options);
    }

    get() {
        // --- return the current mode
        return { mode: this.mode}
    }
    set() {
        // --- change the mode 
    }

}