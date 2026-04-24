export const SAVE_MODES = ['auto', 'manual'] as const;
export type SaveMode = (typeof SAVE_MODES)[number];
export const DEFAULT_SAVE_MODE: SaveMode = 'auto';

export interface ChartDBConfig {
    defaultDiagramId: string;
    exportActions?: Date[];
    saveMode?: SaveMode;
    folderHandle?: FileSystemDirectoryHandle;
}
