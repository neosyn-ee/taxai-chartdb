type FileSystemPermissionMode = 'read' | 'readwrite';
type PermissionState = 'granted' | 'denied' | 'prompt';

interface FileSystemHandlePermissionDescriptor {
    mode?: FileSystemPermissionMode;
}

interface FileSystemHandle {
    readonly kind: 'file' | 'directory';
    readonly name: string;
    queryPermission?: (
        descriptor?: FileSystemHandlePermissionDescriptor
    ) => Promise<PermissionState>;
    requestPermission?: (
        descriptor?: FileSystemHandlePermissionDescriptor
    ) => Promise<PermissionState>;
}

interface FileSystemWritableFileStream {
    write: (data: BufferSource | Blob | string) => Promise<void>;
    close: () => Promise<void>;
}

interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: 'file';
    createWritable: (options?: {
        keepExistingData?: boolean;
    }) => Promise<FileSystemWritableFileStream>;
    getFile: () => Promise<File>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
    readonly kind: 'directory';
    getFileHandle: (
        name: string,
        options?: { create?: boolean }
    ) => Promise<FileSystemFileHandle>;
    values: () => AsyncIterableIterator<
        FileSystemFileHandle | FileSystemDirectoryHandle
    >;
    entries: () => AsyncIterableIterator<
        [string, FileSystemFileHandle | FileSystemDirectoryHandle]
    >;
    queryPermission: (
        descriptor?: FileSystemHandlePermissionDescriptor
    ) => Promise<PermissionState>;
    requestPermission: (
        descriptor?: FileSystemHandlePermissionDescriptor
    ) => Promise<PermissionState>;
}

interface DirectoryPickerOptions {
    id?: string;
    mode?: FileSystemPermissionMode;
    startIn?:
        | 'desktop'
        | 'documents'
        | 'downloads'
        | 'music'
        | 'pictures'
        | 'videos'
        | FileSystemHandle;
}

declare global {
    interface Window {
        env?: Record<string, string>;
        showDirectoryPicker?: (
            options?: DirectoryPickerOptions
        ) => Promise<FileSystemDirectoryHandle>;
    }
}

export {};
