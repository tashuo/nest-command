import { Injectable } from '@nestjs/common';
import { Command } from '../src/decorators';

@Injectable()
export class SimpleCommand {
    @Command({
        command: 'simple:test1 <p1>',
        describe: 'simple:test1',
        params: [
            {
                name: 'p1',
                type: 'positional',
                value: {
                    type: 'string'
                }
            }
        ]
    })
    test1(p1: string) {
        return `test1:${p1}`;
    }

    @Command()
    async test2(p1: number, p2 = 'abc') {
        return `test2:${p1}:${p2}`;
    }
}
