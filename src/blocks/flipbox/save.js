/**
 * WordPress dependencies
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

/**
 * External Dependencies
 */
import classNames from 'classnames';

const Save = props => {
    const { attributes } = props;
    const { flipEffect, triggerType } = attributes;

    const blockProps = useBlockProps.save({
        className: classNames(flipEffect)
    });

    return (
        <div {...blockProps}>
            <div className={classNames('flip-box_item', { 'flip-box_hover': 'hover' === triggerType })}>
                <div className="flip-box_inner-item">
                    <InnerBlocks.Content />
                </div>
            </div>
        </div>
    );
};

export default Save;
