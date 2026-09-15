<?php
/**
 * Block Bindings
 *
 * Registers custom block binding sources that allow blocks to pull
 * dynamic data from theme-specific callbacks.
 *
 * @package Seamless
 */

if ( ! function_exists( 'seam_register_block_bindings' ) ) :
	/**
	 * Registers the "Post Format Name" block binding source.
	 *
	 * Allows blocks to display the human-readable post format label
	 * (e.g. "Video", "Gallery") via the block bindings API.
	 */
	function seam_register_block_bindings() {
		register_block_bindings_source(
			'seam/format',
			array(
				'label'              => _x(
					'Post format name',
					'Label for the block binding placeholder in the editor',
					'seamless'
				),
				'get_value_callback' => 'seam_format_binding',
			)
		);
	}
endif;
add_action( 'init', 'seam_register_block_bindings' );


if ( ! function_exists( 'seam_format_binding' ) ) :
	/**
	 * Returns the human-readable post format name for the current post.
	 *
	 * Returns nothing (null) when the post uses the standard format so that
	 * bound blocks render empty rather than showing a label.
	 *
	 * @return string|void Post format name, or nothing for the standard format.
	 */
	function seam_format_binding() {
		$post_format_slug = get_post_format();

		if ( $post_format_slug && 'standard' !== $post_format_slug ) {
			return get_post_format_string( $post_format_slug );
		}
	}
endif;
