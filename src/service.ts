import { Injectable } from '@nestjs/common';
import { CommandModule, Options, PositionalOptions, Arguments } from 'yargs';
import { ModulesContainer } from '@nestjs/core';
import {
    COMMANDS_HANDLER_METADATA,
    COMMAND_HANDLER_METADATA,
    Command,
    CommandOption,
    ORIGIN_COMMAND_HANDLER_METADATA
} from './decorators';
import { compact, flattenDeep, pick, isNil } from 'lodash';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

@Injectable()
export class CommandService {
    constructor(private readonly modulesContainer: ModulesContainer) {}

    init(): CommandService {
        yargs.scriptName('cli').demandCommand(1).help('h').alias('h', 'help').alias('v', 'version').strict();

        const commands = this.scan();
        commands.map((command) => {
            yargs.command(command);
        });

        return this;
    }

    exec(args = hideBin(process.argv)) {
        return new Promise<Arguments>((resolve, reject) => {
            try {
                return yargs.onFinishCommand(resolve).parse(args);
            } catch (error) {
                reject(error);
            }
        });
    }

    scan(): CommandModule[] {
        return compact(
            flattenDeep<CommandModule>(
                Array.from(this.modulesContainer.values()).map((m) =>
                    Array.from(m.providers.values()).map(({ instance, metatype }) => {
                        if (!instance || typeof metatype !== 'function') {
                            return;
                        }

                        const prototype = Object.getPrototypeOf(instance);
                        // originYargsCommand
                        const originYargsCommandMeta = Reflect.getMetadata(
                            ORIGIN_COMMAND_HANDLER_METADATA,
                            instance.constructor
                        );
                        if (originYargsCommandMeta) {
                            let builder,
                                handler = null;
                            let currentProto = prototype;
                            // 遍历原型链获取builder和handler
                            while (!builder && !handler && currentProto) {
                                if (!builder && Object.getOwnPropertyDescriptor(currentProto, 'builder')) {
                                    builder = Object.getOwnPropertyDescriptor(currentProto, 'builder').value;
                                }
                                if (!handler && Object.getOwnPropertyDescriptor(currentProto, 'handler')) {
                                    handler = Object.getOwnPropertyDescriptor(currentProto, 'handler').value;
                                }
                                currentProto = Object.getPrototypeOf(currentProto);
                            }
                            if (!handler) {
                                return;
                            }
                            return [
                                {
                                    command: (instance as any)?.command,
                                    describe: (instance as any)?.describe,
                                    builder: builder,
                                    handler: handler
                                }
                            ];
                        }

                        // multiCommands
                        if (Reflect.hasMetadata(COMMANDS_HANDLER_METADATA, instance.constructor)) {
                            const commandsMeta = Reflect.getMetadata(COMMANDS_HANDLER_METADATA, instance.constructor);
                            const commands = Object.getOwnPropertyNames(prototype).filter(
                                (f) =>
                                    !Reflect.hasMetadata(COMMAND_HANDLER_METADATA, prototype[f]) && f !== 'constructor'
                            );
                            const parentCommand = commandsMeta?.command
                                ? commandsMeta?.command
                                : instance.constructor.name;
                            commands.map((f) => {
                                Command({
                                    command: `${parentCommand}:${f}`,
                                    describe: commandsMeta?.describe ? `${commandsMeta.describe}:${f}` : ''
                                })(prototype, f, Object.getOwnPropertyDescriptor(prototype, f));
                            });
                        }

                        // command
                        return Object.getOwnPropertyNames(prototype).map((p) => {
                            try {
                                if (isNil(prototype[p])) {
                                    return;
                                }
                            } catch (e) {
                                // console.log(e);
                                return;
                            }

                            const commandMeta: CommandOption = Reflect.getMetadata(
                                COMMAND_HANDLER_METADATA,
                                prototype[p]
                            );
                            if (!commandMeta) {
                                return;
                            }

                            const builder: CommandModule['builder'] = (yargs) => {
                                commandMeta.params.map(({ name, value, type }) => {
                                    switch (type) {
                                        case 'positional':
                                            yargs.positional(name, value as PositionalOptions);
                                            break;
                                        case 'option':
                                            yargs.option(name, value as Options);
                                            break;
                                        default:
                                            break;
                                    }
                                });
                                return yargs;
                            };

                            const handler: NonNullable<CommandModule['handler']> = async (args: Arguments) => {
                                const exec = instance[p].bind(instance);
                                const params = commandMeta.params.map((v) => args[v.name]);
                                const result = await exec(...params);
                                return result;
                            };

                            return {
                                ...pick(commandMeta, ['command', 'describe', 'alias']),
                                builder,
                                handler
                            };
                        });
                    })
                )
            )
        );
    }
}
