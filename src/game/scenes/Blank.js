import Scene from "./Scene";
import Controls from "../Controls";

export default class WorldScene extends Scene {
    constructor() {
        super();
        /**
         * @type {Controls}
         */
        this.controls = null;
        /**
         * @type {String}
         * @private
         */
        this._state = WorldScene.STATE.NONE;
        /**
         * @type {null}
         * @private
         */
        //  this._mixer = null;

        this._mixers = [];

        this._time = 0;
    }

    start() {
        super.start();

        //add lights
        const light = new THREE.HemisphereLight(0xbbbbff, 0x444422);
        light.position.set(0, 1, 0);
        light.intensity = 0.08;
        this.add(light);

        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(40, 60, -40);
        directionalLight.distance = 0;
        directionalLight.intensity = 0.18;
        directionalLight.color = new THREE.Color(0x66b7f3);
        this.add(directionalLight);

        //skybox
        const skybox = this.app.getModel("skybox");
        skybox.scale.set(100, 100, 100);
        this.add(skybox);
        
        //Helicopter
        const heliParent = new THREE.Scene();
        this.add(heliParent);
        heliParent.rotation.y = Math.PI * 1.5;
        this._heliParent = heliParent;

        const helicopter = this.app.getModel("helicopter");
        helicopter.scale.x = 10;
        helicopter.scale.y = 10;
        helicopter.scale.z = 10;
        helicopter.position.y = 110;
        helicopter.position.z = 90;
        heliParent.add(helicopter);

        helicopter.rotation.x = -Math.PI * 0.1;
        helicopter.rotation.y = Math.PI * 0.5;

        new TWEEN.Tween(helicopter.position, this.tweens)
            .to({y: helicopter.position.y - 4}, 1800)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .yoyo(true)
            .repeat(Infinity)
            .start();
            
        this.camera.position.x = -60;
        this.camera.position.y = 100;

        this._controls = new Controls(this.camera, this.tweens);
        
        // Create an AnimationMixer, and get the list of AnimationClip instances
        const mixer = new THREE.AnimationMixer(helicopter);
        const clips = helicopter.animations;

        // Play a specific animation
        const clip = THREE.AnimationClip.findByName(clips, 'Helicopter');
        const action = mixer.clipAction(clip);
        action.play();
        
        let stepSize = 50;
        const worldSize = 6;

        this._hex = [];

        const offset = 10;

        for (let x = 0; x < worldSize; x++) {

            this._hex[x] = [];
            for (let y = 0; y < worldSize; y++) {
                const model = this.app.getModel("hexagon_tall");
                const meshA = model.meshes["Floorpranelthick_0"];
                const meshB = model.meshes["Floorpranelthick_1"];

                let hexA = new THREE.Mesh(meshA.geometry, meshA.material);

                let hexB = new THREE.Mesh(meshB.geometry, meshB.material);

                const hex = new THREE.Scene();
                hex.add(hexA);
                hex.add(hexB);

                hex.scale.set(10, 10, 10);

                this.add(hex);

                hex.position.x = x * stepSize - (worldSize * stepSize * 0.5) + offset;
                hex.position.z = y * stepSize - (worldSize * stepSize * 0.5) + offset;

                hex.rotation.y = Math.PI * 0.25;

                hex.tween = new TWEEN.Tween(hex.position, this.tweens)
                    .to({y: hex.position.y - 6}, 1800)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .yoyo(true)
                    .repeat(Infinity)
                    .delay(x * 200 + y * 200)
                    .start();

                this._hex[x].push(hex);
            }
        }

        this.addStars();

        this.cycle();

        this._radius = 180;


        this._fairyEmitter = this.createFairyEmitter(this._radius, 100, '#00a0ff', '#ffffff');
        this.proton.addEmitter(this._fairyEmitter);
        this.proton.addRender(new Proton.SpriteRender(this));
        
        this._mixers.push(mixer);
    }

    cycle() {
        setTimeout(() => {
            this.disruptHex();
            setTimeout(() => {
                this.normalHex();
                this.cycle();
            }, 20000);
        }, 20000);
    }

    normalHex() {
        const length = this._hex[0].length;
        for (let x = 0; x < length; x++) {
            for (let y = 0; y < length; y++) {
                const hex = this._hex[x][y];

                hex.tween.stop();

                new TWEEN.Tween(hex.position, this.tweens)
                    .to({y: 0}, 1200)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        hex.tween = new TWEEN.Tween(hex.position, this.tweens)
                            .to({y: hex.position.y - 6}, 2800)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .yoyo(true)
                            .repeat(Infinity)
                            .delay(x * 200 + y * 200)
                            .start();
                    })
                    .start();

            }
        }
    }

    disruptHex() {
        console.log("disprupt");
        const length = this._hex[0].length;
        for (let x = 0; x < length; x++) {
            for (let y = 0; y < length; y++) {
                const hex = this._hex[x][y];

                hex.tween.stop();

                hex.tween = new TWEEN.Tween(hex.position, this.tweens)
                    .to({y: hex.position.y - 4 + 4 * Math.random()}, 2000 + Math.random() * 1000)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .yoyo(true)
                    .repeat(Infinity)
                    .start();

            }
        }
    }

    addStars() {
        var geometry = new THREE.Geometry();
        for (var i = 0; i < 10000; i++) {
            var vertex = new THREE.Vector3();
            vertex.x = THREE.Math.randFloatSpread(2000);
            vertex.y = THREE.Math.randFloatSpread(2000);
            vertex.z = THREE.Math.randFloatSpread(2000);
            geometry.vertices.push(vertex);
        }
        var particles = new THREE.Points(geometry, new THREE.PointsMaterial({
            color: 0x888888
        }));
        this.add(particles);
    }

    createFairyEmitter(x, y, color1, color2) {

        let self = this;

        var emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(1, 2), new Proton.Span(.01, .02));
        emitter.addInitialize(new Proton.Life(2));
        emitter.addInitialize(new Proton.Body(createSprite()));
        emitter.addInitialize(new Proton.Radius(80));
        emitter.addBehaviour(new Proton.Alpha(1, 0));
        emitter.addBehaviour(new Proton.Color(color1, color2));
        emitter.addBehaviour(new Proton.Scale(1, 0.5));
        emitter.p.x = x;
        emitter.p.y = y;
        emitter.emit();
        return emitter;


        function createSprite() {
            const map = self.app.getTexture("dot_add");
            var material = new THREE.SpriteMaterial({
                map: map,
                color: 0xff0000,
                blending: THREE.AdditiveBlending,
                fog: true
            });
            return new THREE.Sprite(material);
        }
    }

    update(dt) {
        super.update(dt);

        for (let i = 0; i < this._mixers.length; i++) {
            this._mixers[i].update(dt * 0.1);
        }

        this._time += dt;

        this._fairyEmitter.p.x = this._radius * Math.cos(this._time * 0.35);
        this._fairyEmitter.p.z = this._radius * Math.sin(this._time * 0.35);

        this._heliParent.rotation.y += dt * -0.05;

        this._controls.update(dt);
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
            color: 0xffffff
        });
        const sprite = new THREE.Sprite(material);

        emitter.addInitialize(new Proton.Body(sprite));
        emitter.addBehaviour(new Proton.Alpha(0.8, 0));
        emitter.addBehaviour(new Proton.Scale(0.2, 0.3));
        emitter.addBehaviour(new Proton.RandomDrift(1, 1, 1, 0.05));
        emitter.addBehaviour(new Proton.Rotate("random", "random"));
        emitter.p.z = 400;
        emitter.p.y = 10;
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