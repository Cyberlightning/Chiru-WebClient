// For conditions of distribution and use, see copyright notice in LICENSE

/**
 * @author Toni Dahl
 */


(function ( namespace, undefined ) {

    // Util shortcuts
    var extend = namespace.util.extend,
        innerWidth = namespace.util.innerWidth,
        innerHeight = namespace.util.innerHeight;


    /**
     * Creates a scene manager object
     *
     * @constructor
     * @name SceneManager
     * @type Function
     * @param {object} container Container DOM element for WebGL renderer.
     */

    var SceneManager = namespace.SceneManager = function ( options ) {

        var defaults = {
                eulerOrder: 'ZYX',
                container: document.body,
                websocket: null,
                remoteStorage: 'http://127.0.0.1:8000/',
                meshType: 'ogre'
            },
            opts;

        // Setting options
        opts = extend( {}, defaults, options );

        // Three.js settings
        THREE.Object3D.defaultEulerOrder = this.eulerOrder = opts.eulerOrder;


        this.time = Date.now();
        this.clock = new THREE.Clock();
        this.container = opts.container;
        this.controls = null;
        this.renderer = null;
        this.scene = null;
        this.skyBoxScene = null;
        this.mainCamera = null;
        this.skyBoxCamera = null;
        this.remoteStorage = opts.remoteStorage;

        this.websocket = opts.websocket;

        this.assetManager = new namespace.AssetManager( this.remoteStorage, opts.meshType );

        this.ecManager = new namespace.ECManager( this );

        this.cameraManager = new namespace.CameraManager( this );

        this.controlManager = new namespace.Controls( this );


        this.init();
    };

    SceneManager.prototype.renderLoop = function () {
        var self = this, clock = this.clock, controls = this.controls, renderer = this.renderer;

        (function loop() {
            window.requestAnimationFrame( loop );

            /*
             self.camera.position.y = 10;
             self.camera.position.x = Math.floor(Math.cos( self.time*0.0005) * 200);
             self.camera.position.z = Math.floor(Math.sin( self.time *0.0005) * 200);
             self.camera.lookAt( new THREE.Vector3(0,0,0) );
             */
            controls.update( clock.getDelta() );

            self.skyBoxCamera.rotation.setEulerFromRotationMatrix(
                self.mainCamera.parent.matrixWorld,
                //self.camera.matrixWorld,
                THREE.Object3D.defaultEulerOrder
            );

            renderer.render( self.skyBoxScene, self.skyBoxCamera );
            renderer.render( self.scene, self.mainCamera );

            //self.time = Date.now();
        }());


    };

    SceneManager.prototype.windowResize = function () {
        var callback = function () {
            this.renderer.setSize( innerWidth( this.container ), innerHeight( this.container ) );

            this.mainCamera.aspect = innerWidth( this.container ) / innerHeight( this.container );
            this.mainCamera.updateProjectionMatrix();
            this.skyBoxCamera.aspect = this.mainCamera.aspect;
            this.skyBoxCamera.updateProjectionMatrix();

        }.bind( this );
        window.addEventListener( 'resize', callback, false );

        return {
            stop: function () {
                window.removeEventListener( 'resize', callback );
            }
        };
    };

    SceneManager.prototype.addToScene = function ( object ) {
        this.scene.add( object );
        //console.log( object )

    };

    SceneManager.prototype.removeFromScene = function ( object ) {

        this.scene.remove( object );

    };

    SceneManager.prototype.addSkyBox = function ( skyBox ) {
        var scene = this.skyBoxScene;
        if ( scene ) {
            if ( this.getSceneObject( function ( obj ) {
                return obj.name === 'skyBox';
            }, scene ) ) {
                return false;
            }
            skyBox.name = 'skyBox';
            scene.add( skyBox );

            return true;
        }
    };

    SceneManager.prototype.removeSkyBox = function ( skyBox ) {
        var scene = this.skyBoxScene, sky;
        if ( this.skyBoxScene ) {
            sky = this.getSceneObject( function ( obj ) {
                return obj.name === 'skyBox';
            }, scene );

            if ( sky ) {
                scene.remove( sky );
            }
        }
    };

    SceneManager.prototype.setAmbientLight = function ( color ) {
        if ( namespace.util.toType( color ) !== 'array' ) {
            return;
        }

        var scene = this.scene, light;
        if ( scene ) {
            light = this.getSceneObject( function ( obj ) {
                return obj instanceof THREE.AmbientLight;
            } );

            if ( light ) {
                light.color.setRGB( color[0], color[1], color[2] );
            } else {
                light = new THREE.AmbientLight();
                light.color.setRGB( color[0], color[1], color[2] );
                scene.add( light );
            }
        }
    };
    SceneManager.prototype.createLight = function ( type ) {
        var light;

        if(type === 0){
            light =  this.getSceneObject( function ( obj ) {
                return obj instanceof THREE.PointLight && obj.parent instanceof THREE.Scene;
            } );

        }else if(type === 1){
            light = this.getSceneObject( function ( obj ) {
                return obj instanceof THREE.SpotLight && obj.parent instanceof THREE.Scene;
            } );
        }else if(type === 2){
            light = this.getSceneObject( function ( obj ) {
                return obj instanceof THREE.DirectionalLight && obj.parent instanceof THREE.Scene;
            } );
        }else if(type === 3) {
            light = this.getSceneObject( function ( obj ) {
                return obj instanceof THREE.AmbientLight && obj.parent instanceof THREE.Scene;
            } );
        }else{
            return false;
        }

        return light;


    };

    SceneManager.prototype.setMainCamera = function ( cameraEntity ) {
        var entity, camComp, camera, camControls;

        if ( cameraEntity === undefined ) {
            entity = this.cameraManager.createCameraEntity( "freelookcamera" );
        } else if ( cameraEntity instanceof namespace.Entity ) {
            entity = cameraEntity;
        }

        if ( entity ) {
            camComp = entity.getComponent( namespace.ECCamera );
            if ( camComp ) {
                camera = camComp.getCameraObject();
                camControls = entity.controls;

                if ( camControls ) {
                    camControls.setActive();
                }

                if ( camera instanceof THREE.PerspectiveCamera ) {
                    this.mainCamera = camera;
                    this.skyBoxCamera.fov = camera.fov;
                    this.skyBoxCamera.aspect = camera.aspect;
                    this.skyBoxCamera.near = camera.near;
                    this.skyBoxCamera.far = camera.far;
                }
            }
        }

    };

    SceneManager.prototype.getSceneObject = function ( callBack, scene ) {
        if ( typeof callBack !== "function" ) {
            return false;
        }

        if ( !scene ) {
            scene = this.scene;
        }

        var children = scene.children,
            childLength = scene.children.length,
            obj, i;

        if ( children ) {
            for ( i = childLength; i--; ) {
                obj = children[i];
                if ( callBack( obj ) ) {
                    return obj;
                }
            }
        }
        return false;
    };


    SceneManager.prototype.init = function () {

        var body = document.body, renderer, scene, skyBoxScene, camera, skyBoxCamera, controls,
            container = this.container, websocket = this.websocket,
            assetManager = this.assetManager, ecManager = this.ecManager, cameraManager = this.cameraManager,
            self = this, i;


        // *** SCENE AND SKYBOX ***
        scene = this.scene = new THREE.Scene();
        skyBoxScene = this.skyBoxScene = new THREE.Scene();


        // *** CAMERAS ***
        skyBoxCamera = this.skyBoxCamera = new THREE.PerspectiveCamera( 35, (innerWidth( container ) / innerHeight( container )), 1, 10000 );
        skyBoxCamera.lookAt( scene.position );
        this.setMainCamera();

        // *** Dummy lights ***
        for(i=5; i--;){
            scene.add(new THREE.PointLight(null, 0));
            scene.add(new THREE.SpotLight(null, 0));
        }
        scene.add(new THREE.DirectionalLight(null, 0));
        scene.add(new THREE.AmbientLight(null, 0));

        // *** RENDERER ***
        renderer = this.renderer = new THREE.WebGLRenderer( {
            antialias: true,
            clearColor: 0x87CEEB,
            clearAlpha: 1,
            preserveDrawingBuffer: false
        } );

        renderer.autoClear = false;
        //renderer.gammaInput = true;
        //renderer.gammaOutput = true;
        renderer.shadowMapAutoUpdate = true;
        renderer.shadowMapEnabled = true;
        //renderer.shadowMapSoft = false;
        //renderer.shadowMapType = THREE.PCFSoftShadowMap;
        renderer.shadowMapCascade = false;
        renderer.shadowMapCullFace = THREE.CullFaceNone;

        renderer.physicallyBasedShading = true;

        renderer.setSize( innerWidth( this.container ), innerHeight( this.container ) );
        container.appendChild( this.renderer.domElement );


        // *** SIGNAL LISTENERS ***
        //Windows resize listener
        this.windowResize();
        ecManager.entityCreated.add( cameraManager.onEntityCreated, cameraManager );

        if ( websocket ) {
            websocket.bindEvent( "RemoteStorage", function ( data ) {
                assetManager.setRemoteStorage( data );
            } );
        }

        // *** HELPERS FOR DEVELOPING ***
        var axes = new THREE.AxisHelper( 50 );
        axes.position.y = 30;
        scene.add( axes );

    };

    SceneManager.prototype.start = function () {
        try {
            if ( !this.websocket ) {
                throw new Error( ["Invalid WebSocket connection."] );
            }
            this.renderLoop();
            this.websocket.connect();
        } catch (e) {
            console.error( 'SceneManager:', e.stack );
        }
    };

}( window['webtundra'] = window['webtundra'] || {} ));


