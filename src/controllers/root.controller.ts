import {JsonController, Get} from 'routing-controllers';

@JsonController()
export class RootController {

    @Get('/')
    showUsage() {
        return {
            usage: [
                '/raw/v*/**',
                '/dev/v*/**',
                '/apl/v*/**',
            ]
        };
    }
}
