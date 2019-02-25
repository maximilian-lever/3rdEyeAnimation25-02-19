import Scene from "./Scene";
import Island from "../Island";
import Controls from "../Controls";

export default class IslandScene extends Scene {
    constructor() {
        super();
        /**
         * @type {Controls}
         */
        this.controls = null;
        /**
         * @type {Island}
         * @private
         */
        this._island1 = null;
        /**
         * @type {Island}
         * @private
         */
        this._island2 = null;
        /**
         * @type {Island}
         * @private
         */
        this._island3 = null;
        /**
         * @type {String}
         * @private
         */
        this._state = IslandScene.STATE.NONE;
    }

    start() {
        super.start();

        //setup camera and controller
        this.camera.position.z = 600;
        this.controls = new Controls(this.camera, this.tweens);

        //add lights
        const light = new THREE.HemisphereLight(0xbbbbff, 0x444422);
        light.position.set(0, 1, 0);
        this.add(light);

        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(-40, 60, 10);
        directionalLight.distance = 0;
        directionalLight.intensity = 2;
        this.add(directionalLight);

        //set background texture
        this.background = this.app.getTexture("sky");

        //get island model data and create some islands
        const islandScene = this.app.getModel("island");
        const geometry = islandScene.children[2].geometry;
        const material = islandScene.children[2].material;

        const xSpace = 160;
        const zSpace = 160;

        this._island1 = new Island(geometry, material, this.tweens);
        this._island1.position.x = xSpace;
        this._island1.position.y = -8;
        this.add(this._island1);
        this._island1.animateIn(0);

        this._island2 = new Island(geometry, material, this.tweens);
        this._island2.position.x = -xSpace;
        this._island2.position.z = -zSpace;
        this._island2.position.y = -32;
        this.add(this._island2);
        this._island2.animateIn(1);

        this._island3 = new Island(geometry, material, this.tweens);
        this._island3.position.x = xSpace;
        this._island3.position.z = -zSpace * 2;
        this._island3.position.y = -24;
        this.add(this._island3);
        this._island3.animateIn(2);

        //create the dust mote emitter
        this.initAmbientEmitter();
        for (let i = 0; i < 1000; i++) this.proton.update();//wind emitters forwards
    }

    update(dt) {
        super.update(dt);
        this.onStateUpdate(dt);
    }

    resize() {
        super.resize();
    }

    initAmbientEmitter() {
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(20, 30), new Proton.Span(0.2, 0.4));
        emitter.addInitialize(new Proton.Radius(new Proton.Span(20, 20)));
        const position = new Proton.Position();
        position.addZone(new Proton.BoxZone(1500, 80, 1500));
        emitter.addInitialize(position);
        emitter.addInitialize(new Proton.Life(5, 10));

        const map = this.app.getTexture("particle");
        const material = new THREE.SpriteMaterial({
            map: map,
            transparent: true,
            opacity: 0.8,
            color: 0x696969
        });
        const sprite = new THREE.Sprite(material);

