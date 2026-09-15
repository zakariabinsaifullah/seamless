import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import classnames from 'classnames';

import { softMinifyCssStrings, svgToBase64DataUrl } from '../../helpers';
import { allowedBlocks } from './allowed-blocks';

/**
 * Button Icon HOC - Updated to preserve existing classes
 */
const seamIconicButtonEditor = createHigherOrderComponent( BlockListBlock => {
    return props => {
        if ( ! allowedBlocks.includes( props.name ) ) {
            return <BlockListBlock { ...props } />;
        }

        const { attributes, clientId, className: existingClassName } = props;
        const {
            iconicButtonEnabled,
            iconicButtonIconName,
            iconicButtonCustomSvg,
            iconicButtonIcon,
            iconicButtonIconPosition,
            iconicButtonIconSize,
            iconicButtonIconGap,
            iconicButtonIconPadding,
            iconicButtonIconBgColor
        } = attributes;

        if ( ! iconicButtonEnabled ) {
            return <BlockListBlock { ...props } />;
        }

        // Use custom SVG if available, or fallback to old attribute
        const iconSVG = iconicButtonCustomSvg || iconicButtonIcon;

        if ( ! iconSVG && ! iconicButtonIconName ) {
            return <BlockListBlock { ...props } />;
        }

        // unique class
        const uniqueClass = `seam-icon-button-${ clientId.slice( 0, 8 ) }`;

        const btnIconClass = classnames( 'seam-icon-button', uniqueClass, iconicButtonIconPosition );

        // Combine existing className with animation class
        const combinedClassName = existingClassName ? `${ existingClassName } ${ btnIconClass }` : btnIconClass;

        // The editor preview paints the icon via a `background-image` (not a CSS mask) on
        // ::after, so it can show a background chip behind the glyph. This means editor
        // and frontend agree on colour: icons with their own baked-in fill (e.g. a custom
        // SVG with fill="#253B2F") render in that colour in both places. Icons that rely on
        // `currentColor` (no fill baked in) still get tinted correctly on the frontend
        // (style.scss inherits currentColor through the DOM), but in this editor preview
        // they fall back to the colour baked into the icon library's SVG markup, since a
        // background-image data URI is isolated from the host page's cascade.
        let maskStyle = '';
        if ( iconSVG ) {
            if ( iconicButtonIconGap ) {
                maskStyle += `
                .seam-icon-button.${ uniqueClass } .wp-block-button__link{
                    --seam-icon-gap: ${ iconicButtonIconGap }!important;
                }`;
            }
            if ( iconicButtonIconSize ) {
                maskStyle += `
                .seam-icon-button.${ uniqueClass } .wp-block-button__link::after{
                    --seam-icon-size: ${ iconicButtonIconSize }!important;
                }`;
            }
            if ( iconicButtonIconPadding ) {
                maskStyle += `
                .seam-icon-button.${ uniqueClass } .wp-block-button__link::after{
                    --seam-icon-padding: ${ iconicButtonIconPadding }!important;
                }`;
            }
            if ( iconicButtonIconBgColor ) {
                maskStyle += `
                .seam-icon-button.${ uniqueClass } .wp-block-button__link::after{
                    --seam-icon-bg-color: ${ iconicButtonIconBgColor }!important;
                }`;
            }
            maskStyle += `
            .seam-icon-button.${ uniqueClass } .wp-block-button__link::after{
                --seam-icon-url: url("${ svgToBase64DataUrl( iconSVG ) }");
                display: inline-flex;
            }`;
        }

        return (
            <>
                { maskStyle && <style>{ softMinifyCssStrings( maskStyle ) }</style> }
                <BlockListBlock { ...props } className={ combinedClassName } />
            </>
        );
    };
}, 'seamIconicButtonEditor' );

addFilter( 'editor.BlockListBlock', 'seam/iconic-button-editor', seamIconicButtonEditor );
