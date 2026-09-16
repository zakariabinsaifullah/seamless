<?php
/**
 * Posts Grid Shortcode
 *
 * Renders a filterable, paginated post grid via AJAX.
 *
 * Usage: [seam_posts_grid per_page="6" post_type="post"]
 */

// =============================================================================
// Asset enqueueing
// =============================================================================

if ( ! function_exists( 'seam_posts_grid_enqueue_styles' ) ) :
	/**
	 * Card and grid styles. Split out from the script so [top_post], which needs
	 * the card styling but none of the filtering behaviour, can ask for the
	 * stylesheet on its own.
	 */
	function seam_posts_grid_enqueue_styles() {
		wp_enqueue_style(
			'seam-posts-grid',
			get_theme_file_uri( 'assets/css/shortcode.css' ),
			array(),
			wp_get_theme()->get( 'Version' )
		);
	}
endif;

if ( ! function_exists( 'seam_posts_grid_enqueue_assets' ) ) :
	function seam_posts_grid_enqueue_assets() {
		seam_posts_grid_enqueue_styles();

		wp_enqueue_script(
			'seam-posts-grid',
			get_theme_file_uri( 'assets/js/shortcode.js' ),
			array(),
			wp_get_theme()->get( 'Version' ),
			true
		);
	}
endif;


// =============================================================================
// Helpers
// =============================================================================

if ( ! function_exists( 'seam_posts_grid_render_post_item' ) ) :
	/**
	 * Renders a single post card: image → meta (category, date + reading time) → title → excerpt → read more.
	 *
	 * Shared by all three shortcodes; the parts that differ between them are
	 * switched off here rather than hidden with CSS, so a card never pays for
	 * markup — or an image request — it doesn't show.
	 *
	 * @param int    $post_id  Post ID.
	 * @param string $taxonomy Taxonomy used for the category label.
	 * @param array  $args     {
	 *     Optional. What this card includes.
	 *
	 *     @type string $heading_tag Heading level for the title. Default 'h3' —
	 *                               the grid has its own h2 above the cards.
	 *     @type bool   $image       Whether to render the featured image. Default true.
	 *     @type bool   $read_time   Whether to render the reading time. Default true.
	 * }
	 */
	function seam_posts_grid_render_post_item( $post_id, $taxonomy = 'category', $args = array() ) {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return '';
		}

		$args = wp_parse_args(
			$args,
			array(
				'heading_tag' => 'h3',
				'image'       => true,
				'read_time'   => true,
			)
		);

		$permalink = get_permalink( $post_id );
		$title     = get_the_title( $post_id );
		$excerpt   = get_the_excerpt( $post_id );
		$date      = get_the_date( 'F Y', $post_id );
		$thumbnail = ( $args['image'] && has_post_thumbnail( $post_id ) )
			? get_the_post_thumbnail( $post_id, 'medium_large', array( 'loading' => 'lazy' ) )
			: '';

		// Category (first term of the resolved taxonomy).
		$terms    = get_the_terms( $post_id, $taxonomy );
		$cat_name = ( $terms && ! is_wp_error( $terms ) ) ? $terms[0]->name : '';

		// Reading time: word count / 200 wpm, rounded up to at least 1 minute.
		$word_count   = $args['read_time'] ? str_word_count( wp_strip_all_tags( $post->post_content ) ) : 0;
		$reading_time = max( 1, (int) ceil( $word_count / 200 ) );

		$html = '<article class="ipg-card">';

		if ( $thumbnail ) {
			$html .= '<a href="' . esc_url( $permalink ) . '" class="ipg-card__image" tabindex="-1" aria-hidden="true">';
			$html .= $thumbnail;
			$html .= '</a>';
		}

		$html .= '<div class="ipg-card__body">';

		// Meta row: category, date, reading time — spaced, no separators.
		$html .= '<div class="ipg-card__meta-row">';
		if ( $cat_name ) {
			$html .= '<span class="ipg-card__category">' . esc_html( $cat_name ) . '</span>';
		}
		$html .= '<span class="ipg-card__date">' . esc_html( $date ) . '</span>';
		if ( $args['read_time'] ) {
			/* translators: %d: reading time in minutes. */
			$html .= '<span class="ipg-card__read-time">' . sprintf( esc_html__( '%d min read', 'seamless' ), $reading_time ) . '</span>';
		}
		$html .= '</div>';

		$heading_tag = in_array( $args['heading_tag'], array( 'h2', 'h3', 'h4' ), true ) ? $args['heading_tag'] : 'h3';
		$html       .= '<' . $heading_tag . ' class="ipg-card__title"><a href="' . esc_url( $permalink ) . '">' . esc_html( $title ) . '</a></' . $heading_tag . '>';

		if ( $excerpt ) {
			$html .= '<p class="ipg-card__excerpt">' . esc_html( $excerpt ) . '</p>';
		}

		$html .= '<a class="ipg-card__read-more" href="' . esc_url( $permalink ) . '">' . esc_html__( 'Read the article', 'seamless' ) . '</a>';

		$html .= '</div>';
		$html .= '</article>';

		return $html;
	}
