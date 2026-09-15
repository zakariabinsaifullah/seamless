<?php
/**
 * Core Block Styles
 *
 * Registers custom style variations for core (and third-party) blocks.
 *
 * @package Seamless
 */

if ( ! function_exists( 'seam_block_styles' ) ) :
	/**
	 * Registers all custom block style variations for the theme.
	 */
	function seam_block_styles() {
		register_block_style(
			'core/group',
			array(
				'name'  => 'wrap-mobile',
				'label' => __( 'Wrap Mobile', 'seamless' ),
			)
		);


		register_block_style(
			'core/button',
			array(
				'name'  => 'alternative',
				'label' => __( 'Alternative', 'seamless' ),
			)
		);

		register_block_style(
			'core/button',
			array(
				'name'  => 'link',
				'label' => __( 'Link', 'seamless' ),
			)
		);
	}
endif;
add_action( 'init', 'seam_block_styles' );
