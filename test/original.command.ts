import { Injectable } from '@nestjs/common';
import { OriginYargsCommand } from '../src/decorators';
import * as yargs from 'yargs';

@Injectable()
@OriginYargsCommand()
export class OriginalCommand1 implements yargs.CommandModule {
    command = 'originalCommand1';
    describe = 'original command test';
    test: string;

    builder(args: yargs.Argv) {
        return args.option('test', {
            alias: 't',
            type: 'boolean',
            describe: 'test param.',
            default: false
        });
    }

    async handler(args: yargs.Arguments) {
        return new Promise<string>((resolve) => setTimeout(() => resolve('originalCommand1'), 0));
    }
}

class OriginalYargsCommand implements yargs.CommandModule {
    command = 'originalCommand';
    describe = 'origin command test';

    builder(args: yargs.Argv) {
        return args.option('test', {
            alias: 't',
            type: 'boolean',
            describe: 'test param.',
            default: false
        });
    }

    async handler(args: yargs.Arguments) {
        return new Promise<string>((resolve) => setTimeout(() => resolve('originalCommand'), 0));
    }
}

@Injectable()
@OriginYargsCommand()
export class OriginalCommand2 extends OriginalYargsCommand {}

@Injectable()
@OriginYargsCommand()
export class OriginalCommand3 extends OriginalYargsCommand {
    command = 'originalCommand3';
}
