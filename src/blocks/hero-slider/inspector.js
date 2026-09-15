import { __, sprintf } from '@wordpress/i18n';
import { InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import {
    Button,
    PanelBody,
    GradientPicker,
    __experimentalToolsPanel as ToolsPanel, // eslint-disable-line
    __experimentalToolsPanelItem as ToolsPanelItem // eslint-disable-line
} from '@wordpress/components';
import { chevronUp, chevronDown, closeSmall } from '@wordpress/icons';
import { useState } from '@wordpress/element';

import {
    NativeToggleGroupControl,
    NativeRangeControl,
    NativeToggleControl,
    PanelColorControl,
    NativeResponsiveControl,
    NativeUnitControl,
    NativeIconPicker,
    NativeBoxControl,
    NativeBorderBoxControl
} from '../../components';
import { resolveResponsive, toSlide, mergeSelection, slideThumb } from './utils';

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

/**
 * One of a slide's three image slots. Only the desktop slot is ever filled on
 * its own — the other two show what they are inheriting until they are set.
 */
const MediaSlot = ({ label, url, inheritedFrom, onSelect, onClear }) => (
    <div className="seam-hero-slot">
        <div className="seam-hero-slot__preview">
            {url ? <img src={url} alt="" /> : <span className="seam-hero-slot__empty" />}
        </div>
        <div className="seam-hero-slot__body">
            <span className="seam-hero-slot__label">{label}</span>
            {!url && inheritedFrom && <span className="seam-hero-slot__hint">{inheritedFrom}</span>}
        </div>
        <MediaUploadCheck>
            <MediaUpload
                onSelect={onSelect}
                allowedTypes={['image']}
                render={({ open }) => (
                    <Button variant="tertiary" size="small" onClick={open}>
                        {url ? __('Replace', 'seamless') : __('Set', 'seamless')}
                    </Button>
                )}
            />
        </MediaUploadCheck>
        {url && onClear && <Button size="small" icon={closeSmall} label={__('Clear', 'seamless')} onClick={onClear} />}
    </div>
);

/**
 * The media modal returns images in library order, not the order they were
 * clicked, so the running order is managed here instead. Each row opens up to
 * reveal the slide's mobile and thumbnail overrides.
 */
const SlideList = ({ slides, setAttributes }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const update = (index, changes) => {
        setAttributes({
            slides: slides.map((slide, i) => (i === index ? { ...slide, ...changes } : slide))
        });
    };

    const move = (from, to) => {
        if (to < 0 || to > slides.length - 1) {
            return;
        }

        const next = [...slides];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        setAttributes({ slides: next });
        setOpenIndex(null);
    };

    const remove = index => {
        setAttributes({ slides: slides.filter((slide, i) => i !== index) });
        setOpenIndex(null);
    };

    return (
        <ul className="seam-hero-slide-list">
            {slides.map((slide, index) => {
                const isOpen = openIndex === index;

                return (
                    <li className="seam-hero-slide-list__item" key={slide.id || index}>
                        <div className="seam-hero-slide-list__row">
                            <img src={slideThumb(slide)} alt="" />
                            <span className="seam-hero-slide-list__label">
                                {sprintf(
                                    /* translators: %d: image number within the hero slider. */
                                    __('Image %d', 'seamless'),
                                    index + 1
                                )}
                            </span>
                            <Button
                                size="small"
                                icon={chevronUp}
                                label={__('Move up', 'seamless')}
                                disabled={index === 0}
                                onClick={() => move(index, index - 1)}
                            />
                            <Button
                                size="small"
                                icon={chevronDown}
                                label={__('Move down', 'seamless')}
                                disabled={index === slides.length - 1}
                                onClick={() => move(index, index + 1)}
                            />
                            <Button
                                size="small"
                                icon={isOpen ? chevronUp : chevronDown}
                                label={isOpen ? __('Hide images', 'seamless') : __('Edit images', 'seamless')}
                                isPressed={isOpen}
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                            />
                            <Button size="small" icon={closeSmall} label={__('Remove', 'seamless')} onClick={() => remove(index)} />
                        </div>

                        {isOpen && (
                            <div className="seam-hero-slide-list__slots">
                                <MediaSlot
                                    label={__('Desktop', 'seamless')}
                                    url={slide.url}
                                    onSelect={image => {
                                        const next = toSlide(image);

                                        /**
                                         * `toSlide` rebuilds `thumb` from the new image, which is
                                         * right when the strip is following the desktop slot but
                                         * would silently throw away a thumbnail the author chose
                                         * by hand — so a custom one is carried across.
                                         */
                                        update(index, slide.thumbId ? { ...next, thumb: slide.thumb } : next);
                                    }}
                                />
                                <MediaSlot
                                    label={__('Mobile', 'seamless')}
                                    url={slide.mobileUrl}
                                    inheritedFrom={__('Uses the desktop image', 'seamless')}
                                    onSelect={image => update(index, { mobileId: image.id, mobileUrl: image.url })}
                                    onClear={() => update(index, { mobileId: undefined, mobileUrl: undefined })}
                                />
                                <MediaSlot
                                    label={__('Thumbnail', 'seamless')}
                                    url={slide.thumbId ? slide.thumb : undefined}
                                    inheritedFrom={__('Cropped from the desktop image', 'seamless')}
                                    onSelect={image => update(index, { thumbId: image.id, thumb: image.url })}
                                    onClear={() => update(index, { thumbId: undefined, thumb: slide.autoThumb || slide.url })}
                                />
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

const Inspector = props => {
    const { attributes, setAttributes, onChangeMode } = props;
    const {
        slides = [],
        contentMode,
        resMode,
        heightType,
        heights,
        vAligns,
        effect,
        speed,
        autoplay,
        delay,
        loop,
        overlayColor,
        overlayGradient,
        overlayOpacity,
        contentWidths,
        contentAlign,
        contentPosition,
        contentPadding,
        constrainThumbs,
        showThumbs,
        thumbWidths,
        thumbHeights,
        thumbGaps,
        thumbsAlign,
        thumbsOffset,
        thumbRadius,
        thumbOpacity,
        thumbBorderColor,
        thumbBorderWidth,
        showArrows,
        navColor,
        navbgColor,
        navSize,
        navIconSize,
        navGap,
        navBorder,
        navBorderRadius,
        navPadding,
        prevIconName,
        prevCustomSvg,
        nextIconName,
        nextCustomSvg
    } = attributes;

    const perSlide = 'per-slide' === contentMode;

    /* The parent owns switching, so the placeholder and this toggle behave alike. */
    const switchMode = onChangeMode || (value => setAttributes({ contentMode: value }));

    // What the device currently in preview actually renders with.
    const currentHeightType = resolveResponsive(heightType, resMode) || 'adaptive';
    const currentHeight = resolveResponsive(heights, resMode) || '';
    const currentVAlign = resolveResponsive(vAligns, resMode) || 'middle';
    const currentContentWidth = resolveResponsive(contentWidths, resMode) || '';
    const currentThumbWidth = resolveResponsive(thumbWidths, resMode) || '';
    const currentThumbHeight = resolveResponsive(thumbHeights, resMode) || '';
    const currentThumbGap = resolveResponsive(thumbGaps, resMode) ?? 20;

    const setResponsive = (key, values, value) => setAttributes({ [key]: { ...values, [resMode]: value } });
    const resetResponsive = (key, values) => setAttributes({ [key]: { ...values, [resMode]: undefined } });

    return (
        <>
            <InspectorControls group="settings">
                <PanelBody title={__('Content', 'seamless')} initialOpen={true}>
                    <NativeToggleGroupControl
                        label={__('Content Mode', 'seamless')}
                        value={contentMode || 'fixed'}
                        onChange={switchMode}
                        options={[
                            { label: __('Fixed', 'seamless'), value: 'fixed' },
                            { label: __('Per slide', 'seamless'), value: 'per-slide' }
                        ]}
                    />
                    <p className="seam-hero-mode-hint">
                        {perSlide
                            ? __('Each slide carries its own images and its own content.', 'seamless')
                            : __('One set of content stays in place while the background images slide behind it.', 'seamless')}
                    </p>
                </PanelBody>

                {!perSlide && (
                <PanelBody title={__('Images', 'seamless')} initialOpen={true}>
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={images => setAttributes({ slides: mergeSelection(images, slides) })}
                            allowedTypes={['image']}
                            multiple
                            gallery
                            value={slides.map(slide => slide.id)}
                            render={({ open }) => (
                                <Button variant="secondary" onClick={open} style={{ marginBottom: '12px' }}>
                                    {slides.length ? __('Add or remove images', 'seamless') : __('Select images', 'seamless')}
                                </Button>
                            )}
                        />
                    </MediaUploadCheck>
                    {!!slides.length && <SlideList slides={slides} setAttributes={setAttributes} />}
                </PanelBody>
                )}

                <PanelBody title={__('Layout', 'seamless')} initialOpen={false}>
                    <NativeResponsiveControl label={__('Height Type', 'seamless')} props={props}>
                        <NativeToggleGroupControl
                            value={currentHeightType}
                            onChange={value => setResponsive('heightType', heightType, value)}
                            options={[
                                { label: __('Adaptive', 'seamless'), value: 'adaptive' },
                                { label: __('Fixed', 'seamless'), value: 'fixed' }
                            ]}
                        />
                        <InheritReset
                            device={resMode}
                            value={heightType?.[resMode]}
                            onReset={() => resetResponsive('heightType', heightType)}
                        />
                    </NativeResponsiveControl>
                    {currentHeightType === 'fixed' && (
                        <NativeResponsiveControl label={__('Height', 'seamless')} props={props}>
                            <NativeUnitControl
                                label={__('Hero Height', 'seamless')}
                                value={currentHeight}
                                onChange={value => setResponsive('heights', heights, value)}
                                units={[
                                    { label: 'px', value: 'px' },
                                    { label: 'vh', value: 'vh' },
                                    { label: 'rem', value: 'rem' }
                                ]}
                            />
                            <InheritReset device={resMode} value={heights?.[resMode]} onReset={() => resetResponsive('heights', heights)} />
                        </NativeResponsiveControl>
                    )}
                    <NativeResponsiveControl label={__('Vertical Align', 'seamless')} props={props}>
                        <NativeToggleGroupControl
                            value={currentVAlign}
                            onChange={value => setResponsive('vAligns', vAligns, value)}
                            options={[
                                { label: __('Top', 'seamless'), value: 'top' },
                                { label: __('Middle', 'seamless'), value: 'middle' },
                                { label: __('Bottom', 'seamless'), value: 'bottom' }
                            ]}
                        />
                        <InheritReset device={resMode} value={vAligns?.[resMode]} onReset={() => resetResponsive('vAligns', vAligns)} />
                    </NativeResponsiveControl>
                    <NativeToggleGroupControl
                        label={__('Content Alignment', 'seamless')}
                        value={contentAlign}
                        onChange={value => setAttributes({ contentAlign: value })}
                        options={[
                            { label: __('Left', 'seamless'), value: 'left' },
                            { label: __('Center', 'seamless'), value: 'center' },
                            { label: __('Right', 'seamless'), value: 'right' }
                        ]}
                    />
                    <NativeResponsiveControl label={__('Content Width', 'seamless')} props={props}>
                        <NativeUnitControl
                            label={__('Max Width', 'seamless')}
                            value={currentContentWidth}
                            placeholder={__('Full', 'seamless')}
                            onChange={value => setResponsive('contentWidths', contentWidths, value)}
                            units={[
                                { label: 'px', value: 'px' },
                                { label: '%', value: '%' },
                                { label: 'rem', value: 'rem' }
                            ]}
                        />
                        <InheritReset
                            device={resMode}
                            value={contentWidths?.[resMode]}
                            onReset={() => resetResponsive('contentWidths', contentWidths)}
                        />
                    </NativeResponsiveControl>
                    {!!currentContentWidth && (
                        <>
                            <NativeToggleGroupControl
                                label={__('Content Position', 'seamless')}
                                value={contentPosition}
                                onChange={value => setAttributes({ contentPosition: value })}
                                options={[
                                    { label: __('Left', 'seamless'), value: 'left' },
                                    { label: __('Center', 'seamless'), value: 'center' },
                                    { label: __('Right', 'seamless'), value: 'right' }
                                ]}
                            />
                            <NativeToggleControl
                                label={__('Align thumbnails to content', 'seamless')}
                                help={__('Keeps the strip inside the same width so both share a left edge.', 'seamless')}
                                checked={constrainThumbs}
                                onChange={value => setAttributes({ constrainThumbs: value })}
                            />
                        </>
                    )}
                    <NativeBoxControl
                        label={__('Content Padding', 'seamless')}
                        value={contentPadding}
                        onChange={value => setAttributes({ contentPadding: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Slider Options', 'seamless')} initialOpen={false}>
                    <NativeToggleGroupControl
                        label={__('Transition', 'seamless')}
                        value={effect}
                        onChange={value => setAttributes({ effect: value })}
                        options={[
                            { label: __('Fade', 'seamless'), value: 'fade' },
                            { label: __('Slide', 'seamless'), value: 'slide' }
                        ]}
                    />
                    <NativeRangeControl
                        label={__('Speed (ms)', 'seamless')}
                        value={speed}
                        onChange={value => setAttributes({ speed: value })}
                        min={200}
                        max={3000}
                        step={100}
                    />
                    <NativeToggleControl label={__('Loop', 'seamless')} checked={loop} onChange={value => setAttributes({ loop: value })} />
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
                            max={12000}
                            step={500}
                        />
                    )}
                </PanelBody>

                <PanelBody title={__('Thumbnails', 'seamless')} initialOpen={false}>
                    <NativeToggleControl
                        label={__('Show Thumbnails', 'seamless')}
                        checked={showThumbs}
                        onChange={value => setAttributes({ showThumbs: value })}
                    />
                    {showThumbs && (
                        <>
                            <NativeResponsiveControl label={__('Thumbnail Size', 'seamless')} props={props}>
                                <NativeUnitControl
                                    label={__('Width', 'seamless')}
                                    value={currentThumbWidth}
                                    onChange={value => setResponsive('thumbWidths', thumbWidths, value)}
                                />
                                <NativeUnitControl
                                    label={__('Height', 'seamless')}
                                    value={currentThumbHeight}
                                    onChange={value => setResponsive('thumbHeights', thumbHeights, value)}
                                />
                                <InheritReset
                                    device={resMode}
                                    value={thumbWidths?.[resMode] || thumbHeights?.[resMode]}
                                    onReset={() =>
                                        setAttributes({
                                            thumbWidths: { ...thumbWidths, [resMode]: undefined },
                                            thumbHeights: { ...thumbHeights, [resMode]: undefined }
                                        })
                                    }
                                />
                            </NativeResponsiveControl>
                            <NativeResponsiveControl label={__('Gap', 'seamless')} props={props}>
                                <NativeRangeControl
                                    value={currentThumbGap}
                                    onChange={value => setResponsive('thumbGaps', thumbGaps, value)}
                                    min={0}
                                    max={60}
                                    step={1}
                                />
                                <InheritReset
                                    device={resMode}
                                    value={thumbGaps?.[resMode]}
                                    onReset={() => resetResponsive('thumbGaps', thumbGaps)}
                                />
                            </NativeResponsiveControl>
                            <NativeToggleGroupControl
                                label={__('Alignment', 'seamless')}
                                value={thumbsAlign}
                                onChange={value => setAttributes({ thumbsAlign: value })}
                                options={[
                                    { label: __('Left', 'seamless'), value: 'left' },
                                    { label: __('Center', 'seamless'), value: 'center' },
                                    { label: __('Right', 'seamless'), value: 'right' }
                                ]}
                            />
                            <NativeUnitControl
                                label={__('Bottom Spacing', 'seamless')}
                                value={thumbsOffset}
                                placeholder="0px"
                                onChange={value => setAttributes({ thumbsOffset: value })}
                            />
                        </>
                    )}
                </PanelBody>

                <PanelBody title={__('Navigation', 'seamless')} initialOpen={false}>
                    <NativeToggleControl
                        label={__('Show Arrows', 'seamless')}
                        checked={showArrows}
                        onChange={value => setAttributes({ showArrows: value })}
                    />
                    {showArrows && (
                        <>
                            <NativeIconPicker
                                label={__('Previous Icon', 'seamless')}
                                onIconSelect={(iconName, iconType) => {
                                    setAttributes({ prevIconName: iconName, prevIconType: iconType, prevCustomSvg: undefined });
                                }}
                                onCustomSvgInsert={({ customSvgCode, iconType }) => {
                                    setAttributes({ prevCustomSvg: customSvgCode, prevIconType: iconType });
                                }}
                                iconName={prevIconName}
                                customSvgCode={prevCustomSvg}
                            />
                            <NativeIconPicker
                                label={__('Next Icon', 'seamless')}
                                onIconSelect={(iconName, iconType) => {
                                    setAttributes({ nextIconName: iconName, nextIconType: iconType, nextCustomSvg: undefined });
                                }}
                                onCustomSvgInsert={({ customSvgCode, iconType }) => {
                                    setAttributes({ nextCustomSvg: customSvgCode, nextIconType: iconType });
                                }}
                                iconName={nextIconName}
                                customSvgCode={nextCustomSvg}
                            />
                        </>
                    )}
                </PanelBody>
            </InspectorControls>

            <InspectorControls group="styles">
                <ToolsPanel
                    label={__('Overlay', 'seamless')}
                    resetAll={() =>
                        setAttributes({
                            overlayColor: undefined,
                            overlayGradient: undefined,
                            overlayOpacity: 40
                        })
                    }
                >
                    <ToolsPanelItem
                        hasValue={() => !!overlayColor}
                        label={__('Color', 'seamless')}
                        onDeselect={() => setAttributes({ overlayColor: undefined })}
                        onSelect={() => {}}
                    >
                        <PanelColorControl
                            label={__('Overlay Color', 'seamless')}
                            colorSettings={[
                                {
                                    label: __('Color', 'seamless'),
                                    value: overlayColor,
                                    onChange: color => setAttributes({ overlayColor: color })
                                }
                            ]}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        hasValue={() => !!overlayGradient}
                        label={__('Gradient', 'seamless')}
                        onDeselect={() => setAttributes({ overlayGradient: undefined })}
                        onSelect={() => {}}
                    >
                        <GradientPicker
                            value={overlayGradient}
                            onChange={value => setAttributes({ overlayGradient: value })}
                            clearable
                            __nextHasNoMargin
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        hasValue={() => overlayOpacity !== 40}
                        label={__('Opacity', 'seamless')}
                        onDeselect={() => setAttributes({ overlayOpacity: 40 })}
                        onSelect={() => {}}
                    >
                        <NativeRangeControl
                            label={__('Opacity (%)', 'seamless')}
                            value={overlayOpacity}
                            onChange={value => setAttributes({ overlayOpacity: value })}
                            min={0}
                            max={100}
                            step={1}
                        />
                    </ToolsPanelItem>
                </ToolsPanel>

                {showThumbs && (
                    <ToolsPanel
                        label={__('Thumbnails', 'seamless')}
                        resetAll={() =>
                            setAttributes({
                                thumbRadius: undefined,
                                thumbOpacity: 70,
                                thumbBorderColor: undefined,
                                thumbBorderWidth: undefined
                            })
                        }
                    >
                        <ToolsPanelItem
                            hasValue={() => !!thumbRadius}
                            label={__('Radius', 'seamless')}
                            onDeselect={() => setAttributes({ thumbRadius: undefined })}
                            onSelect={() => {}}
                        >
                            <NativeUnitControl
                                label={__('Radius', 'seamless')}
                                value={thumbRadius}
                                onChange={value => setAttributes({ thumbRadius: value })}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => thumbOpacity !== 70}
                            label={__('Inactive Opacity', 'seamless')}
                            onDeselect={() => setAttributes({ thumbOpacity: 70 })}
                            onSelect={() => {}}
                        >
                            <NativeRangeControl
                                label={__('Inactive Opacity (%)', 'seamless')}
                                value={thumbOpacity}
                                onChange={value => setAttributes({ thumbOpacity: value })}
                                min={10}
                                max={100}
                                step={1}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!thumbBorderColor || !!thumbBorderWidth}
                            label={__('Active Border', 'seamless')}
                            onDeselect={() => setAttributes({ thumbBorderColor: undefined, thumbBorderWidth: undefined })}
                            onSelect={() => {}}
                        >
                            <NativeUnitControl
                                label={__('Width', 'seamless')}
                                value={thumbBorderWidth}
                                placeholder="0px"
                                onChange={value => setAttributes({ thumbBorderWidth: value })}
                            />
                            <PanelColorControl
                                label={__('Active Border Color', 'seamless')}
                                colorSettings={[
                                    {
                                        label: __('Color', 'seamless'),
                                        value: thumbBorderColor,
                                        onChange: color => setAttributes({ thumbBorderColor: color })
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
                                navColor: undefined,
                                navbgColor: undefined,
                                navSize: undefined,
                                navIconSize: undefined,
                                navGap: undefined,
                                navBorder: undefined,
                                navBorderRadius: undefined,
                                navPadding: undefined
                            })
                        }
                    >
                        <ToolsPanelItem
                            hasValue={() => !!navSize || !!navIconSize}
                            label={__('Sizes', 'seamless')}
                            onDeselect={() => setAttributes({ navSize: undefined, navIconSize: undefined })}
                            onSelect={() => {}}
                        >
                            <NativeUnitControl
                                label={__('Button Size', 'seamless')}
                                value={navSize}
                                onChange={value => setAttributes({ navSize: value })}
                            />
                            <NativeUnitControl
                                label={__('Icon Size', 'seamless')}
                                value={navIconSize}
                                onChange={value => setAttributes({ navIconSize: value })}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!navGap}
                            label={__('Gap', 'seamless')}
                            onDeselect={() => setAttributes({ navGap: undefined })}
                            onSelect={() => {}}
                        >
                            <NativeUnitControl
                                label={__('Gap from Strip', 'seamless')}
                                value={navGap}
                                onChange={value => setAttributes({ navGap: value })}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!navColor || !!navbgColor}
                            label={__('Colors', 'seamless')}
                            onDeselect={() => setAttributes({ navColor: undefined, navbgColor: undefined })}
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
                            onDeselect={() => setAttributes({ navBorder: undefined })}
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
                            onDeselect={() => setAttributes({ navBorderRadius: undefined })}
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
                            onDeselect={() => setAttributes({ navPadding: undefined })}
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
