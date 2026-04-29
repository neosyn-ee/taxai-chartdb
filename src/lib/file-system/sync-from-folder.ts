import type { Diagram } from '@/lib/domain/diagram';
import { diagramSchema } from '@/lib/domain/diagram';
import type { StorageContext } from '@/context/storage-context/storage-context';
import type { FolderDiagramEntry } from './file-system-folder';

export interface SyncSummary {
    imported: number;
    updated: number;
    skipped: number;
}

export interface SyncDeps {
    storage: Pick<
        StorageContext,
        | 'getDiagram'
        | 'addDiagram'
        | 'updateDiagram'
        | 'deleteDiagramTables'
        | 'deleteDiagramRelationships'
        | 'deleteDiagramDependencies'
        | 'deleteDiagramAreas'
        | 'deleteDiagramCustomTypes'
        | 'deleteDiagramNotes'
        | 'addTable'
        | 'addRelationship'
        | 'addDependency'
        | 'addArea'
        | 'addCustomType'
        | 'addNote'
    >;
    entries: FolderDiagramEntry[];
}

const parseEntry = (entry: FolderDiagramEntry): Diagram | null => {
    try {
        const raw = JSON.parse(entry.snapshot);
        return diagramSchema.parse({
            ...raw,
            id: entry.diagramId,
            createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
            updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
        });
    } catch (error) {
        console.error(
            `Skipping invalid diagram file ${entry.diagramId}.chartdb.json`,
            error
        );
        return null;
    }
};

const replaceDiagramEntities = async (
    storage: SyncDeps['storage'],
    diagram: Diagram
): Promise<void> => {
    const { id } = diagram;
    await Promise.all([
        storage.deleteDiagramTables(id),
        storage.deleteDiagramRelationships(id),
        storage.deleteDiagramDependencies(id),
        storage.deleteDiagramAreas(id),
        storage.deleteDiagramCustomTypes(id),
        storage.deleteDiagramNotes(id),
    ]);

    await storage.updateDiagram({
        id,
        attributes: {
            name: diagram.name,
            databaseType: diagram.databaseType,
            databaseEdition: diagram.databaseEdition,
            updatedAt: diagram.updatedAt,
        },
    });

    await Promise.all([
        ...(diagram.tables ?? []).map((table) =>
            storage.addTable({ diagramId: id, table })
        ),
        ...(diagram.relationships ?? []).map((relationship) =>
            storage.addRelationship({ diagramId: id, relationship })
        ),
        ...(diagram.dependencies ?? []).map((dependency) =>
            storage.addDependency({ diagramId: id, dependency })
        ),
        ...(diagram.areas ?? []).map((area) =>
            storage.addArea({ diagramId: id, area })
        ),
        ...(diagram.customTypes ?? []).map((customType) =>
            storage.addCustomType({ diagramId: id, customType })
        ),
        ...(diagram.notes ?? []).map((note) =>
            storage.addNote({ diagramId: id, note })
        ),
    ]);
};

export const syncDiagramsFromFolder = async ({
    storage,
    entries,
}: SyncDeps): Promise<SyncSummary> => {
    const summary: SyncSummary = { imported: 0, updated: 0, skipped: 0 };

    for (const entry of entries) {
        const incoming = parseEntry(entry);
        if (!incoming) {
            summary.skipped += 1;
            continue;
        }

        const existing = await storage.getDiagram(incoming.id);

        if (!existing) {
            await storage.addDiagram({ diagram: incoming });
            summary.imported += 1;
            continue;
        }

        if (incoming.updatedAt.getTime() <= existing.updatedAt.getTime()) {
            summary.skipped += 1;
            continue;
        }

        await replaceDiagramEntities(storage, incoming);
        summary.updated += 1;
    }

    return summary;
};
