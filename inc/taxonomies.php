<?php
/**
 * Custom Taxonomies
 *
 * Registers the taxonomies owned by this theme.
 *
 * @package Seamless
 */

if ( ! function_exists( 'seam_register_event_type_taxonomy' ) ) :
	/**
	 * Registers the Type taxonomy for the Event post type.
	 *
	 * Hierarchical, so it presents the checkbox UI that categories use rather
	 * than the free-form tag input.
	 */
	function seam_register_event_type_taxonomy() {
		$labels = array(
			'name'                       => _x( 'Types', 'taxonomy general name', 'seamless' ),
			'singular_name'              => _x( 'Type', 'taxonomy singular name', 'seamless' ),
			'menu_name'                  => __( 'Types', 'seamless' ),
			'all_items'                  => __( 'All Types', 'seamless' ),
			'edit_item'                  => __( 'Edit Type', 'seamless' ),
			'view_item'                  => __( 'View Type', 'seamless' ),
			'update_item'                => __( 'Update Type', 'seamless' ),
			'add_new_item'               => __( 'Add New Type', 'seamless' ),
			'new_item_name'              => __( 'New Type Name', 'seamless' ),
			'parent_item'                => __( 'Parent Type', 'seamless' ),
			'parent_item_colon'          => __( 'Parent Type:', 'seamless' ),
			'search_items'               => __( 'Search Types', 'seamless' ),
			'popular_items'              => __( 'Popular Types', 'seamless' ),
			'separate_items_with_commas' => __( 'Separate types with commas', 'seamless' ),
			'add_or_remove_items'        => __( 'Add or remove types', 'seamless' ),
			'choose_from_most_used'      => __( 'Choose from the most used types', 'seamless' ),
			'not_found'                  => __( 'No types found.', 'seamless' ),
			'no_terms'                   => __( 'No types', 'seamless' ),
			'back_to_items'              => __( '&larr; Go to Types', 'seamless' ),
			'item_link'                  => _x( 'Type Link', 'navigation link block title', 'seamless' ),
			'item_link_description'      => _x( 'A link to a type.', 'navigation link block description', 'seamless' ),
		);

		$args = array(
			'labels'             => $labels,
			'description'        => __( 'Groups events by type.', 'seamless' ),
			'public'             => true,
			'publicly_queryable' => true,
			'hierarchical'       => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_in_nav_menus'  => true,
			'show_in_rest'       => true,
			'show_admin_column'  => true,
			'show_tagcloud'      => false,
			'query_var'          => true,
			'rewrite'            => array(
				'slug'         => 'event-type',
				'with_front'   => false,
				'hierarchical' => true,
			),
		);

		register_taxonomy( 'event-type', array( 'event' ), $args );
	}
endif;
add_action( 'init', 'seam_register_event_type_taxonomy' );
