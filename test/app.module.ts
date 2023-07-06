import { Module } from '@nestjs/common';
import { CommandModule } from '../src/module';
import { SimpleCommand } from './simple.command';
import { MultipleCommand } from './multiple.command';
import { OriginalCommand1, OriginalCommand2, OriginalCommand3 } from './original.command';

@Module({
    imports: [CommandModule],
    providers: [SimpleCommand, MultipleCommand, OriginalCommand1, OriginalCommand2, OriginalCommand3]
})
export class AppModule {}
