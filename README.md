## Description

NestJS Command tool, based on [yargs](https://github.com/yargs/yargs).

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

		`./test/multiple.command.ts`
	
	2. original yargs command

		`./test/multiple.command.ts`
