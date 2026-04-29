import React from 'react';
import { Button } from '@/components/button/button';
import {
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogInternalContent,
    DialogTitle,
} from '@/components/dialog/dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { useTranslation } from 'react-i18next';
import { SelectDatabaseContent } from './select-database-content';
import { useDialog } from '@/hooks/use-dialog';
import { useConfig } from '@/hooks/use-config';
import { useChartDB } from '@/hooks/use-chartdb';
import { FolderOpen } from 'lucide-react';
import {
    isFileSystemAccessSupported,
    pickFolder,
} from '@/lib/file-system/file-system-folder';
import { useCallback } from 'react';

export interface SelectDatabaseProps {
    onContinue: () => void;
    databaseType: DatabaseType;
    setDatabaseType: React.Dispatch<React.SetStateAction<DatabaseType>>;
    hasExistingDiagram: boolean;
    createNewDiagram: () => void;
}

export const SelectDatabase: React.FC<SelectDatabaseProps> = ({
    onContinue,
    databaseType,
    setDatabaseType,
    hasExistingDiagram,
    createNewDiagram,
}) => {
    const { t } = useTranslation();
    const { openImportDiagramDialog, closeCreateDiagramDialog } = useDialog();
    const { config, updateConfig } = useConfig();
    const { syncFromFolder } = useChartDB();
    const folderLinked = !!config?.folderHandle;
    const fsSupported = isFileSystemAccessSupported();

    const handleLinkAndSync = useCallback(async () => {
        const handle = await pickFolder();
        if (!handle) return;
        await updateConfig({ config: { folderHandle: handle } });
        await syncFromFolder();
        closeCreateDiagramDialog();
    }, [updateConfig, syncFromFolder, closeCreateDiagramDialog]);

    const handleSyncFromFolder = useCallback(async () => {
        await syncFromFolder();
        closeCreateDiagramDialog();
    }, [syncFromFolder, closeCreateDiagramDialog]);

    return (
        <>
            <DialogHeader>
                <DialogTitle>
                    {t('new_diagram_dialog.database_selection.title')}
                </DialogTitle>
                <DialogDescription>
                    {t('new_diagram_dialog.database_selection.description')}
                </DialogDescription>
            </DialogHeader>
            <DialogInternalContent>
                <SelectDatabaseContent
                    databaseType={databaseType}
                    onContinue={onContinue}
                    setDatabaseType={setDatabaseType}
                />
            </DialogInternalContent>
            <DialogFooter className="mt-4 flex !justify-between gap-2">
                <div className="flex gap-2">
                    {hasExistingDiagram ? (
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                {t('new_diagram_dialog.cancel')}
                            </Button>
                        </DialogClose>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={openImportDiagramDialog}
                        >
                            {t('new_diagram_dialog.import_from_file')}
                        </Button>
                    )}
                    {folderLinked ? (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleSyncFromFolder}
                        >
                            <FolderOpen className="mr-1 size-4" />
                            {t('new_diagram_dialog.sync_from_folder')}
                        </Button>
                    ) : fsSupported ? (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleLinkAndSync}
                        >
                            <FolderOpen className="mr-1 size-4" />
                            {t('new_diagram_dialog.link_folder')}
                        </Button>
                    ) : null}
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={createNewDiagram}
                        disabled={databaseType === DatabaseType.GENERIC}
                    >
                        {t('new_diagram_dialog.empty_diagram')}
                    </Button>
                    <Button
                        type="button"
                        variant="default"
                        disabled={databaseType === DatabaseType.GENERIC}
                        onClick={onContinue}
                    >
                        {t('new_diagram_dialog.continue')}
                    </Button>
                </div>
            </DialogFooter>
        </>
    );
};
