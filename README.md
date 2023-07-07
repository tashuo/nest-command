## Description

NestJS Command tool, based on [yargs](https://github.com/yargs/yargs).

## Dependency
* version 1.* for nestjs 7
* version 2.* for nestjs 8
* version 3.* for nestjs 9
* version 4.* for nestjs 10

## Installation

```bash
$ npm install --save nest-command

# with typescript
$ npm install --save-dev @types/yargs
```

## Quick Start
1. register `CommandModule` to `AppModule`

    ```typescript
    import { Module } from '@nestjs/common';
    import { CommandModule } from 'nest-command';

    @Module({
        imports: [CommandModule]
    })
    export class AppModule {}
    ```
2. create a cli entrypoint

    ```typescript
    # src/console.ts
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { CommandModule, CommandService } from 'nestjs-command';
    
    async function bootstrap() {
        try {
            const app = await NestFactory.createApplicationContext(AppModule, {
                // logger: ['debug'],
                logger: false,
            });
            await app.select(CommandModule).get(CommandService).init().exec();
        } catch (error) {
            console.error(error);
        }
        process.exit(1);
    }
    
    bootstrap();
    
    ```
3. cli config
    
    add the two line to `package.json`

    ```json
    {
        "console:dev": "ts-node -r tsconfig-paths/register src/console.ts",
        "console": "node dist/console.js"
   }
    ```
    
    and now you can run `npm run console:dev --help` to see all the commands and helps

4. custom command example

     1. create a command provider

        ```typescript
        # ./src/simple.command.ts
        import { Injectable } from '@nestjs/common';
        import { Command } from 'nestjs-command';
        
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
                console.log(`test1:${p1}`);
            }
        
            @Command()
            async test2(p1: number, p2 = 'abc') {
                console.log(`test2:${p1}:${p2}`);
            }
        }

        ```

        如上所示，假如`@Command`无配置params参数，会自动获取方法的参数并注册至yargs，但由于无法获取运行时的参数名所以自动注册的参数名无任何逻辑意义，直接看下面help输出中的*test2*就懂啥意思了，但也算为了偷懒少写代码提供了一条不归路：
        ```shell
        $ npm run console:dev --help
        Commands:
            cli simple:test1 <p1>           simple:test1
            cli test2 <number1> [unknown2]  test2(auto generated)
        ```
    
    2. register the command as a provider

        ```typescript
        # app.module.ts
        import { Module } from '@nestjs/common';
        import { CommandModule } from 'nest-command';
        import { SimpleCommand } from './simple.command';
    
        @Module({
            imports: [CommandModule],
            providers: [SimpleCommand],
        })
        export class AppModule {}
        ```

    3. run the command

        ```shell
        $ npm run console:dev simple:test1 abc // console.log('test1:abc');
    
        $ npm run console:dev test2 123 // console.log('test2:123:abc');
        ```

5. more usage examples

    1. multiple commands
        
        ```typescript
        # ./test/multiple.command.ts
        import { Injectable } from '@nestjs/common';
        import { Command, Commands } from '../src/decorators';

        @Injectable()
        @Commands()
        export class MultipleCommand {
            async test3() {
                return new Promise<string>((resolve) => setTimeout(() => resolve('test3'), 0));
            }
        
            test4() {
                return 'test4';
            }
        
            @Command({
                command: 'multiple:test5'
            })
            test5() {
                return 'test5';
            }
        }

        ```

        使用`@Commands`装饰的类会自动将所有的方法注册为独立的command，**便于批量注册**，但由于typescript装饰器只有编译时才会封装`design:*`等metadata信息，动态装饰器无法获取方法的参数，所以**此种方式只适合不需参数的方法**

    
    2. original yargs command

        `./test/multiple.command.ts`

        使用`@OriginYargsCommand`装饰的类也可以直接注册为command，**便于复用已有的yargs command**，所以必须保证该类继承了`yargs.CommandModule`，是一个标准的yargs command

        为啥会有这样一个feature呢，初衷是想重载`typeorm`的一些内置command，后面发现这些command没有export...先留着吧

