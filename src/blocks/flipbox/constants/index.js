/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export const FLIP_EFFECTS = [
    { label: __('Flip Left', 'seamless'), value: 'flip-box_animation_style-3' },
    { label: __('Flip Right', 'seamless'), value: 'flip-box_animation_style-1' },
    { label: __('Flip Top', 'seamless'), value: 'flip-box_animation_style-2' },
    { label: __('Flip Bottom', 'seamless'), value: 'flip-box_animation_style-4' },
    { label: __('Slide Left', 'seamless'), value: 'flip-box_animation_style-7' },
    { label: __('Slide Right', 'seamless'), value: 'flip-box_animation_style-5' },
    { label: __('Slide Top', 'seamless'), value: 'flip-box_animation_style-8' },
    { label: __('Slide Bottom', 'seamless'), value: 'flip-box_animation_style-6' },
    { label: __('Push Top', 'seamless'), value: 'flip-box_animation_style-9' },
    { label: __('Push Bottom', 'seamless'), value: 'flip-box_animation_style-10' },
    { label: __('Push Left', 'seamless'), value: 'flip-box_animation_style-11' },
    { label: __('Push Right', 'seamless'), value: 'flip-box_animation_style-12' },
    { label: __('Top to Bottom Angle', 'seamless'), value: 'flip-box_animation_style-13' },
    { label: __('Bottom to Top Angle', 'seamless'), value: 'flip-box_animation_style-14' },
    { label: __('Zoom', 'seamless'), value: 'flip-box_animation_style-15' }
];

export const SELECT_SIDE = [
    { label: __('Front', 'seamless'), value: 'front' },
    { label: __('Back', 'seamless'), value: 'flip-box_active' }
];
