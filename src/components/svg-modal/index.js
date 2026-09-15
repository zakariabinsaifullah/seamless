import { useState } from '@wordpress/element';
import { Modal, Button, TextareaControl, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const CustomiconModal = ({ customiconPanel, setCustomiconPanel, onInsert, value }) => {
    const [code, setCode] = useState(value || '');
    const [size, setSize] = useState(30);

    if (!customiconPanel) return null;

    const handleInsert = () => {
        if (code.trim() === '') {
            wp.data.dispatch('core/notices').createNotice('error', __('Please enter SVG code', 'seamless'), {
                isDismissible: true
            });
            return;
        }
        onInsert(code);
    };

    return (
        <Modal className="svgib__modal custom-svg" title={__('Custom SVG', 'seamless')} onRequestClose={() => setCustomiconPanel(false)}>
            <div className="svg-controls">
                <RangeControl label={__('SVG Preview Size', 'seamless')} value={size} onChange={v => setSize(v)} min={20} max={150} />
            </div>
            <div className="svgib-modal__wrapper">
                <div className="svg-code">
                    <TextareaControl
                        label={__('SVG Code', 'seamless')}
                        help={__('Paste your SVG code here.', 'seamless')}
                        value={code}
                        onChange={v => setCode(v)}
                        placeholder={__('<svg>...</svg>', 'seamless')}
                        rows={10}
                    />
                </div>
                <div className="svg-preview" style={{ width: size, height: size }}>
                    {code ? (
                        <div dangerouslySetInnerHTML={{ __html: code }} />
                    ) : (
                        <div className="preview-text">{__('SVG Preview', 'seamless')}</div>
                    )}
                </div>
            </div>
            <div className="insert-svg">
                <Button variant="primary" onClick={handleInsert}>
                    {__('Insert SVG', 'seamless')}
                </Button>
            </div>
        </Modal>
    );
};

export default CustomiconModal;
