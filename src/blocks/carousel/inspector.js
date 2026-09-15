import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
    Button,
    PanelBody,
    __experimentalBorderBoxControl as BorderBoxControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    __experimentalToolsPanel as ToolsPanel, // eslint-disable-line
    __experimentalToolsPanelItem as ToolsPanelItem // eslint-disable-line
} from '@wordpress/components';

import {
    NativeToggleGroupControl,
    NativeRangeControl,
    NativeToggleControl,
    PanelColorControl,
    NativeSelectControl,
    NativeResponsiveControl,
    NativeUnitControl,
    NativeIconPicker,
    NativeBoxControl,
    NativeBorderBoxControl
} from '../../components';
import { resolveResponsive } from './utils';

/**
 * Tablet and Mobile inherit Desktop until they are given a value of their own,
 * so once one is pinned it needs a way back to the inherited value.
 */
const InheritReset = ({ device, value, onReset }) => {
    if (device === 'Desktop' || value === undefined || value === '') {
        return null;
    }

    return (
        <Button variant="link" onClick={onReset}>
            {__('Use desktop value', 'seamless')}
        </Button>
    );
};

const Inspector = props => {
    const { attributes, setAttributes } = props;
    const {
        resMode,
        heightType,
        heights,
        vAligns,
        columns,
        gaps,
        autoplay,
        loop,
        showArrows,
        navType,
        showPagination,
        pnSize,
        paSize,
        pRadius,
        paRadius,
        pgap,
        paginationColor,
        npaginationHeight,
        apaginationHeight,
        delay,
        navColor,
        navbgColor,
        navBorderColor,
        navSize,
        navIconSize,
        navBorderRadius,
        navPadding,
        navBorder,
        navEdgeGap,
        navPosition,
        prevIconName,
        prevIconType,
        prevCustomSvg,
        nextIconName,
        nextIconType,
        nextCustomSvg
    } = attributes;

    // What the device currently in preview actually renders with.
    const currentHeightType = resolveResponsive(heightType, resMode) || 'adaptive';
    const currentHeight = resolveResponsive(heights, resMode) || '';
    const currentVAlign = resolveResponsive(vAligns, resMode) || 'top';

    return (
        <>
            <InspectorControls group="settings">
                <PanelBody title={__('General', 'seamless')} initialOpen={true}>
                    <NativeResponsiveControl label={__('Height Type', 'seamless')} props={props}>
                        <NativeToggleGroupControl
                            value={currentHeightType}
                            onChange={value => setAttributes({ heightType: { ...heightType, [resMode]: value } })}
                            options={[
                                { label: __('Adaptive', 'seamless'), value: 'adaptive' },
                                { label: __('Fixed', 'seamless'), value: 'fixed' }
                            ]}
                        />
                        <InheritReset
                            device={resMode}
                            value={heightType?.[resMode]}
                            onReset={() => setAttributes({ heightType: { ...heightType, [resMode]: undefined } })}
                        />
                    </NativeResponsiveControl>
                    {currentHeightType === 'fixed' && (
                        <>
                            <NativeResponsiveControl label={__('Height', 'seamless')} props={props}>
                                <NativeUnitControl
                                    label={__('Slider Height', 'seamless')}
                                    value={currentHeight}
                                    onChange={value => {
                                        const newHeights = { ...heights, [resMode]: value };
                                        setAttributes({ heights: newHeights });
                                    }}
                                />
                                <InheritReset
                                    device={resMode}
                                    value={heights?.[resMode]}
                                    onReset={() => setAttributes({ heights: { ...heights, [resMode]: undefined } })}
                                />
                            </NativeResponsiveControl>
                            <NativeResponsiveControl label={__('Vertical Align', 'seamless')} props={props}>
                                <NativeToggleGroupControl
                                    value={currentVAlign}
                                    onChange={value => setAttributes({ vAligns: { ...vAligns, [resMode]: value } })}
                                    options={[
                                        { label: __('Top', 'seamless'), value: 'top' },
                                        { label: __('Middle', 'seamless'), value: 'middle' },
                                        { label: __('Bottom', 'seamless'), value: 'bottom' }
                                    ]}
                                />
                                <InheritReset
                                    device={resMode}
                                    value={vAligns?.[resMode]}
                                    onReset={() => setAttributes({ vAligns: { ...vAligns, [resMode]: undefined } })}
                                />
                            </NativeResponsiveControl>
                        </>
                    )}
                </PanelBody>
                <PanelBody title={__('Slider Options', 'seamless')} initialOpen={false}>
                    <NativeResponsiveControl label={__('Columns', 'seamless')} props={props}>
                        <NativeRangeControl
                            value={columns[resMode]}
                            onChange={value => {
                                const newColumns = { ...columns, [resMode]: value };
                                setAttributes({ columns: newColumns });
                            }}
                            min={1}
                            max={6}
                            step={1}
                        />
                    </NativeResponsiveControl>
                    <NativeResponsiveControl label={__('Gaps', 'seamless')} props={props}>
                        <NativeRangeControl
                            value={gaps[resMode]}
                            onChange={value => {
                                const newGaps = { ...gaps, [resMode]: value };
                                setAttributes({ gaps: newGaps });
                            }}
                            min={0}
                            max={100}
                            step={1}
                        />
                    </NativeResponsiveControl>
                    <NativeToggleControl
                        label={__('Loop', 'seamless')}
                        checked={loop}
                        onChange={value => setAttributes({ loop: value })}
                    />
                    <NativeToggleControl
                        label={__('Autoplay', 'seamless')}
                        checked={autoplay}
                        onChange={value => setAttributes({ autoplay: value })}
                    />
                    {autoplay && (
                        <NativeRangeControl
                            label={__('Delay (ms)', 'seamless')}
                            value={delay}
                            onChange={value => setAttributes({ delay: value })}
                            min={1000}
                            max={10000}
                            step={500}
                        />
                    )}
                    <NativeToggleControl
                        label={__('Show Arrows', 'seamless')}
                        checked={showArrows}
                        onChange={value => setAttributes({ showArrows: value })}
                    />
                    <NativeToggleControl
                        label={__('Show Pagination', 'seamless')}
                        checked={showPagination}
                        onChange={value => setAttributes({ showPagination: value })}
                    />
                    {showArrows && (
                        <NativeToggleGroupControl
                            label={__('Navigation Type', 'seamless')}
                            value={navType}
                            onChange={value => setAttributes({ navType: value })}
                            options={[
                                { label: __('Inside', 'seamless'), value: 'inside' },
                                { label: __('Outside', 'seamless'), value: 'outside' }
                            ]}
                        />
                    )}
                    {showArrows && (
                        <NativeSelectControl
                            label={__('Navigation Position', 'seamless')}
                            value={navPosition}
                            onChange={value => setAttributes({ navPosition: value })}
                            options={[
                                { label: __('Middle', 'seamless'), value: 'middle' },
                                { label: __('Bottom Right (Long Arrows)', 'seamless'), value: 'bottom-right-line' }
                            ]}
                        />
                    )}
                    {showArrows && (
                        <>
                            <NativeIconPicker
                                label={__('Previous Icon', 'seamless')}
                                onIconSelect={(iconName, iconType) => {
                                    setAttributes({
                                        prevIconName: iconName,
                                        prevIconType: iconType,
                                        prevCustomSvg: undefined
                                    });
                                }}
                                onCustomSvgInsert={({ customSvgCode, iconType }) => {
                                    setAttributes({
                                        prevCustomSvg: customSvgCode,
                                        prevIconType: iconType
                                    });
                                }}
                                iconName={prevIconName}
                                customSvgCode={prevCustomSvg}
                            />
                            <NativeIconPicker
                                label={__('Next Icon', 'seamless')}
                                onIconSelect={(iconName, iconType) => {
                                    setAttributes({
                                        nextIconName: iconName,
                                        nextIconType: iconType,
                                        nextCustomSvg: undefined
                                    });
                                }}
                                onCustomSvgInsert={({ customSvgCode, iconType }) => {
                                    setAttributes({
                                        nextCustomSvg: customSvgCode,
                                        nextIconType: iconType
                                    });
                                }}
                                iconName={nextIconName}
                                customSvgCode={nextCustomSvg}
                            />
                        </>
                    )}
                </PanelBody>
            </InspectorControls>
            <InspectorControls group="styles">
                {showPagination && (
                    <ToolsPanel
                        label={__('Pagination', 'seamless')}
                        resetAll={() =>
                            setAttributes({
                                pnSize: undefined,
                                paSize: undefined,
                                pRadius: undefined,
                                paRadius: undefined,
                                paginationColor: undefined,
                                pgap: undefined,
                                npaginationHeight: undefined,
                                apaginationHeight: undefined
                            })
                        }
                    >
                        <ToolsPanelItem
                            hasValue={() => !!pgap}
                            label={__('Gap', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    pgap: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <NativeUnitControl
                                label={__('Vertical Gap', 'seamless')}
                                value={pgap}
                                onChange={value => setAttributes({ pgap: value })}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!pnSize || !!paSize}
                            label={__('Sizes', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    pnSize: undefined,
                                    paSize: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <NativeUnitControl
                                label={__('Normal Size', 'seamless')}
                                value={pnSize}
                                onChange={value => setAttributes({ pnSize: value })}
                            />
                            <NativeUnitControl
                                label={__('Active Size', 'seamless')}
                                value={paSize}
                                onChange={value => setAttributes({ paSize: value })}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!npaginationHeight}
                            label={__('Height', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    npaginationHeight: undefined,
                                    apaginationHeight: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <NativeUnitControl
                                label={__('Normal Height', 'seamless')}
                                value={npaginationHeight}
                                onChange={value => setAttributes({ npaginationHeight: value })}
                            />
                            <NativeUnitControl
                                label={__('Active Height', 'seamless')}
                                value={apaginationHeight}
                                onChange={value => setAttributes({ apaginationHeight: value })}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!pRadius || !!paRadius}
                            label={__('Radius', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    pRadius: undefined,
                                    paRadius: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <NativeUnitControl
                                label={__('Normal Radius', 'seamless')}
                                value={pRadius}
                                onChange={value => setAttributes({ pRadius: value })}
                            />
                            <NativeUnitControl
                                label={__('Active Radius', 'seamless')}
                                value={paRadius}
                                onChange={value => setAttributes({ paRadius: value })}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!paginationColor}
                            label={__('Color', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    paginationColor: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <PanelColorControl
                                label={__('Color', 'seamless')}
                                colorSettings={[
                                    {
                                        value: paginationColor,
                                        onChange: color => setAttributes({ paginationColor: color })
                                    }
                                ]}
                            />
                        </ToolsPanelItem>
                    </ToolsPanel>
                )}
                {showArrows && (
                    <ToolsPanel
                        label={__('Navigation', 'seamless')}
                        resetAll={() =>
                            setAttributes({
                                navbgColor: undefined,
                                navColor: undefined,
                                navEdgeGap: undefined,
                                navSize: undefined,
                                navIconSize: undefined,
                                navBorderColor: undefined,
                                navBorderRadius: undefined,
                                navPadding: undefined,
                                navBorder: undefined
                            })
                        }
                    >
                        <ToolsPanelItem
                            hasValue={() => !!navEdgeGap}
                            label={__('Edge Gap', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    navEdgeGap: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <NativeUnitControl
                                label={__('Edge Gap', 'seamless')}
                                value={navEdgeGap}
                                onChange={value => setAttributes({ navEdgeGap: value })}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!navSize}
                            label={__('Gap', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    navSize: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <NativeUnitControl
                                label={__('Size', 'seamless')}
                                value={navSize}
                                onChange={value => setAttributes({ navSize: value })}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!navIconSize}
                            label={__('Icon Size', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    navIconSize: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <NativeUnitControl
                                label={__('Icon Size', 'seamless')}
                                value={navIconSize}
                                onChange={value => setAttributes({ navIconSize: value })}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!navColor || !!navbgColor || !!navBorderColor}
                            label={__('Colors', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    navColor: undefined,
                                    navbgColor: undefined,
                                    navBorderColor: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <PanelColorControl
                                label={__('Colors', 'seamless')}
                                colorSettings={[
                                    {
                                        label: __('Color', 'seamless'),
                                        value: navColor,
                                        onChange: color => setAttributes({ navColor: color })
                                    },
                                    {
                                        label: __('Background', 'seamless'),
                                        value: navbgColor,
                                        onChange: color => setAttributes({ navbgColor: color })
                                    }
                                ]}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!navBorder}
                            label={__('Border', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    navBorder: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <NativeBorderBoxControl
                                label={__('Border', 'seamless')}
                                value={navBorder}
                                onChange={value => setAttributes({ navBorder: value })}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!navBorderRadius}
                            label={__('Radius', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    navBorderRadius: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <NativeBoxControl
                                label={__('Radius', 'seamless')}
                                value={navBorderRadius}
                                onChange={value => setAttributes({ navBorderRadius: value })}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!navPadding}
                            label={__('Padding', 'seamless')}
                            onDeselect={() => {
                                setAttributes({
                                    navPadding: undefined
                                });
                            }}
                            onSelect={() => {}}
                        >
                            <NativeBoxControl
                                label={__('Padding', 'seamless')}
                                value={navPadding}
                                onChange={value => setAttributes({ navPadding: value })}
                            />
                        </ToolsPanelItem>
                    </ToolsPanel>
                )}
            </InspectorControls>
        </>
    );
};

export default Inspector;
