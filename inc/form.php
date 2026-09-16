<?php
/**
 * Contact Settings — admin page under Appearance menu.
 *
 * Options:
 *   seam_phone_number        – Phone Number
 *   seam_form_shortcode      – Form Shortcode
 *   seam_form_title          – Panel heading
 *   seam_form_description    – Panel description paragraph
 *
 * @package Seamless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ── Enqueue front-end assets ───────────────────────────────────────────────────

add_action( 'wp_enqueue_scripts', 'seam_form_panel_assets' );

function seam_form_panel_assets() {
	$version = wp_get_theme()->get( 'Version' );

	wp_enqueue_style(
		'seam-form-panel',
		get_theme_file_uri( 'assets/css/form-panel.css' ),
		array(),
		$version
	);

	wp_enqueue_script(
		'seam-form-panel',
		get_theme_file_uri( 'assets/js/form-panel.js' ),
		array(),
		$version,
		true
	);
}

// ── Inject panel HTML into every page footer ───────────────────────────────────

add_action( 'wp_footer', 'seam_form_panel_html' );

function seam_form_panel_html() {
	$phone       = get_option( 'seam_phone_number', '' );
	$shortcode   = get_option( 'seam_form_shortcode', '' );
	$title       = get_option( 'seam_form_title', 'Contact us' );
	$description = get_option( 'seam_form_description', '' );

	// Don't render the panel if neither option is set.
	if ( ! $phone && ! $shortcode ) {
		return;
	}
	?>
	<div id="seam-form-overlay" class="seam-form-overlay" aria-hidden="true"></div>

	<div
		id="seam-contact"
		class="seam-form-panel"
		role="dialog"
		aria-modal="true"
		aria-label="<?php echo esc_attr( $title ? $title : __( 'Contact us', 'seamless' ) ); ?>"
		aria-hidden="true"
	>
		<div class="seam-form-panel__header">
			<?php if ( $phone ) : ?>
			<a href="tel:<?php echo esc_attr( preg_replace( '/[^\d+]/', '', $phone ) ); ?>" class="seam-form-panel__phone">
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path d="M3.62 7.79C5.06 10.62 7.38 12.93 10.21 14.38L12.41 12.18C12.68 11.91 13.08 11.82 13.43 11.94C14.55 12.31 15.76 12.51 17 12.51C17.55 12.51 18 12.96 18 13.51V17C18 17.55 17.55 18 17 18C7.61 18 0 10.39 0 1C0 0.45 0.45 0 1 0H4.5C5.05 0 5.5 0.45 5.5 1C5.5 2.25 5.7 3.45 6.07 4.57C6.18 4.92 6.1 5.31 5.82 5.59L3.62 7.79Z" fill="currentColor"/>
				</svg>
				<?php echo esc_html( $phone ); ?>
			</a>
			<?php else : ?>
			<span></span>
			<?php endif; ?>

			<button class="seam-form-panel__close" aria-label="<?php esc_attr_e( 'Close form', 'seamless' ); ?>">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</button>
		</div>

		<div class="seam-form-panel__body">
			<?php if ( $title ) : ?>
				<h2 class="seam-form-panel__title"><?php echo esc_html( $title ); ?></h2>
			<?php endif; ?>

			<?php if ( $description ) : ?>
				<p class="seam-form-panel__desc"><?php echo esc_html( $description ); ?></p>
			<?php endif; ?>

			<?php if ( $shortcode ) : ?>
				<?php echo do_shortcode( $shortcode ); ?>
			<?php endif; ?>
		</div>
	</div>
	<?php
}

// ── Gravity Forms submit button ────────────────────────────────────────────────

add_filter( 'gform_submit_button', 'seam_gform_submit_button', 10, 2 );

/**
 * Renders the Gravity Forms submit button as the theme's default block button.
 *
 * Gravity Forms ships the submit as `<input type="submit">`, which can hold
 * neither child elements nor a `::after` — so it can't carry the arrow icon the
 * default button ends with. The input is rebuilt here as a `<button>` with the
 * same attributes (id, classes and GF's `onclick` submission handler are all
 * preserved, so GF's own JS still finds and drives it), wrapped in the same
 * `.wp-block-button.seam-icon-button` markup a core button block produces.
 *
 * Carrying those classes means the button inherits the block button's layout,
 * icon chip and tablet/mobile treatment from the iconic-button stylesheet
 * (src/extensions/iconic-button/style.scss) for free; colours, typography and
 * metrics are restated in assets/css/form-panel.css, which has to out-specify
 * Gravity Forms' own button CSS.
 *
 * Image buttons (`<input type="image">`) are left exactly as Gravity Forms
 * rendered them.
 *
 * @param string $button The button HTML.
 * @param array  $form   The current form.
 * @return string Button HTML.
 */
