import { describe, expect, it, vi } from 'vitest';
import { syncDiagramsFromFolder } from '../sync-from-folder';
import type { Diagram } from '@/lib/domain/diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import type { StorageContext } from '@/context/storage-context/storage-context';

const buildSnapshot = (overrides: Partial<Diagram>): string => {
    const diagram: Diagram = {
        id: 'd1',
        name: 'test',
        databaseType: DatabaseType.POSTGRESQL,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
        tables: [],
        relationships: [],
        dependencies: [],
        areas: [],
        customTypes: [],
        notes: [],
        ...overrides,
    };
    return JSON.stringify(diagram);
};

const makeStorage = (
    existing: Diagram | undefined
): StorageContext & {
    addDiagram: ReturnType<typeof vi.fn>;
    updateDiagram: ReturnType<typeof vi.fn>;
} => {
    const stub = {
        getDiagram: vi.fn(async () => existing),
        addDiagram: vi.fn(async () => {}),
        updateDiagram: vi.fn(async () => {}),
        deleteDiagramTables: vi.fn(async () => {}),
        deleteDiagramRelationships: vi.fn(async () => {}),
        deleteDiagramDependencies: vi.fn(async () => {}),
        deleteDiagramAreas: vi.fn(async () => {}),
        deleteDiagramCustomTypes: vi.fn(async () => {}),
        deleteDiagramNotes: vi.fn(async () => {}),
        addTable: vi.fn(async () => {}),
        addRelationship: vi.fn(async () => {}),
        addDependency: vi.fn(async () => {}),
        addArea: vi.fn(async () => {}),
        addCustomType: vi.fn(async () => {}),
        addNote: vi.fn(async () => {}),
    } as unknown as StorageContext & {
        addDiagram: ReturnType<typeof vi.fn>;
        updateDiagram: ReturnType<typeof vi.fn>;
    };
    return stub;
};

describe('syncDiagramsFromFolder', () => {
    it('imports a diagram missing from IndexedDB', async () => {
        const storage = makeStorage(undefined);
        const summary = await syncDiagramsFromFolder({
            storage,
            entries: [{ diagramId: 'd1', snapshot: buildSnapshot({}) }],
        });

        expect(summary).toEqual({ imported: 1, updated: 0, skipped: 0 });
        expect(storage.addDiagram).toHaveBeenCalledTimes(1);
    });

    it('updates IndexedDB when the file is more recent', async () => {
        const existing: Diagram = {
            id: 'd1',
            name: 'old',
            databaseType: DatabaseType.POSTGRESQL,
            createdAt: new Date('2025-01-01T00:00:00Z'),
            updatedAt: new Date('2025-01-01T00:00:00Z'),
        };
        const storage = makeStorage(existing);
        const summary = await syncDiagramsFromFolder({
            storage,
            entries: [
                {
                    diagramId: 'd1',
                    snapshot: buildSnapshot({
                        updatedAt: new Date('2025-01-05T00:00:00Z'),
                    }),
                },
            ],
        });

        expect(summary).toEqual({ imported: 0, updated: 1, skipped: 0 });
        expect(storage.updateDiagram).toHaveBeenCalledTimes(1);
        expect(storage.addDiagram).not.toHaveBeenCalled();
    });

    it('skips when IndexedDB record is more recent', async () => {
        const existing: Diagram = {
            id: 'd1',
            name: 'newer-local',
            databaseType: DatabaseType.POSTGRESQL,
            createdAt: new Date('2025-01-01T00:00:00Z'),
            updatedAt: new Date('2025-02-01T00:00:00Z'),
        };
        const storage = makeStorage(existing);
        const summary = await syncDiagramsFromFolder({
            storage,
            entries: [
                {
                    diagramId: 'd1',
                    snapshot: buildSnapshot({
                        updatedAt: new Date('2025-01-15T00:00:00Z'),
                    }),
                },
            ],
        });

        expect(summary).toEqual({ imported: 0, updated: 0, skipped: 1 });
        expect(storage.addDiagram).not.toHaveBeenCalled();
        expect(storage.updateDiagram).not.toHaveBeenCalled();
    });

    it('skips files with invalid JSON', async () => {
        const storage = makeStorage(undefined);
        const summary = await syncDiagramsFromFolder({
            storage,
            entries: [{ diagramId: 'broken', snapshot: '{ not json' }],
        });

        expect(summary).toEqual({ imported: 0, updated: 0, skipped: 1 });
    });
});
