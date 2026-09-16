<?php
/**
 * Seamless — theme documentation page (Appearance → Seamless).
 *
 * Reference for the shortcodes the theme ships, written for whoever is building
 * pages rather than for a developer. Keep it in step with inc/shortcode.php.
 *
 * @package Seamless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ── Add menu page under Appearance ────────────────────────────────────────────

add_action( 'admin_menu', 'seam_docs_add_menu' );

function seam_docs_add_menu() {
	add_theme_page(
		__( 'Seamless', 'seamless' ),
		__( 'Seamless', 'seamless' ),
		'manage_options',
		'seamless-docs',
		'seam_docs_render_page'
	);
}

// ── Enqueue admin assets on the docs page ─────────────────────────────────────

add_action( 'admin_enqueue_scripts', 'seam_docs_admin_assets' );

function seam_docs_admin_assets( $hook ) {
	if ( 'appearance_page_seamless-docs' !== $hook ) {
		return;
	}

	$version = wp_get_theme()->get( 'Version' );

	wp_enqueue_style(
		'seam-docs',
		get_theme_file_uri( 'assets/css/admin-docs.css' ),
		array(),
		$version
	);

	// Same generic `.seam-copy-button` handler the Form Settings page uses.
	wp_enqueue_script(
		'seam-form-settings',
		get_theme_file_uri( 'assets/js/form-settings.js' ),
		array(),
		$version,
		true
	);
}

// ── Render helpers ────────────────────────────────────────────────────────────

if ( ! function_exists( 'seam_docs_code' ) ) :
	/**
	 * Outputs a copyable code sample.
	 *
	 * @param string $code  The snippet.
	 * @param string $label Optional caption shown above the snippet.
	 */
	function seam_docs_code( $code, $label = '' ) {
		?>
		<div class="seam-docs-code">
			<?php if ( $label ) : ?>
				<p class="seam-docs-code__label"><?php echo esc_html( $label ); ?></p>
			<?php endif; ?>
			<div class="seam-docs-code__row">
				<code><?php echo esc_html( $code ); ?></code>
				<button
					type="button"
					class="button seam-copy-button"
					data-copy="<?php echo esc_attr( $code ); ?>"
					data-label="<?php esc_attr_e( 'Copy', 'seamless' ); ?>"
					data-copied="<?php esc_attr_e( '✓ Copied!', 'seamless' ); ?>"
				><?php esc_html_e( 'Copy', 'seamless' ); ?></button>
			</div>
		</div>
		<?php
	}
endif;

