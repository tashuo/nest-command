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
