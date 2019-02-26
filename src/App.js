import WorldScene from "./game/scenes/WorldScene";
import Stats from "./utils/stats.min";
import common from "./common";
/**
 * @class Simple application class to handle rendering scene, loading assets etc.
 */
export default class App {
    constructor() {
        //Global variable start {
        this._camera = null;
        this._renderer = null;
        this._activeRenderer = null;

        this._backgroundColor = 0x000000;

        this._elapsed = null;
        this._dt = null;

        this._activeScene = null;

        this.gltfLoader = new THREE.GLTFLoader().setPath("assets/gltf/");
        this.textureLoader = new THREE.TextureLoader().setPath("assets/");
        this.fileLoader = new THREE.FileLoader();

        this._assets = {
            models: {},
            textures: {},
            data: {}
        };

        this._files = [
            {name: "sky", uri: "sky.jpg"},
            {name: "particle", uri: "particle.png"},
            {name: "dot", uri: "dot.png"},
            {name: "dot_add", uri: "dot_add.png"},
            {name: "config", uri: "config.json"},
            {name: "skybox", uri: "Skybox.gltf"},
            {name: "robot", uri: "robot.gltf"},
            {name: "helicopter", uri: "helicopterHelicopter.gltf"},
            {name: "hexagon", uri: "HexagonThin.gltf"},
            {name: "hexagon_tall", uri: "HexagonThick.gltf"},
        ];

        const stats = new Stats();
        stats.showPanel(0);
        stats.dom.style.position = 'absolute';
        stats.dom.style.left = '0px';
        stats.dom.style.top = '0px';
      //  document.body.appendChild(stats.dom);

        this.stats = stats;
        //}Global variables end
    }
    init() {
        //init delta times
        this._elapsed = performance.now();
        this._dt = 0;

        //setup camera, renderer and append to div
        this._camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 2000);
        this._renderer = new THREE.WebGLRenderer({antialias: true});
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setClearColor(this._backgroundColor, 1);
        document.body.appendChild(this._renderer.domElement);

        this._activeRenderer = this._renderer;

        //setup resize listener
        window.addEventListener('resize', () => this.resize());
        this.resize();

