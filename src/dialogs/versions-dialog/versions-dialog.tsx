import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogInternalContent,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Button } from '@/components/button/button';
import { useTranslation } from 'react-i18next';
import { useDialog } from '@/hooks/use-dialog';
import { useChartDB } from '@/hooks/use-chartdb';
import { useStorage } from '@/hooks/use-storage';
import type { BaseDialogProps } from '../common/base-dialog-props';
import type { DiagramVersion } from '@/lib/domain/diagram-version';
import type { Diagram } from '@/lib/domain/diagram';

export interface VersionsDialogProps extends BaseDialogProps {}

interface VersionRow {
    version: DiagramVersion;
    tables: number;
    relationships: number;
}

const parseSnapshotMeta = (snapshot: string): Omit<VersionRow, 'version'> => {
    try {
        const parsed = JSON.parse(snapshot) as Partial<Diagram>;
        return {
            tables: parsed.tables?.length ?? 0,
            relationships: parsed.relationships?.length ?? 0,
        };
    } catch {
        return { tables: 0, relationships: 0 };
    }
};

export const VersionsDialog: React.FC<VersionsDialogProps> = ({ dialog }) => {
    const { t } = useTranslation();
    const { closeVersionsDialog } = useDialog();
    const { diagramId, restoreDiagramVersion } = useChartDB();
    const { listDiagramVersions } = useStorage();
    const [rows, setRows] = useState<VersionRow[]>([]);
    const [busyId, setBusyId] = useState<string | null>(null);

    const fetchVersions = useCallback(async () => {
        if (!diagramId) {
            setRows([]);
            return;
        }
        const versions = await listDiagramVersions(diagramId);
        setRows(
            versions.map((version) => ({
                version,
                ...parseSnapshotMeta(version.snapshot),
            }))
        );
    }, [diagramId, listDiagramVersions]);

    useEffect(() => {
        if (!dialog.open) return;
        fetchVersions();
    }, [dialog.open, fetchVersions]);

    const handleRestore = useCallback(
        async (versionId: string) => {
            setBusyId(versionId);
            try {
                await restoreDiagramVersion(versionId);
                closeVersionsDialog();
            } finally {
                setBusyId(null);
            }
        },
        [restoreDiagramVersion, closeVersionsDialog]
    );

    const empty = useMemo(() => rows.length === 0, [rows]);

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) closeVersionsDialog();
            }}
        >
            <DialogContent className="flex max-h-screen flex-col" showClose>
                <DialogHeader>
                    <DialogTitle>{t('versions_dialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('versions_dialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <DialogInternalContent>
                    {empty ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {t('versions_dialog.empty')}
                        </div>
                    ) : (
                        <ul className="flex flex-col divide-y">
                            {rows.map(({ version, tables, relationships }) => (
                                <li
                                    key={version.id}
                                    className="flex items-center justify-between gap-3 py-3"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {version.createdAt.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {t('versions_dialog.meta', {
                                                tables,
                                                relationships,
                                            })}
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={busyId !== null}
                                        onClick={() =>
                                            handleRestore(version.id)
                                        }
                                    >
                                        {busyId === version.id
                                            ? t('versions_dialog.restoring')
                                            : t('versions_dialog.restore')}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </DialogInternalContent>
                <DialogFooter className="flex gap-1 md:justify-end">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('versions_dialog.close')}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
