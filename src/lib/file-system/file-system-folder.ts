const DIAGRAM_FILE_EXTENSION = '.chartdb.json';

export type FolderPermissionState = 'granted' | 'prompt' | 'denied';

export const isFileSystemAccessSupported = (): boolean =>
    typeof window !== 'undefined' &&
    typeof window.showDirectoryPicker === 'function';

export const pickFolder =
    async (): Promise<FileSystemDirectoryHandle | null> => {
        if (!isFileSystemAccessSupported()) return null;
        try {
            return await window.showDirectoryPicker({
                mode: 'readwrite',
            });
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return null;
            }
            throw error;
        }
    };

export const queryFolderPermission = async (
    handle: FileSystemDirectoryHandle
): Promise<FolderPermissionState> =>
    (await handle.queryPermission({
        mode: 'readwrite',
    })) as FolderPermissionState;

export const ensureFolderPermission = async (
    handle: FileSystemDirectoryHandle
): Promise<boolean> => {
    const current = await queryFolderPermission(handle);
    if (current === 'granted') return true;
    if (current === 'denied') return false;
    const requested = (await handle.requestPermission({
        mode: 'readwrite',
    })) as FolderPermissionState;
    return requested === 'granted';
};

const diagramFileName = (diagramId: string): string =>
    `${diagramId}${DIAGRAM_FILE_EXTENSION}`;

export const writeDiagramFile = async ({
    handle,
    diagramId,
    snapshot,
}: {
    handle: FileSystemDirectoryHandle;
    diagramId: string;
    snapshot: string;
}): Promise<void> => {
    const fileHandle = await handle.getFileHandle(diagramFileName(diagramId), {
        create: true,
    });
    const writable = await fileHandle.createWritable();
    try {
        await writable.write(snapshot);
    } finally {
        await writable.close();
    }
};
