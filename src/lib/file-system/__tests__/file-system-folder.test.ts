import { afterEach, describe, expect, it, vi } from 'vitest';
import { isFileSystemAccessSupported } from '../file-system-folder';

describe('isFileSystemAccessSupported', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('is true when window.showDirectoryPicker is a function', () => {
        vi.stubGlobal('window', {
            ...window,
            showDirectoryPicker: () => Promise.resolve(),
        });

        expect(isFileSystemAccessSupported()).toBe(true);
    });

    it('is false when window.showDirectoryPicker is missing', () => {
        const stub = { ...window } as unknown as Window;
        // @ts-expect-error - intentionally removing the picker
        delete stub.showDirectoryPicker;
        vi.stubGlobal('window', stub);

        expect(isFileSystemAccessSupported()).toBe(false);
    });
});