function seam_gform_submit_button( $button, $form ) {
	$processor = new WP_HTML_Tag_Processor( $button );

	if ( ! $processor->next_tag( array( 'tag_name' => 'INPUT' ) ) || 'submit' !== $processor->get_attribute( 'type' ) ) {
		return $button;
	}

	$label = $processor->get_attribute( 'value' );

	// The block element classes carry the theme's button styling; Gravity Forms'
	// own `gform_button button` classes come along with the copied attributes.
	$classes = trim( ( $processor->get_attribute( 'class' ) ?? '' ) . ' wp-block-button__link wp-element-button' );
	$attrs   = sprintf( ' class="%s"', esc_attr( $classes ) );

	foreach ( $processor->get_attribute_names_with_prefix( '' ) as $name ) {
		// `type` is restated below, `value` becomes the button's text content,
		// and `class` is handled above.
		if ( in_array( $name, array( 'type', 'value', 'class' ), true ) ) {
			continue;
		}

		$value = $processor->get_attribute( $name );

		if ( true === $value ) {
			$attrs .= ' ' . esc_attr( $name );
		} elseif ( is_string( $value ) ) {
			$attrs .= sprintf( ' %s="%s"', esc_attr( $name ), esc_attr( $value ) );
		}
	}

	$icon = '<span class="seam-icon-button-svg">' . wp_kses( seam_iconic_button_default_svg(), seam_iconic_button_svg_kses_args() ) . '</span>';

	return sprintf(
		'<div class="wp-block-button seam-icon-button seam-gform-button"><button type="submit"%1$s>%2$s%3$s</button></div>',
		$attrs,
		esc_html( $label ),
		$icon
	);
}

// ── Register settings ──────────────────────────────────────────────────────────

add_action( 'admin_init', 'seam_form_register_settings' );

function seam_form_register_settings() {
	register_setting(
		'seam_form_group',
		'seam_phone_number',
		array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field', 'default' => '' )
	);

	register_setting(
		'seam_form_group',
		'seam_form_shortcode',
		array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field', 'default' => '' )
	);

	register_setting(
		'seam_form_group',
		'seam_form_title',
		array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field', 'default' => 'Contact us' )
	);

	register_setting(
		'seam_form_group',
		'seam_form_description',
		array( 'type' => 'string', 'sanitize_callback' => 'sanitize_textarea_field', 'default' => '' )
	);
}

// ── Add menu page under Appearance ────────────────────────────────────────────

add_action( 'admin_menu', 'seam_form_add_menu' );

function seam_form_add_menu() {
	add_theme_page(
		__( 'Form Settings', 'seamless' ),
		__( 'Form', 'seamless' ),
		'manage_options',
		'seam-form',
		'seam_form_render_page'
	);
}

// ── Enqueue admin assets on the Form Settings page ────────────────────────────

add_action( 'admin_enqueue_scripts', 'seam_form_admin_assets' );

function seam_form_admin_assets( $hook ) {
	if ( 'appearance_page_seam-form' !== $hook ) {
		return;
	}

	wp_enqueue_script(
		'seam-form-settings',
		get_theme_file_uri( 'assets/js/form-settings.js' ),
		array(),
		wp_get_theme()->get( 'Version' ),
		true
	);
}

// ── Render settings page ───────────────────────────────────────────────────────