endif;


if ( ! function_exists( 'seam_posts_grid_render_posts' ) ) :
	/**
	 * Renders the full grid of post cards for a given WP_Query.
	 *
	 * @param WP_Query $query    The query to render.
	 * @param string   $taxonomy Taxonomy used for the category label.
	 */
	function seam_posts_grid_render_posts( $query, $taxonomy = 'category' ) {
		if ( ! $query->have_posts() ) {
			return '<p class="ipg-no-posts">' . esc_html__( 'No posts found.', 'seamless' ) . '</p>';
		}

		$html = '<div class="ipg-grid">';

		while ( $query->have_posts() ) {
			$query->the_post();
			$html .= seam_posts_grid_render_post_item( get_the_ID(), $taxonomy );
		}

		$html .= '</div>';

		wp_reset_postdata();

		return $html;
	}
endif;


if ( ! function_exists( 'seam_posts_grid_resolve_category_ids' ) ) :
	/**
	 * Resolves a comma-separated list of term IDs/slugs into an array of term IDs.
	 */
	function seam_posts_grid_resolve_category_ids( $categories_raw, $taxonomy ) {
		$ids = array();

		foreach ( array_filter( array_map( 'trim', explode( ',', (string) $categories_raw ) ), 'strlen' ) as $token ) {
			$term = is_numeric( $token )
				? get_term_by( 'id', (int) $token, $taxonomy )
				: get_term_by( 'slug', sanitize_title( $token ), $taxonomy );

			if ( $term && ! is_wp_error( $term ) ) {
				$ids[] = (int) $term->term_id;
			}
		}

		return array_unique( $ids );
	}
endif;


if ( ! function_exists( 'seam_posts_grid_pagination_range' ) ) :
	/**
	 * Returns an array of page numbers and '...' placeholders.
	 * Always shows first/last page and current page ± 1 neighbour.
	 */
	function seam_posts_grid_pagination_range( $total_pages, $current_page ) {
		$total_pages  = (int) $total_pages;
		$current_page = (int) $current_page;

		if ( $total_pages <= 7 ) {
			return range( 1, $total_pages );
		}

		$left  = max( 2, $current_page - 1 );
		$right = min( $total_pages - 1, $current_page + 1 );
		$pages = array( 1 );

		if ( $left > 2 ) {
			$pages[] = '...';
		}

		for ( $i = $left; $i <= $right; $i++ ) {
			$pages[] = $i;
		}

		if ( $right < $total_pages - 1 ) {
			$pages[] = '...';
		}

		$pages[] = $total_pages;

		return $pages;
	}
endif;


