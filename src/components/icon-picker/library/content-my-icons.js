/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
    Button,
    Flex,
    FlexItem,
    Notice,
    SearchControl,
    Spinner,
    __experimentalConfirmDialog as ConfirmDialog // eslint-disable-line
} from '@wordpress/components';
import { trash } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { MY_ICONS_STORE } from '../../../store/my-icons';

/**
 * ContentMyIcons Component
 * Lists the SVG icons saved to the site-wide library.
 */
export const ContentMyIcons = ({ currentCustomSvg, onIconSelect, onGoToCustomTab }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingDelete, setPendingDelete] = useState(null);
    const [error, setError] = useState('');

    const { myIcons, hasLoaded, deletingIds } = useSelect(select => {
        const store = select(MY_ICONS_STORE);
        const icons = store.getMyIcons();

        return {
            myIcons: icons,
            hasLoaded: store.hasLoadedMyIcons(),
            deletingIds: icons.filter(icon => store.isDeletingMyIcon(icon.id)).map(icon => icon.id)
        };
    }, []);

    const { deleteIcon } = useDispatch(MY_ICONS_STORE);

    const filteredIcons = searchTerm ? myIcons.filter(icon => icon.label.toLowerCase().includes(searchTerm.toLowerCase())) : myIcons;

    const confirmDelete = async () => {
        const icon = pendingDelete;
        setPendingDelete(null);

        if (!icon) {
            return;
        }

        try {
            setError('');
            await deleteIcon(icon.id);
        } catch (deleteError) {
            setError(deleteError?.message || __('The icon could not be deleted.', 'seamless'));
        }
    };

    if (!hasLoaded) {
        return (
            <div className="seam-modal__my-icons-placeholder">
                <Spinner />
                <p>{__('Loading your icons…', 'seamless')}</p>
            </div>
        );
    }

    return (
        <>
            {!!error && (
                <Notice status="error" onRemove={() => setError('')}>
                    {error}
                </Notice>
            )}

            {myIcons.length > 0 && (
                <Flex>
                    <FlexItem>
                        <SearchControl
                            value={searchTerm}
                            onChange={setSearchTerm}
                            label={__('Search your icons', 'seamless')}
                            placeholder={__('Search...', 'seamless')}
                            className="seam-modal__search"
                            size="compact"
                        />
                    </FlexItem>
                </Flex>
            )}

            {0 === myIcons.length && (
                <div className="seam-modal__my-icons-placeholder">
                    <p>{__('You have not saved any icons yet.', 'seamless')}</p>
                    <p className="seam-modal__my-icons-placeholder-help">
                        {__(
                            'Paste an SVG in the Custom SVG tab, give it a name, and choose “Add to My Icons” to make it available across the whole site.',
                            'seamless'
                        )}
                    </p>
                    <Button variant="primary" onClick={onGoToCustomTab} __next40pxDefaultSize>
                        {__('Add an icon', 'seamless')}
                    </Button>
                </div>
            )}

            {myIcons.length > 0 && 0 === filteredIcons.length && <p>{__('No icons found!', 'seamless')}</p>}

            {filteredIcons.length > 0 && (
                <div className="seam-modal__icons seam-modal__my-icons">
                    {filteredIcons.map(icon => {
                        const isDeleting = deletingIds.includes(icon.id);

                        return (
                            <div className="seam-modal__my-icons-item" key={icon.id}>
                                <Button
                                    className={`seam-modal__icons-button ${currentCustomSvg === icon.svg ? 'is-selected' : ''}`}
                                    onClick={() => onIconSelect(icon)}
                                    disabled={isDeleting}
                                    label={sprintf(
                                        /* translators: %s: icon name. */
                                        __('Use %s', 'seamless'),
                                        icon.label
                                    )}
                                    showTooltip
                                >
                                    <span
                                        className="seam-modal__my-icons-preview"
                                        dangerouslySetInnerHTML={{ __html: icon.svg }} // eslint-disable-line react/no-danger
                                    />
                                    <span className="icon-title">{icon.label}</span>
                                </Button>
                                <Button
                                    className="seam-modal__my-icons-remove"
                                    icon={trash}
                                    iconSize={18}
                                    size="small"
                                    isDestructive
                                    isBusy={isDeleting}
                                    disabled={isDeleting}
                                    label={sprintf(
                                        /* translators: %s: icon name. */
                                        __('Delete %s', 'seamless'),
                                        icon.label
                                    )}
                                    onClick={() => setPendingDelete(icon)}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmDialog
                isOpen={!!pendingDelete}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
                confirmButtonText={__('Delete', 'seamless')}
            >
                {pendingDelete &&
                    sprintf(
                        /* translators: %s: icon name. */
                        __('Delete “%s” from your icon library? Blocks already using it keep their icon.', 'seamless'),
                        pendingDelete.label
                    )}
            </ConfirmDialog>
        </>
    );
};
