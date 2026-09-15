import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { allowedBlocks } from './allowed-blocks';
import { NativeIconPicker, NativeToggleControl, NativeToggleGroupControl, NativeUnitControl, PanelColorControl } from '../../components';
import { getSVGString } from '../../helpers';

// Track panel open state
let initialOpen = false;

const seamIconicButtonPanel = createHigherOrderComponent( BlockEdit => {
    return props => {
        // Check if the block is in the allowed list
        if ( ! allowedBlocks.includes( props.name ) ) {
            return <BlockEdit { ...props } />;
        }

        const { attributes, setAttributes, clientId, isSelected } = props;
        const {
            iconicButtonEnabled,
            iconicButtonIconName,
            iconicButtonCustomSvg,
            iconicButtonIconPosition,
            iconicButtonIconSize,
            iconicButtonIconGap,
            iconicButtonUniqueClass,
            iconicButtonIconPadding,
            iconicButtonIconBgColor
        } = attributes;

        // Buttons default to `iconicButtonEnabled: true` (attribute.js) so every newly
        // inserted button already has the arrow. The unique class can't be a static
        // attribute default (it has to be per-instance), so assign it once on mount here.
        useEffect( () => {
            if ( iconicButtonEnabled && ! iconicButtonUniqueClass ) {
                setAttributes( { iconicButtonUniqueClass: `seam-icon-button-${ clientId.slice( 0, 8 ) }` } );
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [] );

        return (
            <>
                <BlockEdit key="edit" { ...props } />
                { isSelected && (
                    <InspectorControls>
                        <PanelBody title={ __( 'Icon Settings', 'seamless' ) } initialOpen={ initialOpen }>
                            <NativeToggleControl
                                label={ __( 'Add Icon to Button', 'seamless' ) }
                                checked={ iconicButtonEnabled }
                                onChange={ () => {
                                    const newEnabled = ! iconicButtonEnabled;
                                    const newAttrs = { iconicButtonEnabled: newEnabled };
                                    if ( newEnabled && ! iconicButtonUniqueClass ) {
                                        newAttrs.iconicButtonUniqueClass = `seam-icon-button-${ clientId.slice( 0, 8 ) }`;
                                    }
                                    setAttributes( newAttrs );
                                    initialOpen = true;
                                } }
                            />
                            { iconicButtonEnabled && (
                                <>
                                    <NativeIconPicker
                                        onIconSelect={ ( iconName, iconType, iconObj ) => {
                                            // Important: We save the icon SVG string so it works with CSS masks in PHP
                                            const svgString = getSVGString( iconObj );
                                            setAttributes( {
                                                iconicButtonIcon: svgString,
                                                iconicButtonIconName: iconName,
                                                iconicButtonIconType: iconType,
                                                iconicButtonCustomSvg: ''
                                            } );
                                        } }
                                        onCustomSvgInsert={ ( { customSvgCode, iconType } ) => {
                                            setAttributes( {
                                                iconicButtonCustomSvg: customSvgCode,
                                                iconicButtonIconType: iconType,
                                                iconicButtonIconName: '',
                                                iconicButtonIcon: ''
                                            } );
                                        } }
                                        iconName={ iconicButtonIconName }
                                        customSvgCode={ iconicButtonCustomSvg }
                                        iconSize={ 24 }
                                    />
                                    <NativeToggleGroupControl
                                        label={ __( 'Position', 'seamless' ) }
                                        value={ iconicButtonIconPosition }
                                        options={ [
                                            { label: __( 'Before', 'seamless' ), value: 'seam-icon-before' },
                                            { label: __( 'After', 'seamless' ), value: '' }
                                        ] }
                                        onChange={ value => setAttributes( { iconicButtonIconPosition: value } ) }
                                    />
                                    <NativeUnitControl
                                        label={ __( 'Size', 'seamless' ) }
                                        value={ iconicButtonIconSize }
                                        onChange={ value => setAttributes( { iconicButtonIconSize: value } ) }
                                        mb="16px"
                                    />
                                    <NativeUnitControl
                                        label={ __( 'Gap', 'seamless' ) }
                                        value={ iconicButtonIconGap }
                                        onChange={ value => setAttributes( { iconicButtonIconGap: value } ) }
                                        mb="16px"
                                    />
                                    <NativeUnitControl
                                        label={ __( 'Icon Padding', 'seamless' ) }
                                        value={ iconicButtonIconPadding }
                                        onChange={ value => setAttributes( { iconicButtonIconPadding: value } ) }
                                        mb="16px"
                                    />
                                    <PanelColorControl
                                        label={ __( 'Icon Background', 'seamless' ) }
                                        colorSettings={ [
                                            {
                                                value: iconicButtonIconBgColor,
                                                onChange: color => setAttributes( { iconicButtonIconBgColor: color } )
                                            }
                                        ] }
                                    />
                                </>
                            ) }
                        </PanelBody>
                    </InspectorControls>
                ) }
            </>
        );
    };
}, 'withSeamIconicButtonPanel' );

addFilter( 'editor.BlockEdit', 'seam/iconic-button-panel', seamIconicButtonPanel );