if ( ! function_exists( 'seam_docs_attr_table' ) ) :
	/**
	 * Outputs an attribute reference table.
	 *
	 * @param array $rows Each row: array( name, default, description ).
	 */
	function seam_docs_attr_table( $rows ) {
		?>
		<table class="widefat striped seam-docs-table">
			<thead>
				<tr>
					<th scope="col"><?php esc_html_e( 'Attribute', 'seamless' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Default', 'seamless' ); ?></th>
					<th scope="col"><?php esc_html_e( 'What it does', 'seamless' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $rows as $row ) : ?>
					<tr>
						<td><code><?php echo esc_html( $row[0] ); ?></code></td>
						<td>
							<?php if ( '' === $row[1] ) : ?>
								<span class="seam-docs-empty"><?php esc_html_e( 'empty', 'seamless' ); ?></span>
							<?php else : ?>
								<code><?php echo esc_html( $row[1] ); ?></code>
							<?php endif; ?>
						</td>
						<td><?php echo wp_kses_post( $row[2] ); ?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
		<?php
	}
endif;

// ── Render docs page ──────────────────────────────────────────────────────────

function seam_docs_render_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap seam-docs">
		<h1><?php esc_html_e( 'Seamless', 'seamless' ); ?></h1>
		<p class="seam-docs-intro">
			<?php esc_html_e( 'Reference for the shortcodes this theme adds. Drop any of them into a page with a Shortcode block.', 'seamless' ); ?>
		</p>

		<!-- ── Posts grid ─────────────────────────────────────────────────── -->
		<div class="seam-docs-section">
			<h2><?php esc_html_e( 'Insights grid', 'seamless' ); ?> <code>[seam_posts_grid]</code></h2>

			<p>
				<?php esc_html_e( 'A filterable, paginated grid of posts. Clicking a category tab or a page number swaps the cards in place, without reloading the page.', 'seamless' ); ?>
			</p>

			<?php seam_docs_code( '[seam_posts_grid]', __( 'Simplest version — six posts, all categories, heading “All Insights.”', 'seamless' ) ); ?>

			<h3><?php esc_html_e( 'Attributes', 'seamless' ); ?></h3>

			<?php
			seam_docs_attr_table(
				array(
					array(
						'title',
						'All Insights.',
						__( 'Heading shown at the top left, opposite the filter tabs, as an <code>h2</code> heading. Pass <code>title=""</code> to leave it out — the tabs then sit on their own.', 'seamless' ),
					),
					array(
						'per_page',
						'6',
						__( 'How many posts each page of the grid shows. Anything above 50 is capped at 50.', 'seamless' ),
					),
					array(
						'post_type',
						'post',
						__( 'Which post type to list. Falls back to <code>post</code> if the name is not a registered post type.', 'seamless' ),
					),
					array(
						'categories',
						'',
						__( 'Comma-separated category IDs or slugs. Limits both the posts shown and the tabs offered. Leave empty to use every category that has posts.', 'seamless' ),
					),
					array(
						'id',
						'',
						__( 'Pairs this grid with a separate tab bar — see “Splitting the tabs off” below. When set, the grid renders without its own tabs.', 'seamless' ),
					),
				)
			);

			?>

			<h3><?php esc_html_e( 'Examples', 'seamless' ); ?></h3>

			<?php
			seam_docs_code(
				'[seam_posts_grid per_page="9" title="Latest Thinking."]',
				__( 'Nine posts per page, with a different heading.', 'seamless' )
			);

			seam_docs_code(
				'[seam_posts_grid categories="tax-planning,valuation"]',
				__( 'Only two categories — both in the grid and in the tabs.', 'seamless' )
			);

			seam_docs_code(
				'[seam_posts_grid title=""]',
				__( 'No heading, tabs only.', 'seamless' )
			);
			?>

			<h3><?php esc_html_e( 'What a card shows', 'seamless' ); ?></h3>
			<ul class="seam-docs-list">
				<li><?php esc_html_e( 'Featured image. A post without one simply starts at the text panel.', 'seamless' ); ?></li>
				<li><?php esc_html_e( 'Category, month and year, and an estimated reading time (based on 200 words a minute).', 'seamless' ); ?></li>
				<li><?php esc_html_e( 'Title, excerpt trimmed to four lines, and a “Read the article” link.', 'seamless' ); ?></li>
			</ul>
			<p class="description">
				<?php esc_html_e( 'The grid is three columns on desktop, two on tablet and one on mobile. Under the cards sits a count — “Showing 6 of 24 articles” — with the page numbers opposite it.', 'seamless' ); ?>
			</p>
		</div>

		<!-- ── Top post ───────────────────────────────────────────────────── -->
		<div class="seam-docs-section">
			<h2><?php esc_html_e( 'Featured post', 'seamless' ); ?> <code>[top_post]</code></h2>

			<p>
				<?php esc_html_e( 'One post on its own, as a larger version of the card the grid uses: a wide image above the category, title, excerpt and link. No tabs, no pagination — you pick the post.', 'seamless' ); ?>
			</p>

			<?php
			seam_docs_code( '[top_post id="123"]', __( 'Swap 123 for the ID of the post you want to feature.', 'seamless' ) );
			seam_docs_code( '[top_post]', __( 'Without an ID it shows whichever post was published most recently.', 'seamless' ) );
			?>

			<h3><?php esc_html_e( 'Attributes', 'seamless' ); ?></h3>

			<?php
			seam_docs_attr_table(
				array(
					array(
						'id',
						'',
						__( 'The post to show. Find the ID in the address bar while editing a post — <code>post.php?post=<strong>123</strong>&amp;action=edit</code>. Leave it out to fall back to the most recent published post.', 'seamless' ),
					),
					array(
						'post_type',
						'post',
						__( 'Only used for that fallback. An <code>id</code> you pass in wins whatever its post type.', 'seamless' ),
					),
				)
			);
			?>

			<div class="seam-docs-note">
				<p>
					<?php esc_html_e( 'The post has to be published — a draft or a deleted post shows nothing. Logged-in editors see a short note in its place so a blank space is never a mystery.', 'seamless' ); ?>
				</p>
			</div>

			<p class="description">
				<?php esc_html_e( 'The card fills whatever it is placed in, so put it in a column if you want it narrower than the page.', 'seamless' ); ?>
			</p>
		</div>

		<!-- ── Post list ──────────────────────────────────────────────────── -->
		<div class="seam-docs-section">
			<h2><?php esc_html_e( 'Hand-picked list', 'seamless' ); ?> <code>[post_list]</code></h2>

			<p>
				<?php esc_html_e( 'A stack of posts you choose yourself. Same card again, this time with no image and no reading time — category and date, title, excerpt and link, each on its own panel.', 'seamless' ); ?>
			</p>

			<?php
			seam_docs_code( '[post_list ids="12,34,56"]', __( 'Three posts, in that order.', 'seamless' ) );
			seam_docs_code( '[post_list ids="12"]', __( 'One is fine too.', 'seamless' ) );
			?>

			<h3><?php esc_html_e( 'Attributes', 'seamless' ); ?></h3>

			<?php
			seam_docs_attr_table(
				array(
					array(
						'ids',
						'',
						__( '<strong>Required.</strong> One or more post IDs, separated by commas. The cards appear in the order you write them — not by date — so this doubles as the running order.', 'seamless' ),
					),
				)
			);
			?>

			<div class="seam-docs-note">
				<p>
					<?php esc_html_e( 'IDs that point at a draft or a deleted post are skipped, and the rest still show. If none of them match, logged-in editors see a note explaining why.', 'seamless' ); ?>
				</p>
			</div>
		</div>

		<!-- ── Standalone tabs ────────────────────────────────────────────── -->
		<div class="seam-docs-section">
			<h2><?php esc_html_e( 'Standalone filter tabs', 'seamless' ); ?> <code>[seam_posts_tabs]</code></h2>

			<p>
				<?php esc_html_e( 'Only needed when the category tabs have to live somewhere else on the page — inside a hero, say, rather than directly above the cards. Skip this shortcode if the tabs are fine where the grid puts them.', 'seamless' ); ?>
			</p>

			<h3><?php esc_html_e( 'Splitting the tabs off', 'seamless' ); ?></h3>
			<p>
				<?php esc_html_e( 'Give both shortcodes the same name: the tab bar points at it with “for”, the grid answers to it with “id”.', 'seamless' ); ?>
			</p>

			<?php
			seam_docs_code( '[seam_posts_tabs for="insights"]', __( 'Place this where the tabs should appear.', 'seamless' ) );
			seam_docs_code( '[seam_posts_grid id="insights" title=""]', __( 'And this where the cards should appear.', 'seamless' ) );
			?>

			<h3><?php esc_html_e( 'Attributes', 'seamless' ); ?></h3>

			<?php
			seam_docs_attr_table(
				array(
					array(
						'for',
						'',
						__( '<strong>Required.</strong> Must match the <code>id</code> on the grid it controls. Nothing renders without it.', 'seamless' ),
					),
					array(
						'post_type',
						'post',
						__( 'Must match the grid’s <code>post_type</code>.', 'seamless' ),
					),
					array(
						'categories',
						'',
						__( 'Must match the grid’s <code>categories</code>, or the tabs will offer categories the grid cannot show.', 'seamless' ),
					),
				)
			);
			?>

			<div class="seam-docs-note">
				<p>
					<?php esc_html_e( 'One tab bar controls one grid. Two grids on the same page need two different names.', 'seamless' ); ?>
				</p>
			</div>
		</div>

		<!-- ── Contact panel cross-reference ──────────────────────────────── -->
		<div class="seam-docs-section">
			<h2><?php esc_html_e( 'Contact panel', 'seamless' ); ?></h2>
			<p>
				<?php
				printf(
					/* translators: %s: link to the Form Settings page. */
					esc_html__( 'The slide-in contact form is set up separately, under %s. Any link pointing at #seam-contact opens it.', 'seamless' ),
					'<a href="' . esc_url( admin_url( 'themes.php?page=seam-form' ) ) . '">' . esc_html__( 'Appearance → Form', 'seamless' ) . '</a>'
				);
				?>
			</p>
		</div>
	</div>
	<?php
}
