import { z } from 'zod';

export const VERSION_RETENTION = 3;
export const VERSION_SNAPSHOT_DEBOUNCE_MS = 5000;

export interface DiagramVersion {
    id: string;
    diagramId: string;
    snapshot: string;
    createdAt: Date;
}

export const diagramVersionSchema: z.ZodType<DiagramVersion> = z.object({
    id: z.string(),
    diagramId: z.string(),
    snapshot: z.string(),
    createdAt: z.date(),
});
