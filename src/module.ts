import { Module } from '@nestjs/common';
import { CommandService } from './service';

@Module({
    imports: [],
    providers: [CommandService],
    exports: [CommandService]
})
export class CommandModule {}
