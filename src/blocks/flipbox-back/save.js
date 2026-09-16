import { RichText, useBlockProps, InnerBlocks } from '@wordpress/block-editor';

import { getBackgroundStyle } from './utils';

const Save = ({ attributes }) => {
    const { backgroundImage, heading } = attributes;

    const blockProps = useBlockProps.save({
        className: 'flip-box_face flip-box_front',
        style: getBackgroundStyle(backgroundImage)
    });

    return (
        <div {...blockProps}>
            <div className="flip-box-content flip-box_front-content">
                <RichText.Content tagName="h4" className="flip-box_heading" value={heading} />
                <div className="flip-box_actions">
                    <InnerBlocks.Content />
                </div>
            </div>
        </div>
    );
};

export default Save;
