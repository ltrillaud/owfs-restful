import { JsonController, Get, Put, Param, Body } from 'routing-controllers';
import { server } from '../app';

@JsonController('/raw')
export class RawController {

    @Get('/')
    all() {
        return server.owfsClient.list('/');
    }

    @Get('/:id')
    list( @Param('id') id: string) {
        return server.owfsClient.list('/' + id);
    }

    @Get('/:id/:att')
    read( @Param('id') id: string, @Param('att') att: string) {
        return server.owfsClient.read('/' + id + '/' + att);
    }

    @Put('/:id/:att')
    write( @Param('id') id: string, @Param('att') att: string, @Body('value') value : any) {
        return server.owfsClient.write('/' + id + '/' + att, value);
    }
};