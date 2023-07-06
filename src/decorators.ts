import 'reflect-metadata';
import { SetMetadata } from '@nestjs/common';
import { Options, PositionalOptions } from 'yargs';
import { isNil } from 'lodash';

export const COMMAND_HANDLER_METADATA = '__command-handler-metadata__';
export const COMMAND_ARGS_METADATA = '__command-args-metadata__';
export const COMMANDS_HANDLER_METADATA = '__commands-handler-metadata__';
export const ORIGIN_COMMAND_HANDLER_METADATA = '__origin-command-handler-metadata__';

export interface CommandOption {
    /**
     * The command with arguments
     *
     * eg: "mycommand <myargument> [mysecondargument]"
     * @see commander .command() method for more details
     */
    command: string;

    /**
     * The describe of the command
     */
    describe?: string;

    /**
     * The alias of the command
     */
    alias?: string;

    /**
     * A list of command params
     */
    params?: {
        name: string;
        value: PositionalOptions | Options;
        type: 'positional' | 'option';
    }[];
}

export function Command(option?: CommandOption): MethodDecorator {
    return (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
        if (isNil(option)) {
            option = {
                command: key as string,
                describe: `${key as string}(auto generated)`
            };
        }

        // auto generated yargs options
        if (isNil(option.params)) {
            option.params = [];
            let i = 1;
            (Reflect.getMetadata('design:paramtypes', target, key) || []).map((p) => {
                const type = p.name.toLowerCase();
                if (['string', 'number', 'boolean'].includes(type)) {
                    option.params.push({
                        type: 'positional',
                        name: `${type}${i}`,
                        value: {
                            type
                        }
                    });
                    option.command += ` <${type}${i}>`;
                } else {
                    option.params.push({
                        type: 'positional',
                        name: `unknown${i}`,
                        value: {
                            type: undefined
                        }
                    });
                    option.command += ` [unknown${i}]`;
                }
                i = i + 1;
            });
        }
        SetMetadata(COMMAND_HANDLER_METADATA, option)(target, key, descriptor);
    };
}

export const Commands =
    (options?: CommandOption): ClassDecorator =>
    (target: any): void =>
        SetMetadata(COMMANDS_HANDLER_METADATA, options)(target);

export const OriginYargsCommand =
    (): ClassDecorator =>
    (target: any): void =>
        SetMetadata(ORIGIN_COMMAND_HANDLER_METADATA, true)(target);
