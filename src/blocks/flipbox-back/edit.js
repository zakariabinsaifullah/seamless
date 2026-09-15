import { RichText, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import Inspector from './inspector';
import { getBackgroundStyle } from './utils';

const Edit = ({ attributes, setAttributes }) => {
    const { backgroundImage, heading } = attributes;

    const blockProps = useBlockProps({
        className: 'flip-box_face flip-box_back',
        style: getBackgroundStyle(backgroundImage)
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'flip-box_actions' },
        { template: [], templateLock: false }
    );

    return (
        <>
            <Inspector attributes={attributes} setAttributes={setAttributes} />
            <div {...blockProps}>
                <div className="flip-box-content flip-box_back-content">
                    <RichText
                        tagName="h2"
                        className="flip-box_heading"
                        value={heading}
                        onChange={value => setAttributes({ heading: value })}
                        placeholder="Heading…"
                    />
                    <div {...innerBlocksProps} />
                </div>
            </div>
        </>
    );
};

export default Edit;
