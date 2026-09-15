/**
 * WordPress dependencies
 */
import { __experimentalScrollable as Scrollable, Button, ExternalLink } from '@wordpress/components';
import { file } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { MY_ICONS_STORE } from '../../../store/my-icons';

/**
 * Icon resource websites
 */
const iconResources = [
    {
        name: 'Heroicons',
        url: 'https://heroicons.com/',
        description: __('Beautiful hand-crafted SVG icons by Tailwind CSS', 'seamless')
    },
    {
        name: 'Google Fonts Icons',
        url: 'https://fonts.google.com/icons',
        description: __('Material icons and symbols', 'seamless')
    },
    {
        name: 'Remix Icon',
        url: 'https://remixicon.com/',
        description: __('Open-source icon library', 'seamless')
    },
    {
        name: 'Basicons',
        url: 'https://basicons.xyz/',
        description: __('Basic icons for your projects', 'seamless')
    }
];

const helpTextStyle = {
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#757575',
    marginBottom: '16px',
    marginTop: '0'
};

export const Sidebar = ({ categories = [], category, setCategory, activeTab }) => {
    const myIconsCount = useSelect(select => select(MY_ICONS_STORE).getMyIcons().length, []);

    if ('custom' === activeTab) {
        return (
            <div className="seam-modal__sidebar">
                <h4 className="icons-heading">{__('Resources', 'seamless')}</h4>
                <p style={helpTextStyle}>
                    {__(
                        'Want to try a different icon? Maybe find one from these resources, Copy the SVG code and paste it in the editor.',
                        'seamless'
                    )}
                </p>
                <Scrollable className="seam-modal__scrollable">
                    <div className="seam-modal__sidebar-buttons">
                        {iconResources.map(resource => (
                            <ExternalLink key={resource.url} href={resource.url} className="seam-modal__sidebar-link">
                                {resource.name}
                            </ExternalLink>
                        ))}
                    </div>
                </Scrollable>
            </div>
        );
    }

    if ('my-icons' === activeTab) {
        return (
            <div className="seam-modal__sidebar">
                <h4 className="icons-heading">{__('My Icons', 'seamless')}</h4>
                <p style={helpTextStyle}>
                    {__(
                        'Icons you have saved from the Custom SVG tab. They are stored site-wide, so they are available in every block that uses an icon.',
                        'seamless'
                    )}
                </p>
                <p style={{ ...helpTextStyle, fontWeight: '500', color: '#1e1e1e' }}>
                    {myIconsCount === 1
                        ? __('1 saved icon', 'seamless')
                        : `${myIconsCount} ${__('saved icons', 'seamless')}`}
                </p>
            </div>
        );
    }

    return (
        <div className="seam-modal__sidebar">
            <h4 className="icons-heading">{__('Categories', 'seamless')}</h4>
            <Scrollable className="seam-modal__scrollable">
                <div className="seam-modal__sidebar-buttons">
                    {categories.map(cat => (
                        <Button
                            key={cat.slug}
                            icon={file}
                            iconSize={20}
                            className={`seam-modal__sidebar-button ${category === cat.slug ? 'is-selected' : ''}`}
                            onClick={() => setCategory(cat.slug)}
                        >
                            {cat.name}
                            <span
                                style={{
                                    flex: '1',
                                    textAlign: 'right'
                                }}
                            >
                                {cat.count || '0'}
                            </span>
                        </Button>
                    ))}
                </div>
            </Scrollable>
        </div>
    );
};
