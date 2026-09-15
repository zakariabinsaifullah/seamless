import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { NativeToggleGroupControl, NativeSelectControl } from '../../components';

import { FLIP_EFFECTS, SELECT_SIDE } from './constants';

const Inspector = props => {
    const { attributes, setAttributes } = props;
    const { selectSide, triggerType, flipEffect } = attributes;

    return (
        <InspectorControls>
            <PanelBody title={__('Flip Box Settings', 'seamless')} initialOpen={true}>
                <NativeToggleGroupControl
                    label={__('Preview Side', 'seamless')}
                    value={selectSide}
                    onChange={value => setAttributes({ selectSide: value })}
                    options={SELECT_SIDE}
                />
                <NativeSelectControl
                    label={__('Flip Effect', 'seamless')}
                    value={flipEffect}
                    onChange={value => setAttributes({ flipEffect: value })}
                    options={FLIP_EFFECTS}
                />
                <NativeToggleGroupControl
                    label={__('Flip Trigger', 'seamless')}
                    value={triggerType}
                    onChange={value => setAttributes({ triggerType: value })}
                    options={[
                        { label: __('Hover', 'seamless'), value: 'hover' },
                        { label: __('Click', 'seamless'), value: 'click' }
                    ]}
                />
            </PanelBody>
        </InspectorControls>
    );
};

export default Inspector;
