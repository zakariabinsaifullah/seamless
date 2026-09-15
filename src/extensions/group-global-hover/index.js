/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { NativeToggleControl } from '../../components';
import GlobalHoverControls from './controls/global-hover-controls';

import './style.scss';

const BLOCK_NAME = 'core/group';

/**
 * Add global hover attributes to core/group.
 */
addFilter( 'blocks.registerBlockType', 'seam/group-global-hover-add-attributes', ( settings, name ) => {
    if ( name !== BLOCK_NAME ) {
        return settings;
    }

    return {
        ...settings,
        attributes: {
            ...settings.attributes,
            globalHoverEnabled: {
                type: 'boolean',
                default: false
            },
            globalHoverBgColor: {
                type: 'string'
            },
            customGlobalHoverBgColor: {
                type: 'string'
            },
            globalHoverColor: {
                type: 'string'
            },
            customGlobalHoverColor: {
                type: 'string'
            }
        }
    };
} );

/**
 * Add "Enable global hover" toggle + "Global Hover" color panel to core/group inspector.
 */
addFilter(
    'editor.BlockEdit',
    'seam/group-global-hover-add-inspector-controls',
    createHigherOrderComponent( BlockEdit => {
        return props => {
            const { name, attributes, setAttributes, clientId } = props;

            if ( name !== BLOCK_NAME ) {
                return <BlockEdit { ...props } />;
            }

            return (
                <>
                    <BlockEdit { ...props } />

                    { /* Toggle lives in the default (settings) panel */ }
                    <InspectorControls>
                        <PanelBody>
                            <NativeToggleControl
                                label={ __( 'Enable global hover', 'seamless' ) }
                                checked={ !! attributes.globalHoverEnabled }
                                onChange={ value => setAttributes( { globalHoverEnabled: value } ) }
                            />
                        </PanelBody>
                    </InspectorControls>

                    { /* Color pickers only shown when the feature is enabled */ }
                    { attributes.globalHoverEnabled && (
                        <InspectorControls group="color">
                            <GlobalHoverControls attributes={ attributes } setAttributes={ setAttributes } clientId={ clientId } />
                        </InspectorControls>
                    ) }
                </>
            );
        };
    } )
);

/**
 * Apply `seam-global-hover` class + CSS variables in the editor preview.
 */
addFilter(
    'editor.BlockListBlock',
    'seam/group-global-hover-add-styles',
    createHigherOrderComponent( BlockListBlock => {
        return props => {
            const { name, attributes } = props;

            if ( name !== BLOCK_NAME || ! attributes.globalHoverEnabled ) {
                return <BlockListBlock { ...props } />;
            }

            const { globalHoverBgColor, customGlobalHoverBgColor, globalHoverColor, customGlobalHoverColor } = attributes;

            const hasBg = globalHoverBgColor || customGlobalHoverBgColor;
            const hasColor = globalHoverColor || customGlobalHoverColor;

            if ( ! hasBg && ! hasColor ) {
                return <BlockListBlock { ...props } />;
            }

            const style = {};

            if ( hasBg ) {
                style[ '--seam-ghover-bg' ] = globalHoverBgColor
                    ? `var(--wp--preset--color--${ globalHoverBgColor })`
                    : customGlobalHoverBgColor;
            }

            if ( hasColor ) {
                style[ '--seam-ghover-color' ] = globalHoverColor
                    ? `var(--wp--preset--color--${ globalHoverColor })`
                    : customGlobalHoverColor;
            }

            const wrapperProps = {
                ...props.wrapperProps,
                style: {
                    ...props.wrapperProps?.style,
                    ...style
                }
            };

            const classes = [ props.className, 'seam-global-hover' ].filter( Boolean ).join( ' ' );

            return <BlockListBlock { ...props } className={ classes } wrapperProps={ wrapperProps } />;
        };
    } )
);
