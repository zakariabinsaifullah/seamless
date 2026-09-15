/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Flex, FlexBlock, Button } from '@wordpress/components';

/**
 * Header Component
 * Displays tab navigation for the icon library modal
 */
export const Header = ({ activeTab, onTabChange }) => {
    // Define tabs
    const tabs = [
        { label: __('Library', 'seamless'), value: 'library' },
        { label: __('My Icons', 'seamless'), value: 'my-icons' },
        { label: __('Custom SVG', 'seamless'), value: 'custom' }
    ];

    return (
        <Flex gap={2}>
            <FlexBlock>
                <div className="seam-modal__tabs">
                    {tabs.map(tab => (
                        <Button
                            key={tab.value}
                            className={`seam-modal__tabs-button ${activeTab === tab.value ? 'is-selected' : ''}`}
                            onClick={() => onTabChange(tab.value)}
                            disabled={tab.disabled}
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </FlexBlock>
        </Flex>
    );
};