        this.loadFiles(this._files, this.onLoadingComplete);
    }
    loadFiles(files, callback) {
        const length = files.length;
        let count = 0;

        for (let i = 0; i < length; i++) {
            const file = files[i];
            const ext = file.uri.split(".")[1];
            //console.log(ext);
            switch (ext) {
                case "gltf": {
                    this.loadGLTF(file, () => {
                        count++;
                        console.log("loading : " + (count / length * 100).toFixed(2) + "%");
                        if (count === length) callback.call(this);
                    });
                    break;
                }
                case "jpg":
                case "jpeg":
                case "png": {
                    this.loadTexture(file, () => {
                        count++;
                        console.log("loading : " + (count / length * 100).toFixed(2) + "%");
                        if (count === length) callback.call(this);
                    });
                    break;
                }
                case "json": {
                    this.loadData(file, () => {
                        count++;
                        console.log("loading : " + (count / length * 100).toFixed(2) + "%");
                        if (count === length) callback.call(this);
                    });
                    break;
                }
            }
        }
    }

    //LOADS SCENE IN TO BROWSER
    onLoadingComplete() {
        common.config = this.getData("config");
        this.setActiveScene(new WorldScene());//create and set an active scene
        this.update();//start update loop running
    }
    
    update() {
        this.stats.begin();

        //calculate the dt to use for sync of animations
        const now = performance.now();
        this._dt = (now - this._elapsed) * 0.01;
        this._elapsed = now;

        TWEEN.update();//update tween engine
        if (this._activeScene) this._activeScene.update(this._dt);//update scene
        if (this._activeRenderer) {
            if (this._activeRenderer instanceof THREE.EffectComposer) this._activeRenderer.render();
            else this._activeRenderer.render(this._activeScene, this._camera);//render scene
        }

        //request the next frame
        requestAnimationFrame(() => this.update());

        this.stats.end();
    }
    resize() {

        this._renderer.setSize(window.innerWidth, window.innerHeight);
        if (this._activeRenderer instanceof THREE.EffectComposer) this._activeRenderer.setSize(window.innerWidth, window.innerHeight);

        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        if (this._activeScene) this._activeScene.resize();
    }
    /**
     * @param scene {Scene}
     */
    setActiveScene(scene) {
        this._activeScene = scene;
        this._activeScene.app = this;
        this._activeScene.camera = this._camera;
        this._activeScene.start();
    }
    /**
     * Loads a gltf model
     * @param fileData {Object}
     * @param callback {Function}
     */
    loadGLTF(fileData, callback) {
        this.gltfLoader.load(fileData.uri, (gltf) => {

            this._assets.models[fileData.name] = {};

            this._assets.models[fileData.name].model = gltf.scene;
            this._assets.models[fileData.name].model.meshes = {};
            this._assets.models[fileData.name].model.animations = gltf.animations;

            gltf.scene.traverse((child) => {


                if (child.isMesh) {

                    this._assets.models[fileData.name].model.meshes[child.name] = child;

                    //use this if your material has an environment map and you use a skybox etc
                    if (fileData.name !== "skybox") {

                        /*
                        child.material = new THREE.MeshToonMaterial({
                            map: child.material.map,
                            bumpMap: child.material.map,
                            color: child.material.color,
                            reflectivity: 0,
                            shininess: 0
                        });
                        */
                        if (fileData.name === "helicopter") {

                            child.material = new THREE.MeshLambertMaterial({
                                map: child.material.map,
                                //   bumpMap: child.material.map,
                                color: child.material.color,
                                reflectivity: 0,
                                shininess: 0
                            });

                        } else if (fileData.name === "hexagon_tall") {


                            if (child.name === "Floorpranelthick_0") {
                                child.material = new THREE.MeshStandardMaterial({
                                    map: child.material.map,
                                    //   bumpMap: child.material.map,
                                    //  color: child.material.color,
                                    emissiveMap: child.material.map,
                                    emissiveIntensity: 1,
                                    emissive: 0xffffff
                                });
                            } else {

                            }


                        }
                    } else {
                        //sky box should be unlit material
                        child.material = new THREE.MeshBasicMaterial({
                            map: child.material.map,
                            reflectivity: 0
                        });
                    }
                }
            });

            this._assets.models[fileData.name].getMesh = function (name) {
                return this.meshes[name];
            };


            this._assets.models[fileData.name].base = gltf;
            //console.log(gltf);
            if (callback) callback.call(this);
        }, undefined, function (e) {
            console.error(e);
        });
    }
    /**
     * Loads a texture
     * @param fileData
     * @param callback
     */
    loadTexture(fileData, callback) {
        this._assets.textures[fileData.name] = {};
        this._assets.textures[fileData.name].texture = this.textureLoader.load(fileData.uri);
        if (callback) callback.call(this);
    }
    loadData(fileData, callback) {
        this._assets.data[fileData.name] = {};
        this.fileLoader.load(
            // resource URL
            "./assets/data/" + fileData.uri,

            // onLoad callback
            (data) => {
                // output the text to the console
                //console.log(data)
                this._assets.data[fileData.name] = JSON.parse(data);
                if (callback) callback.call(this);
            },

            // onProgress callback
            function (xhr) {
                //console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },

            // onError callback
            function (err) {
                console.error('An error happened');
            }
        );
    }
    /**
     * fetches a model from asset cache
     * @param name {String}
     * @returns {*}
     */
    getModel(name) {
        return this._assets.models[name].model;
    }
    /**
     * fetches a texture from asset cache
     * @param name {String}
     * @returns {*}
     */
    getTexture(name) {
        return this._assets.textures[name].texture;
    }
    /**
     * fetches a data file from asset cache
     * @param name {String}
     * @returns {*}
     */
    getData(name) {
        return this._assets.data[name];
    }
    get assets() {
        return this._assets;
    }
    get renderer() {
        return this._renderer;
    }
    get width() {
        return this._renderer.getDrawingBufferSize().width;
    }
    get height() {
        return this._renderer.getDrawingBufferSize().height;
    }
    set renderer(value) {
        this._activeRenderer = value;
    }
}
