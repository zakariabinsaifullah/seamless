import { RichText, useBlockProps } from '@wordpress/block-editor';

import Inspector from './inspector';

const Edit = ({ attributes, setAttributes }) => {
    const { heading, description, footerText, footerLink } = attributes;

    const blockProps = useBlockProps({ className: 'flip-box_face flip-box_front' });

    const FooterTag = footerLink?.url ? 'a' : 'div';
    const footerProps = footerLink?.url
        ? { href: footerLink.url, ...(footerLink.openInNewTab && { target: '_blank', rel: 'noopener' }) }
        : {};

    return (
        <>
            <Inspector attributes={attributes} setAttributes={setAttributes} />
            <div {...blockProps}>
                <div className="flip-box-content flip-box_front-content">
                    <RichText
                        tagName="h2"
                        className="flip-box_heading"
                        value={heading}
                        onChange={value => setAttributes({ heading: value })}
                        placeholder="Heading…"
                    />
                    <RichText
                        tagName="p"
                        value={description}
                        onChange={value => setAttributes({ description: value })}
                        placeholder="Description…"
                    />
                    <FooterTag className="flip-box_footer" {...footerProps}>
                        <RichText
                            tagName="span"
                            className="flip-box_footer-text"
                            value={footerText}
                            onChange={value => setAttributes({ footerText: value })}
                            placeholder="Footer text…"
                        />
                        <span className="flip-box_footer-arrow" aria-hidden="true">
                            ↗
                        </span>
                    </FooterTag>
                </div>
            </div>
        </>
    );
};

export default Edit;
