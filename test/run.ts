import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { CommandModule } from '../src/module';
import { CommandService } from '../src/service';

export const run = async (command: string[], module = AppModule) => {
    const app = await NestFactory.createApplicationContext(module, {
        logger: false
    });
    return await app.select(CommandModule).get(CommandService).init().exec(command);
};
