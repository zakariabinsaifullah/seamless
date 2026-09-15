/**
 * Click-to-flip behaviour for flip boxes set to the "click" trigger.
 * Hover-triggered boxes work through CSS alone and need no JS.
 */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.wp-block-seam-flipbox .flip-box_item:not(.flip-box_hover)').forEach(item => {
        if (!item.hasAttribute('tabindex')) {
            item.setAttribute('tabindex', '0');
        }
        item.setAttribute('role', 'button');
        item.setAttribute('aria-pressed', 'false');

        const toggle = () => {
            const isFlipped = item.classList.toggle('flip-box_active');
            item.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
        };

        item.addEventListener('click', toggle);
        item.addEventListener('keydown', event => {
            if ('Enter' === event.key || ' ' === event.key) {
                event.preventDefault();
                toggle();
            }
        });
    });
});