if ( ! function_exists( 'seam_posts_grid_render_pagination' ) ) :
	/**
	 * Renders numbered page buttons with ellipsis, bookended by Prev/Next steps.
	 *
	 * Prev and Next are text buttons rather than arrows, and each is omitted at
	 * the end of the range it points past (so page 1 opens with "1 2 3 Next").
	 */
	function seam_posts_grid_render_pagination( $total_pages, $current_page ) {
		$total_pages  = (int) $total_pages;
		$current_page = (int) $current_page;

		if ( $total_pages <= 1 ) {
			return '';
		}

		$html = '<div class="ipg-pagination">';

		if ( $current_page > 1 ) {
			$html .= '<button class="ipg-page-btn ipg-page-step" data-page="' . ( $current_page - 1 ) . '" aria-label="' . esc_attr__( 'Previous page', 'seamless' ) . '">'
				. esc_html__( 'Prev', 'seamless' )
				. '</button>';
		}

		foreach ( seam_posts_grid_pagination_range( $total_pages, $current_page ) as $page ) {
			if ( '...' === $page ) {
				$html .= '<span class="ipg-page-ellipsis">&hellip;</span>';
			} else {
				$active = ( (int) $page === $current_page ) ? ' active' : '';
				$html  .= '<button class="ipg-page-btn' . $active . '" data-page="' . (int) $page . '" aria-label="' . sprintf( esc_attr__( 'Page %d', 'seamless' ), (int) $page ) . '">' . (int) $page . '</button>';
			}
		}

		if ( $current_page < $total_pages ) {
			$html .= '<button class="ipg-page-btn ipg-page-step" data-page="' . ( $current_page + 1 ) . '" aria-label="' . esc_attr__( 'Next page', 'seamless' ) . '">'
				. esc_html__( 'Next', 'seamless' )
				. '</button>';
		}

		$html .= '</div>';

		return $html;
	}
endif;


if ( ! function_exists( 'seam_posts_grid_render_count' ) ) :
	/**
	 * Renders the "Showing N of M articles" line that sits opposite the pagination.
	 *
	 * @param WP_Query $query The query the current page was rendered from.
	 */
	function seam_posts_grid_render_count( $query ) {
		$total = (int) $query->found_posts;

		if ( ! $total ) {
			return '';
		}

		return '<p class="ipg-count">'
			/* translators: 1: number of posts on this page, 2: total number of posts. */
			. sprintf( esc_html__( 'Showing %1$d of %2$d articles', 'seamless' ), (int) $query->post_count, $total )
			. '</p>';
	}
endif;


// =============================================================================
// AJAX handler
// =============================================================================

if ( ! function_exists( 'seam_posts_grid_ajax' ) ) :
	function seam_posts_grid_ajax() {
		check_ajax_referer( 'seam_posts_grid_nonce', 'nonce' );

		$cat        = isset( $_POST['cat'] )        ? absint( $_POST['cat'] )                                        : 0;
		$page       = isset( $_POST['page'] )       ? max( 1, absint( $_POST['page'] ) )                             : 1;
		$per_page   = isset( $_POST['per_page'] )   ? min( 50, max( 1, absint( $_POST['per_page'] ) ) )              : 6;
		$post_type  = isset( $_POST['post_type'] )  ? sanitize_text_field( wp_unslash( $_POST['post_type'] ) )       : 'post';
		$taxonomy   = isset( $_POST['taxonomy'] )   ? sanitize_key( $_POST['taxonomy'] )                             : 'category';
		$categories = isset( $_POST['categories'] ) ? sanitize_text_field( wp_unslash( $_POST['categories'] ) )      : '';

		if ( ! post_type_exists( $post_type ) ) {
			$post_type = 'post';
		}

		if ( ! taxonomy_exists( $taxonomy ) ) {
			$taxonomy = 'category';
		}

		$allowed_cat_ids = array_filter( array_map( 'absint', explode( ',', $categories ) ) );

		$args = array(
			'post_type'      => $post_type,
			'posts_per_page' => $per_page,
			'paged'          => $page,
			'post_status'    => 'publish',
		);

		if ( $cat > 0 ) {
			$args['tax_query'] = array(
				array(
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => $cat,
				),
			);
		} elseif ( ! empty( $allowed_cat_ids ) ) {
			$args['tax_query'] = array(
				array(
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => $allowed_cat_ids,
				),
			);
		}

		$query = new WP_Query( $args );

		wp_send_json_success( array(
			'html'         => seam_posts_grid_render_posts( $query, $taxonomy ),
			'pagination'   => seam_posts_grid_render_pagination( (int) $query->max_num_pages, $page ),
			'count'        => seam_posts_grid_render_count( $query ),
			'total_pages'  => (int) $query->max_num_pages,
			'current_page' => $page,
		) );
	}
