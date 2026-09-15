import { RichText, useBlockProps } from '@wordpress/block-editor';

const Save = ({ attributes }) => {
    const { heading, description, footerText, footerLink } = attributes;

    const blockProps = useBlockProps.save({ className: 'flip-box_face flip-box_front' });

    const FooterTag = footerLink?.url ? 'a' : 'div';
    const footerProps = footerLink?.url
        ? { href: footerLink.url, ...(footerLink.openInNewTab && { target: '_blank', rel: 'noopener' }) }
        : {};

    return (
        <div {...blockProps}>
            <div className="flip-box-content flip-box_front-content">
                <RichText.Content tagName="h4" className="flip-box_heading" value={heading} />
                <RichText.Content tagName="p" value={description} />
                <FooterTag className="flip-box_footer" {...footerProps}>
                    <RichText.Content tagName="span" className="flip-box_footer-text" value={footerText} />
                    <span className="flip-box_footer-arrow" aria-hidden="true">
                        ↗
                    </span>
                </FooterTag>
            </div>
        </div>
    );
};

export default Save;