        emitter.addInitialize(new Proton.Body(sprite));
        emitter.addBehaviour(new Proton.Scale(0.2, 0.3));
        emitter.addBehaviour(new Proton.RandomDrift(1, 1, 1, 0.05));
        emitter.addBehaviour(new Proton.Rotate("random", "random"));
        emitter.p.z = 400;
        // const screenZone = new Proton.ScreenZone(this.camera, this.app.renderer, 20, "234");
        // emitter.addBehaviour(new Proton.CrossZone(screenZone, "dead"));
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.proton.addRender(new Proton.SpriteRender(this));
    }

    setState(state) {
        this.onStateEnd();
        this._state = state;
        this.onStateBegin();
    }

    onStateBegin() {
        switch (this._state) {
            case IslandScene.STATE.NONE : {
                break;
            }
            case IslandScene.STATE.ISLAND1 : {
                console.log(this._island1.position.z);
                const lookAtVector = new THREE.Vector3(-10, 5, this._island1.position.z + 10);
                lookAtVector.applyQuaternion(this.camera.quaternion);
                new TWEEN.Tween(this.camera.position, this.tweens)
                    .to({x: -10, y: 5, z: this._island1.position.z + 10}, 800)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                new TWEEN.Tween(this.camera.rotation, this.tweens)
                    .to({y: -Math.PI * 0.2}, 800)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                setTimeout(() => {
                    this.controls.scrollTrigger = () => {
                        this.setState(IslandScene.STATE.ISLAND2);
                        this.controls.scrollTrigger = null;
                    };
                }, 1000);
                break;
            }
            case IslandScene.STATE.ISLAND2 : {
                const lookAtVector = new THREE.Vector3(10, 5, this._island2.position.z + 10);
                lookAtVector.applyQuaternion(this.camera.quaternion);
                new TWEEN.Tween(this.camera.position, this.tweens)
                    .to({x: 10, y: 5, z: this._island2.position.z + 10}, 800)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                new TWEEN.Tween(this.camera.rotation, this.tweens)
                    .to({y: -Math.PI * 0.4}, 800)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                setTimeout(() => {
                    this.controls.scrollTrigger = () => {
                        this.setState(IslandScene.STATE.ISLAND3);
                        this.controls.scrollTrigger = null;
                    };
                }, 1000);
                break;
            }
            case IslandScene.STATE.ISLAND3 : {
                new TWEEN.Tween(this.camera.position, this.tweens)
                    .to({x: -10, y: 5, z: this._island3.position.z + 10}, 800)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                new TWEEN.Tween(this.camera.rotation, this.tweens)
                    .to({y: -Math.PI * 0.4}, 800)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                setTimeout(() => {
                    this.controls.scrollTrigger = () => {
                        this.setState(IslandScene.STATE.END);
                        this.controls.scrollTrigger = null;
                    };
                }, 1000);
                break;
            }
            case IslandScene.STATE.END : {
                /*
                 this.controls.minRotationX = this.camera.rotation.x - Math.PI * 0.05;
                 this.controls.maxRotationX = this.camera.rotation.x + Math.PI * 0.05;
                 this.controls.minRotationY = this.camera.rotation.y - Math.PI * 0.05;
                 this.controls.maxRotationY = this.camera.rotation.y + Math.PI * 0.05;
                 */
                break;
            }
            default: {
                console.warn("unknown state : " + this._state);
                break;
            }
        }
    }

    onStateEnd() {
        switch (this._state) {
            case IslandScene.STATE.NONE : {
                break;
            }
            case IslandScene.STATE.ISLAND1 : {
                break;
            }
            case IslandScene.STATE.ISLAND2 : {
                break;
            }
            case IslandScene.STATE.ISLAND3 : {
                break;
            }
            case IslandScene.STATE.END : {
                break;
            }
            default: {
                console.warn("unknown state : " + this._state);
                break;
            }
        }
    }

    onStateUpdate(dt) {
        switch (this._state) {
            case IslandScene.STATE.NONE : {
                this.controls.update(dt);
                if (Math.abs(this.camera.position.z - this._island1.position.z) < 60) {
                    //this.setState(IslandScene.STATE.ISLAND1);
                }
                break;
            }
            case IslandScene.STATE.ISLAND1 : {
                break;
            }
            case IslandScene.STATE.ISLAND2 : {
                break;
            }
            case IslandScene.STATE.ISLAND3 : {
                break;
            }
            case IslandScene.STATE.END : {
                this.controls.update(dt);
                break;
            }
            default: {
                console.warn("unknown state : " + this._state);
                break;
            }
        }
    }
}

IslandScene.STATE = {};
IslandScene.STATE.NONE = "none";
IslandScene.STATE.ISLAND1 = "island1";
IslandScene.STATE.ISLAND2 = "island2";
IslandScene.STATE.ISLAND3 = "island3";
IslandScene.STATE.END = "end";
