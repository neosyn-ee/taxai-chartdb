import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, FolderOpen, Folder, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { useConfig } from '@/hooks/use-config';
import { useChartDB } from '@/hooks/use-chartdb';
import {
    isFileSystemAccessSupported,
    pickFolder,
} from '@/lib/file-system/file-system-folder';
import type { SaveMode } from '@/lib/domain/config';

export const SaveModeControl: React.FC = () => {
    const { t } = useTranslation();
    const { config, updateConfig } = useConfig();
    const { saveNow } = useChartDB();
    const [saving, setSaving] = useState(false);

    const fsSupported = isFileSystemAccessSupported();
    const saveMode: SaveMode = config?.saveMode ?? 'auto';
    const folderHandle = config?.folderHandle;

    const handleModeChange = useCallback(
        (next: string) => {
            updateConfig({ config: { saveMode: next as SaveMode } });
        },
        [updateConfig]
    );

    const handleLinkFolder = useCallback(async () => {
        const handle = await pickFolder();
        if (handle) {
            updateConfig({ config: { folderHandle: handle } });
        }
    }, [updateConfig]);

    const handleUnlinkFolder = useCallback(() => {
        updateConfig({
            updateFn: (current) => {
                const next = { ...current };
                delete next.folderHandle;
                return next;
            },
        });
    }, [updateConfig]);

    const handleSaveNow = useCallback(async () => {
        setSaving(true);
        try {
            await saveNow();
        } finally {
            setSaving(false);
        }
    }, [saveNow]);

    return (
        <div className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSaveNow}
                        disabled={saving}
                    >
                        <Save className="mr-1 size-4" />
                        {saving
                            ? t('save_mode.saving')
                            : t('save_mode.save_now')}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {t('save_mode.save_now_tooltip')}
                </TooltipContent>
            </Tooltip>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                        {saveMode === 'auto'
                            ? t('save_mode.auto')
                            : t('save_mode.manual')}
                        {folderHandle ? (
                            <FolderOpen className="ml-1 size-4 text-emerald-500" />
                        ) : null}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                        {t('save_mode.mode_label')}
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                        value={saveMode}
                        onValueChange={handleModeChange}
                    >
                        <DropdownMenuRadioItem value="auto">
                            {t('save_mode.auto')}
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="manual">
                            {t('save_mode.manual')}
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>

                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>
                        {t('save_mode.folder_label')}
                    </DropdownMenuLabel>

                    {!fsSupported ? (
                        <DropdownMenuItem
                            disabled
                            className="text-xs text-muted-foreground"
                        >
                            <AlertTriangle className="mr-2 size-4" />
                            {t('save_mode.folder_unsupported')}
                        </DropdownMenuItem>
                    ) : folderHandle ? (
                        <>
                            <DropdownMenuItem
                                disabled
                                className="text-xs text-muted-foreground"
                            >
                                <Folder className="mr-2 size-4" />
                                {folderHandle.name}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLinkFolder}>
                                {t('save_mode.change_folder')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleUnlinkFolder}>
                                {t('save_mode.unlink_folder')}
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <DropdownMenuItem onClick={handleLinkFolder}>
                            <FolderOpen className="mr-2 size-4" />
                            {t('save_mode.link_folder')}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
