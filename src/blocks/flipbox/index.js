import { registerBlockType } from '@wordpress/blocks';
import './style.scss';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';

const inlineIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="6" width="13" height="15" rx="2" opacity="0.35" />
        <rect x="8" y="3" width="13" height="15" rx="2" />
    </svg>
);

registerBlockType(metadata.name, {
    icon: inlineIcon,

    /**
     * @see ./edit.js
     */
    edit: Edit,

    /**
     * @see ./save.js
     */
    save
});
