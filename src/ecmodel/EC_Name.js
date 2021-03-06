// For conditions of distribution and use, see copyright notice in LICENSE

/**
 * @author Toni Dahl
 */


(function ( namespace, undefined ) {

    var ECName, util;

    util = namespace.util;

    ECName = namespace.ECName = function ( framework ) {

        namespace.Component.call( this, framework ); //Inherit component properties

        // Default attributes
        this.createAttribute("name", "", 'string');
        this.createAttribute("description", "", 'string');

    };

    namespace.storeComponent( 26, "EC_Name", ECName );

    ECName.prototype = util.extend( Object.create( namespace.Component.prototype ),
        {

            onAttributeUpdated: function ( attr ) {

            },

            onParentAdded: function ( parent ) {
                if ( parent instanceof namespace.Entity && typeof this.name === 'string' ) {
                    parent.name = this.name;
                }
            }

        }
    );


}( window['webtundra'] = window['webtundra'] || {} ));
