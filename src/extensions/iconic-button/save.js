import { addFilter } from '@wordpress/hooks';
import { allowedBlocks } from './allowed-blocks';

/**
 * Add iconic button classes to saved block HTML for the frontend.
 *
 * @param {Object} props      Block save props.
 * @param {Object} blockType  Block type definition.
 * @param {Object} attributes Block attributes.
 * @return {Object} Modified props.
 */
function addIconicButtonSaveProps( props, blockType, attributes ) {
    if ( ! allowedBlocks.includes( blockType.name ) ) {
        return props;
    }

    const { iconicButtonEnabled, iconicButtonUniqueClass, iconicButtonIconPosition, className } = attributes;

    // Alternative and Outline are text-only styles — skip the icon classes
    // entirely rather than adding then hiding them with CSS. Mirrors the same
    // check in editor.js and inc/extensions.php (seam_render_iconic_button).
    const isTextOnlyStyle = /is-style-(alternative|outline)/.test( className || '' );

    if ( ! iconicButtonEnabled || ! iconicButtonUniqueClass || isTextOnlyStyle ) {
        return props;
    }

    const classes = [ 'seam-icon-button', iconicButtonUniqueClass ];
    if ( iconicButtonIconPosition !== '' ) {
        classes.push( 'seam-icon-before' );
    }

    props.className = ( ( props.className || '' ) + ' ' + classes.join( ' ' ) ).trim();
    return props;
}

addFilter( 'blocks.getSaveContent.extraProps', 'seam/iconic-button-save-props', addIconicButtonSaveProps );