endif;
add_action( 'wp_ajax_seam_posts_grid', 'seam_posts_grid_ajax' );
add_action( 'wp_ajax_nopriv_seam_posts_grid', 'seam_posts_grid_ajax' );


// =============================================================================
// Shortcode
// =============================================================================

if ( ! function_exists( 'seam_posts_grid_resolve_taxonomy' ) ) :
	/**
	 * Returns the primary hierarchical taxonomy for a post type.
	 */
	function seam_posts_grid_resolve_taxonomy( $post_type ) {
		foreach ( get_object_taxonomies( $post_type, 'objects' ) as $tax ) {
			if ( $tax->public && $tax->hierarchical ) {
				return $tax->name;
			}
		}
		return 'category';
	}
endif;


if ( ! function_exists( 'seam_posts_grid_resolve_allowed_cats' ) ) :
	/**
	 * Resolves allowed category IDs, falling back to all non-empty terms.
	 */
	function seam_posts_grid_resolve_allowed_cats( $categories_raw, $taxonomy ) {
		$ids = seam_posts_grid_resolve_category_ids( $categories_raw, $taxonomy );

		if ( empty( $ids ) ) {
			$all = get_terms( array( 'taxonomy' => $taxonomy, 'hide_empty' => true, 'fields' => 'ids' ) );
			$ids = is_wp_error( $all ) ? array() : array_map( 'intval', $all );
		}

		return $ids;
	}
endif;


if ( ! function_exists( 'seam_posts_grid_render_tabs' ) ) :
	/**
	 * Renders the filter tab buttons for a given set of terms.
	 *
	 * @param array $terms Array of WP_Term objects.
	 */
	function seam_posts_grid_render_tabs( $terms ) {
		if ( empty( $terms ) ) {
			return '';
		}

		$html  = '<div class="ipg-nav">';
		$html .= '<button class="ipg-filter-btn active" data-cat="0">' . esc_html__( 'All', 'seamless' ) . '</button>';
		foreach ( $terms as $term ) {
			$html .= '<button class="ipg-filter-btn" data-cat="' . esc_attr( $term->term_id ) . '">' . esc_html( $term->name ) . '</button>';
		}
		$html .= '</div>';

		return $html;
	}
endif;


