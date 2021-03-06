// For conditions of distribution and use, see copyright notice in LICENSE

/**
 * @author Toni Dahl
 */


(function ( namespace, undefined ) {

    var ECCamera, util, innerWidth, innerHeight;

    util = namespace.util;
    innerWidth = util.innerWidth;
    innerHeight = util.innerHeight;

    ECCamera = namespace.ECCamera = function ( framework ) {

        namespace.Component.call( this, framework ); //Inherit component properties

        // Default attributes
        this.createAttribute( "upvector", [0, 1, 0], 'float3', "upVector" );
        this.createAttribute( "nearplane", 0.1, 'real', "nearPlane" );
        this.createAttribute( "farplane", 1000.0, 'real', "farPlane" );
        this.createAttribute( "verticalfov", 45.0, 'real', "fov" );
        this.createAttribute( "aspectratio", "", 'string', "aspectRatio" );

        // Other properties
        this.renderer = framework.renderer;
        this.camera = null;
        this.placeable = null;
        this.attached = false;

    };

    namespace.storeComponent( 15, "EC_Camera", ECCamera );


    ECCamera.prototype = util.extend( Object.create( namespace.Component.prototype ),
        {

            onParentAdded: function ( parent ) {
                this.initialize();

            },
            onAttributeUpdated: function ( attr ) {
            },

            initialize: function () {
                var self = this;

                if ( !this.parent instanceof namespace.Entity ) {
                    return;
                }

                if ( !this.camera ) {
                    this.camera = new THREE.PerspectiveCamera();

                    this.setFarClipDist( this.farPlane || 1000 );
                    this.setNearClipDist( this.nearPlane || 0.1 );
                    this.setFov( this.fov || 45 );
                    this.setAspectRatio( this.getAspectRatio() );

                    this.parent.componentAdded.add( function ( c ) {
                        if ( c instanceof namespace.ECPlaceable ) {
                            self.placeable = c;
                            self.attachCamera();

                        }
                    } );
                }

            },


            // Attach camera to placeable component
            attachCamera: function () {
                var sceneNode, placeable = this.placeable, camera = this.camera;

                if ( this.attached || placeable === null ) {
                    return;
                }
                sceneNode = placeable.getSceneNode();
                if ( sceneNode ) {
                    sceneNode.add( camera );
                    this.attached = true;
                }
            },

            // Detach camera from placeable component
            detachCamera: function () {
                var sceneNode, placeable = this.placeable, camera = this.camera;

                if ( !this.attached || placeable === null ) {
                    return;
                }

                sceneNode = placeable.getSceneNode();

                if ( sceneNode && camera ) {
                    sceneNode.remove( camera );
                    this.attached = false;
                }


            },

            setActive: function () {
                var renderer = this.renderer, camera = this.camera;

                if ( !camera || !this.parent || !this.attached ) {
                    return;
                }

                renderer.setMainCamera( this.camera );


            },

            isActive: function () {
            },

            getAspectRatio: function () {
                var aspect = this.aspectRatio, str, arFloat, width, height;

                // Trying to get the aspect ratio from attribute
                if ( aspect && typeof aspect === "string" ) {
                    if ( aspect.indexOf( ":" ) === -1 ) {
                        arFloat = parseFloat( aspect );

                        return arFloat > 0 ? aspect : 1;
                    } else {
                        str = aspect.split( ":" );

                        if ( str.length === 2 ) {
                            width = parseFloat( str[0] );
                            height = parseFloat( str[0] );

                            return (width > 0 && height > 0) ? (width / height) : 1;

                        }
                    }
                }

                // Getting the aspect ratio from renderer if it cannot be defined otherwise
                if ( this.renderer && this.renderer.container ) {
                    return innerWidth( this.renderer.container ) / innerHeight( this.renderer.container );
                }

                return 1.0;
            },


            getCameraObject: function () {
                if ( this.camera ) {
                    return this.camera;
                }
                return false;
            },

            setFov: function ( fov ) {
                var camera = this.camera;

                if ( typeof fov === "number" && camera ) {
                    camera.fov = fov;
                    camera.updateProjectionMatrix();
                }

            },

            setFarClipDist: function ( far ) {
                var camera = this.camera;

                if ( typeof far === "number" && camera ) {
                    camera.far = far;
                    camera.updateProjectionMatrix();

                }
            },
            setNearClipDist: function ( near ) {
                var camera = this.camera;

                if ( typeof near === "number" && camera ) {
                    camera.near = near;
                    camera.updateProjectionMatrix();

                }
            },

            setAspectRatio: function ( aspect ) {
                var camera = this.camera;

                if ( typeof aspect === "number" && camera ) {
                    camera.aspect = aspect;
                    camera.updateProjectionMatrix();

                }
            },

            startViewTracking: function () {
            },

            isEntityVisible: function () {
            },

            visibleEntities: function () {
            }
        }
    );


}( window['webtundra'] = window['webtundra'] || {} ));
