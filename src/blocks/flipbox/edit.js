/**
 * WordPress Dependencies
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import Inspector from './inspector';

const TEMPLATE = [
    ['seam/flipbox-front', {}],
    ['seam/flipbox-back', {}]
];

const Edit = props => {
    const { attributes } = props;
    const { flipEffect, selectSide } = attributes;

    const blockProps = useBlockProps({
        className: classNames(flipEffect)
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'flip-box_inner-item' },
        {
            allowedBlocks: ['seam/flipbox-front', 'seam/flipbox-back'],
            template: TEMPLATE,
            templateLock: 'all',
            renderAppender: false
        }
    );

    return (
        <>
            <Inspector {...props} />
            <div {...blockProps}>
                <div className={`flip-box_item flip-box_hover ${selectSide}`}>
                    <div {...innerBlocksProps} />
                </div>
            </div>
        </>
    );
};

export default Edit;
