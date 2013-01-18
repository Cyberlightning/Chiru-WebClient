(function ( namespace, $, undefined ) {

    /**
     * Defines Entity object
     *
     * @constructor
     * @name Entity
     * @type Function
     * @param {Number} id Unique entity id.
     */

    var Entity = namespace.Entity = function ( id ) {

        /**
         * A Signal that is dispatched when a new component is added to this entity.
         *
         * @memberOf Entity#
         * @name componentAdded
         * @type Signal
         */
        this.componentAdded = new Signal();

        /**
         * A Signal that is dispatched when a component is removed from this entity.
         *
         * @memberOf Entity#
         * @name componentRemoved
         * @type {Signal}
         */
        this.componentRemoved = new Signal();

        /**
         * Storage for entity actions.
         *
         * @memberOf Entity#
         * @name entityActions
         * @type {Object}
         */

        this.entityActions = {};

        /**
         * Storage for entity components.
         *
         * @memberOf Entity#
         * @name components
         * @type {Object}
         */

        this.components = {};

        /**
         * Unique entity id of this entity.
         *
         * @memberOf Entity#
         * @name id
         * @type {Number}
         */
        this.id = id;

    };

    /**
     * Gets a component of an entity by component type id.
     *
     * @name getComponent
     * @type Function
     * @memberOf Entity.prototype
     * @param {Number} typeId Unique component type id.
     * @return {*}
     */

    Entity.prototype.getComponent = function ( type ) {
        if ( Object.keys( this.components ).length !== 0 ) {

            for ( var id in this.components ) {
                if ( this.components[id] instanceof type ) {
                    return this.components[id];
                }
            }
        }

        return false;
    };

    /**
     *  Gets a component of an entity by unique component id.
     *
     * @name getComponentById
     * @type Function
     * @memberOf Entity.prototype
     * @param {Number} id Unique component id.
     * @return {Component|Boolean}
     */

    Entity.prototype.getComponentById = function( id ) {
        if (this.components.hasOwnProperty(id)) {
            return this.components[id];
        }
        return false;
    };

    /**
     * Adds a component to an entity
     *
     * @name addComponent
     * @type Function
     * @memberOf Entity.prototype
     * @param {Component} component Component of a specific type. e.g. ECMesh
     */

    Entity.prototype.addComponent = function ( component ) {

        //component.setParentEnt(this);

        if ( component.typeId !== undefined ) {
            if ( !this.components.hasOwnProperty(component.id) ) {
                this.components[component.id] = component;
                this.componentAdded.dispatch( component );
            }
        }

    };

    /**
     * Removes a component from an entity.
     *
     * @name removeComponent
     * @type Function
     * @memberOf Entity.prototype
     * @param {Component} component Component of a specific type.
     * @return {Boolean}
     */

    Entity.prototype.removeComponent = function ( component ) {
        this.componentRemoved.dispatch ( component );

        return false;
    };




}( window['webtundra'] = window['webtundra'] || {}, jQuery ));
