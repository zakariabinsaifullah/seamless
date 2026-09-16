// The icon is a treatment of the *default* (fill) button only — every other
// style variation (Alternative, Outline, Link, or anything a plugin registers)
// is icon-free. Rather than denylisting known styles, we treat any
// `is-style-*` class other than core's `is-style-fill` as non-default, so
// newly registered variations are excluded automatically.
// Mirrored in PHP by seam_iconic_button_is_default_style() in inc/extensions.php
// — keep both in sync.
const NON_DEFAULT_STYLE_REGEX = /\bis-style-(?!fill(?![\w-]))[\w-]+/;

/**
 * Whether a button's class list represents the default (fill) button style.
 *
 * @param {string} className Raw `className` attribute of the button block.
 * @return {boolean} True when the button uses the default style.
 */
export const isDefaultButtonStyle = ( className = '' ) => ! NON_DEFAULT_STYLE_REGEX.test( className || '' );
