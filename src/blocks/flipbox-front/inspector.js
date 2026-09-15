import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { NativeTextControl, NativeToggleControl } from '../../components';

const Inspector = ({ attributes, setAttributes }) => {
    const { footerLink } = attributes;

    return (
        <InspectorControls>
            <PanelBody title={__('Footer Link', 'seamless')} initialOpen={true}>
                <NativeTextControl
                    label={__('URL', 'seamless')}
                    value={footerLink?.url}
                    placeholder="https://"
                    onChange={value => setAttributes({ footerLink: { ...footerLink, url: value } })}
                />
                <NativeToggleControl
                    label={__('Open in new tab', 'seamless')}
                    checked={!!footerLink?.openInNewTab}
                    onChange={value => setAttributes({ footerLink: { ...footerLink, openInNewTab: value } })}
                />
            </PanelBody>
        </InspectorControls>
    );
};

export default Inspector;