function seam_form_render_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Form Settings', 'seamless' ); ?></h1>

		<?php settings_errors( 'seam_form_group' ); ?>

		<?php /* ── Trigger ID hint ── */ ?>
		<div style="
			background: #f0f6fc;
			border-left: 4px solid #2271b1;
			border-radius: 0 4px 4px 0;
			padding: 14px 18px;
			margin: 16px 0 24px;
			max-width: 600px;
		">
			<p style="margin: 0 0 8px; font-weight: 600; color: #1d2327;">
				<?php esc_html_e( 'How to open this form panel', 'seamless' ); ?>
			</p>
			<p style="margin: 0 0 10px; color: #3c434a; font-size: 13px;">
				<?php esc_html_e( 'Add the following ID as the href value on any link or button to open the slide-in form:', 'seamless' ); ?>
			</p>
			<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
				<code id="seam-trigger-id" style="
					background: #1d2327;
					color: #7dd3fc;
					padding: 6px 14px;
					border-radius: 4px;
					font-size: 14px;
					font-family: monospace;
					letter-spacing: 0.5px;
					user-select: all;
				">#seam-contact</code>
				<button
					type="button"
					class="seam-copy-button"
					data-copy="#seam-contact"
					data-label="<?php esc_attr_e( 'Copy', 'seamless' ); ?>"
					data-copied="<?php esc_attr_e( '✓ Copied!', 'seamless' ); ?>"
					style="
						background: #2271b1;
						color: #fff;
						border: none;
						border-radius: 4px;
						padding: 5px 14px;
						font-size: 13px;
						cursor: pointer;
					"
				><?php esc_html_e( 'Copy', 'seamless' ); ?></button>
			</div>
			<p style="margin: 10px 0 0; color: #646970; font-size: 12px;">
				<?php esc_html_e( 'Example:', 'seamless' ); ?>
				<code style="background:#eee; padding: 2px 6px; border-radius: 3px;">&lt;a href="#seam-contact"&gt;Get in Touch&lt;/a&gt;</code>
			</p>
		</div>

		<form method="post" action="options.php">
			<?php settings_fields( 'seam_form_group' ); ?>

			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">
						<label for="seam_phone_number">
							<?php esc_html_e( 'Phone Number', 'seamless' ); ?>
						</label>
					</th>
					<td>
						<input
							type="text"
							id="seam_phone_number"
							name="seam_phone_number"
							value="<?php echo esc_attr( get_option( 'seam_phone_number' ) ); ?>"
							class="regular-text"
							placeholder="e.g. 818-408-7117"
						/>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="seam_form_title">
							<?php esc_html_e( 'Form Title', 'seamless' ); ?>
						</label>
					</th>
					<td>
						<input
							type="text"
							id="seam_form_title"
							name="seam_form_title"
							value="<?php echo esc_attr( get_option( 'seam_form_title', 'Contact us' ) ); ?>"
							class="regular-text"
							placeholder="<?php esc_attr_e( 'Contact us', 'seamless' ); ?>"
						/>
						<p class="description">
							<?php esc_html_e( 'Heading displayed at the top of the slide-in panel.', 'seamless' ); ?>
						</p>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="seam_form_description">
							<?php esc_html_e( 'Form Description', 'seamless' ); ?>
						</label>
					</th>
					<td>
						<textarea
							id="seam_form_description"
							name="seam_form_description"
							class="regular-text"
							rows="4"
							placeholder="<?php esc_attr_e( 'We are here to help you...', 'seamless' ); ?>"
						><?php echo esc_textarea( get_option( 'seam_form_description', '' ) ); ?></textarea>
						<p class="description">
							<?php esc_html_e( 'Short paragraph shown below the title inside the panel.', 'seamless' ); ?>
						</p>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="seam_form_shortcode">
							<?php esc_html_e( 'Form Shortcode', 'seamless' ); ?>
						</label>
					</th>
					<td>
						<input
							type="text"
							id="seam_form_shortcode"
							name="seam_form_shortcode"
							value="<?php echo esc_attr( get_option( 'seam_form_shortcode' ) ); ?>"
							class="regular-text"
						/>
						<p class="description">
							<?php esc_html_e( 'Enter the shortcode, e.g. [gravityform id="1" title="false"]', 'seamless' ); ?>
						</p>
					</td>
				</tr>
			</table>

			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}
