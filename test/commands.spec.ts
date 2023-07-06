import { run } from './run';

describe('simple command', () => {
    it('should return test1:abc', async () => {
        const result = await run(['simple:test1', 'abc']);
        expect(result).toBe('test1:abc');
    });

    it('should return test2:123:abc', async () => {
        const result = await run(['test2', '123']);
        expect(result).toBe('test2:123:abc');
    });

    it('should return test2:123:xyz', async () => {
        const result = await run(['test2', '123', 'xyz']);
        expect(result).toBe('test2:123:xyz');
    });
});

describe('multiple command', () => {
    it('should return test3', async () => {
        const result = await run(['MultipleCommand:test3']);
        expect(result).toBe('test3');
    });

    it('should return test4', async () => {
        const result = await run(['MultipleCommand:test4']);
        expect(result).toBe('test4');
    });

    it('should return test5', async () => {
        const result = await run(['multiple:test5']);
        expect(result).toBe('test5');
    });
});

describe('original command', () => {
    it('should return originalCommand1', async () => {
        const result = await run(['originalCommand1']);
        expect(result).toBe('originalCommand1');
    });

    it('should return originalCommand', async () => {
        const result = await run(['originalCommand']);
        expect(result).toBe('originalCommand');
    });

    it('should return originalCommand3', async () => {
        const result = await run(['originalCommand3']);
        expect(result).toBe('originalCommand');
    });
});