if ( ! function_exists( 'seam_posts_grid_shortcode' ) ) :
	/**
	 * [seam_posts_grid per_page="6" post_type="post" categories="4,9" id="" title="All Insights."]
	 *
	 * `per_page`   — posts per page (default 6).
	 * `categories` — comma-separated term IDs or slugs; omit for all categories.
	 * `id`         — when set, tabs are omitted and the grid listens for a remote
	 *                seam:filter event fired by [seam_posts_tabs for="<id>"].
	 * `title`      — heading rendered as an h2 opposite the filter tabs
	 *                (default "All Insights."); pass title="" to omit it.
	 */
	function seam_posts_grid_shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'per_page'   => 6,
				'post_type'  => 'post',
				'categories' => '',
				'id'         => '',
				'title'      => 'All Insights.',
			),
			$atts,
			'seam_posts_grid'
		);

		$per_page  = min( 50, max( 1, (int) $atts['per_page'] ) );
		$post_type = sanitize_key( $atts['post_type'] );
		$grid_id   = sanitize_html_class( $atts['id'] );
		$title     = trim( wp_strip_all_tags( (string) $atts['title'] ) );

		if ( ! post_type_exists( $post_type ) ) {
			$post_type = 'post';
		}

		$taxonomy        = seam_posts_grid_resolve_taxonomy( $post_type );
		$allowed_cat_ids = seam_posts_grid_resolve_allowed_cats( $atts['categories'], $taxonomy );

		if ( empty( $allowed_cat_ids ) ) {
			return '<p class="ipg-no-posts">' . esc_html__( 'No categories found.', 'seamless' ) . '</p>';
		}

		// Initial query (page 1, no category filter).
		$query = new WP_Query( array(
			'post_type'      => $post_type,
			'posts_per_page' => $per_page,
			'paged'          => 1,
			'post_status'    => 'publish',
			'tax_query'      => array(
				array(
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => $allowed_cat_ids,
				),
			),
		) );

		seam_posts_grid_enqueue_assets();

		$config = wp_json_encode( array(
			'ajaxUrl'    => admin_url( 'admin-ajax.php' ),
			'nonce'      => wp_create_nonce( 'seam_posts_grid_nonce' ),
			'perPage'    => $per_page,
			'postType'   => $post_type,
			'taxonomy'   => $taxonomy,
			'categories' => implode( ',', $allowed_cat_ids ),
		) );

		$grid_id_attr = $grid_id ? ' data-grid-id="' . esc_attr( $grid_id ) . '"' : '';
		$html = '<div class="ipg-wrapper" data-config="' . esc_attr( $config ) . '"' . $grid_id_attr . '>';

		// Header: heading on the left, filter tabs on the right. Tabs are embedded
		// only in self-contained mode (no id attribute); with an id they live in a
		// separate [seam_posts_tabs] block elsewhere on the page.
		$tabs = '';
		if ( ! $grid_id ) {
			$terms = get_terms( array(
				'taxonomy'   => $taxonomy,
				'include'    => $allowed_cat_ids,
				'orderby'    => 'include',
				'hide_empty' => true,
			) );
			$tabs = seam_posts_grid_render_tabs( is_wp_error( $terms ) ? array() : $terms );
		}

		if ( $title || $tabs ) {
			$html .= '<div class="ipg-header">';
			if ( $title ) {
				$html .= '<h2 class="ipg-heading">' . esc_html( $title ) . '</h2>';
			}
			$html .= $tabs;
			$html .= '</div>';
		}

		$html .= '<div class="ipg-posts">' . seam_posts_grid_render_posts( $query, $taxonomy ) . '</div>';

		$html .= '<div class="ipg-footer">';
		$html .= '<div class="ipg-count-wrap">' . seam_posts_grid_render_count( $query ) . '</div>';
		$html .= '<div class="ipg-pagination-wrap">' . seam_posts_grid_render_pagination( (int) $query->max_num_pages, 1 ) . '</div>';
		$html .= '</div>';

		$html .= '</div>';

		wp_reset_postdata();

		return $html;
	}
endif;
add_shortcode( 'seam_posts_grid', 'seam_posts_grid_shortcode' );
// Backwards-compatible alias: some content used the callback name as the tag.
add_shortcode( 'seam_posts_grid_shortcode', 'seam_posts_grid_shortcode' );


if ( ! function_exists( 'seam_posts_tabs_shortcode' ) ) :
	/**
	 * [seam_posts_tabs for="blog" post_type="post" categories="4,9"]
	 *
	 * Renders standalone filter tabs that control a remote [seam_posts_grid id="blog"].
	 * `for`        — must match the `id` of the target [seam_posts_grid].
	 * `categories` — must match the `categories` passed to the target grid.
	 * `post_type`  — must match the `post_type` of the target grid.
	 */
	function seam_posts_tabs_shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'for'        => '',
				'post_type'  => 'post',
				'categories' => '',
			),
			$atts,
			'seam_posts_tabs'
		);

		$grid_id   = sanitize_html_class( $atts['for'] );
		$post_type = sanitize_key( $atts['post_type'] );

		if ( ! $grid_id ) {
			return '';
		}

		if ( ! post_type_exists( $post_type ) ) {
			$post_type = 'post';
		}

		$taxonomy        = seam_posts_grid_resolve_taxonomy( $post_type );
		$allowed_cat_ids = seam_posts_grid_resolve_allowed_cats( $atts['categories'], $taxonomy );

		if ( empty( $allowed_cat_ids ) ) {
			return '';
		}

		$terms = get_terms( array(
			'taxonomy'   => $taxonomy,
			'include'    => $allowed_cat_ids,
			'orderby'    => 'include',
			'hide_empty' => true,
		) );

		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return '';
		}

		seam_posts_grid_enqueue_assets();

		$html  = '<div class="ipg-tabs-remote" data-for="' . esc_attr( $grid_id ) . '">';
		$html .= seam_posts_grid_render_tabs( $terms );
		$html .= '</div>';

		return $html;
	}
endif;
add_shortcode( 'seam_posts_tabs', 'seam_posts_tabs_shortcode' );


