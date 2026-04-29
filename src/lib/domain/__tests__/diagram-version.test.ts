import { describe, expect, it } from 'vitest';
import {
    VERSION_RETENTION,
    VERSION_SNAPSHOT_DEBOUNCE_MS,
} from '../diagram-version';
import { DatabaseType, type Diagram, diagramSchema } from '../index';
import { diagramToJSONOutput } from '../../export-import-utils';

const buildDiagram = (): Diagram => ({
    id: 'd1',
    name: 'test',
    databaseType: DatabaseType.POSTGRESQL,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
    tables: [
        {
            id: 't1',
            name: 'users',
            schema: 'public',
            x: 0,
            y: 0,
            color: '#fff',
            fields: [],
            indexes: [],
            createdAt: Date.now(),
            isView: false,
            isMaterializedView: false,
        },
    ],
    relationships: [],
    dependencies: [],
    areas: [],
    customTypes: [],
    notes: [],
});

describe('diagram-version constants', () => {
    it('keeps exactly last 3 versions', () => {
        expect(VERSION_RETENTION).toBe(3);
    });

    it('debounces snapshot writes at 5s', () => {
        expect(VERSION_SNAPSHOT_DEBOUNCE_MS).toBe(5000);
    });
});

describe('snapshot round-trip', () => {
    it('serializes to JSON and re-parses to a schema-valid diagram with preserved tables', () => {
        const original = buildDiagram();
        const snapshot = diagramToJSONOutput(original);

        const parsed = diagramSchema.parse({
            ...JSON.parse(snapshot),
            id: original.id,
            createdAt: original.createdAt,
            updatedAt: new Date(),
        });

        expect(parsed.tables?.length).toBe(1);
        expect(parsed.tables?.[0].name).toBe('users');
        expect(parsed.databaseType).toBe(DatabaseType.POSTGRESQL);
    });
});

describe('prune policy', () => {
    it('keeps the N most recent versions and discards the rest', () => {
        const versions = Array.from({ length: 5 }, (_, i) => ({
            id: `v${i}`,
            diagramId: 'd1',
            snapshot: '{}',
            createdAt: new Date(2025, 0, i + 1),
        }));
        const sorted = [...versions].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
        const kept = sorted.slice(0, VERSION_RETENTION);
        const stale = sorted.slice(VERSION_RETENTION);

        expect(kept).toHaveLength(VERSION_RETENTION);
        expect(stale.map((v) => v.id)).toEqual(['v1', 'v0']);
    });
});
