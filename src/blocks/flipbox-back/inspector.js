import { __ } from '@wordpress/i18n';
import { InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, Button, BaseControl } from '@wordpress/components';
import { useId } from '@wordpress/element';

const Inspector = ({ attributes, setAttributes }) => {
    const { backgroundImage } = attributes;
    const id = useId();

    return (
        <InspectorControls>
            <PanelBody title={__('Background', 'seamless')} initialOpen={true}>
                <BaseControl id={id} label={__('Background Image', 'seamless')} __nextHasNoMarginBottom>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={media => setAttributes({ backgroundImage: { id: media.id, url: media.url, alt: media.alt } })}
                                allowedTypes={['image']}
                                value={backgroundImage?.id}
                                render={({ open }) => (
                                    <Button variant="secondary" size="small" onClick={open}>
                                        {backgroundImage ? __('Replace', 'seamless') : __('Select Image', 'seamless')}
                                    </Button>
                                )}
                            />
                        </MediaUploadCheck>
                        {backgroundImage && (
                            <Button variant="tertiary" size="small" isDestructive onClick={() => setAttributes({ backgroundImage: undefined })}>
                                {__('Remove', 'seamless')}
                            </Button>
                        )}
                    </div>
                </BaseControl>
            </PanelBody>
        </InspectorControls>
    );
};

export default Inspector;