// =============================================================================
// Top post
// =============================================================================

if ( ! function_exists( 'seam_top_post_shortcode' ) ) :
	/**
	 * [top_post id="123" post_type="post"]
	 *
	 * Renders one post as a single feature card — the same card the grid uses,
	 * scaled up: full-bleed 2:1 image, no panel behind the text, larger heading.
	 *
	 * `id`        — the post to show. Omit it to fall back to the most recent
	 *               published post of `post_type`.
	 * `post_type` — only used for that fallback; an explicit `id` wins regardless
	 *               of its post type.
	 */
	function seam_top_post_shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'id'        => '',
				'post_type' => 'post',
			),
			$atts,
			'top_post'
		);

		$post_id   = absint( $atts['id'] );
		$post_type = sanitize_key( $atts['post_type'] );

		if ( ! post_type_exists( $post_type ) ) {
			$post_type = 'post';
		}

		if ( ! $post_id ) {
			$latest = get_posts(
				array(
					'post_type'      => $post_type,
					'posts_per_page' => 1,
					'post_status'    => 'publish',
					'fields'         => 'ids',
				)
			);

			$post_id = $latest ? (int) $latest[0] : 0;
		}

		if ( ! $post_id || 'publish' !== get_post_status( $post_id ) ) {
			// Silent for visitors; anyone who can edit gets told why it's blank.
			return current_user_can( 'edit_posts' )
				? '<p class="ipg-no-posts">' . esc_html__( 'Top post: no published post found for that ID.', 'seamless' ) . '</p>'
				: '';
		}

		$taxonomy = seam_posts_grid_resolve_taxonomy( get_post_type( $post_id ) );

		seam_posts_grid_enqueue_styles();

		return '<div class="seam-top-post">'
			. seam_posts_grid_render_post_item( $post_id, $taxonomy, array( 'heading_tag' => 'h2' ) )
			. '</div>';
	}
endif;
add_shortcode( 'top_post', 'seam_top_post_shortcode' );


// =============================================================================
// Post list
// =============================================================================

if ( ! function_exists( 'seam_post_list_shortcode' ) ) :
	/**
	 * [post_list ids="12,34,56"]
	 *
	 * A stack of hand-picked posts. Same card as the rest, minus the image and
	 * the reading time: category and date, title, excerpt, link — on a cream
	 * panel. Cards appear in the order the IDs are given.
	 *
	 * `ids` — one or more post IDs, comma separated.
	 */
	function seam_post_list_shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'ids' => '',
			),
			$atts,
			'post_list'
		);

		$ids = array_values(
			array_unique(
				array_filter(
					array_map( 'absint', explode( ',', (string) $atts['ids'] ) )
				)
			)
		);

		if ( empty( $ids ) ) {
			return current_user_can( 'edit_posts' )
				? '<p class="ipg-no-posts">' . esc_html__( 'Post list: add one or more post IDs, e.g. [post_list ids="12,34"].', 'seamless' ) . '</p>'
				: '';
		}

		$query = new WP_Query(
			array(
				'post_type'           => 'any',
				'post__in'            => $ids,
				// Honour the order the IDs were written in, not the publish date.
				'orderby'             => 'post__in',
				'posts_per_page'      => count( $ids ),
				'post_status'         => 'publish',
				'ignore_sticky_posts' => true,
			)
		);

		if ( ! $query->have_posts() ) {
			return current_user_can( 'edit_posts' )
				? '<p class="ipg-no-posts">' . esc_html__( 'Post list: none of those IDs match a published post.', 'seamless' ) . '</p>'
				: '';
		}

		seam_posts_grid_enqueue_styles();

		$html = '<div class="seam-post-list">';

		while ( $query->have_posts() ) {
			$query->the_post();
			$html .= seam_posts_grid_render_post_item(
				get_the_ID(),
				seam_posts_grid_resolve_taxonomy( get_post_type() ),
				array(
					'image'     => false,
					'read_time' => false,
				)
			);
		}

		$html .= '</div>';

		wp_reset_postdata();

		return $html;
	}
endif;
add_shortcode( 'post_list', 'seam_post_list_shortcode' );
