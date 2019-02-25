export default class Scene extends THREE.Scene {
    constructor() {
        super();
        this.app = null;
        this.camera = null;
        this.tweens = new TWEEN.Group();
        this.proton = new Proton();
    }

    start() {
    }

    update(dt) {
        this.tweens.update();
        this.proton.update();
     //   Proton.Debug.renderInfo(this.proton, 3);
    }

    resize() {
    }

    initBloom(){
        const params = {
            exposure: 0.1,
            bloomStrength: 0.1,
            bloomThreshold: 0,
            bloomRadius: 0.3
        };

        const renderScene = new THREE.RenderPass(this, this.camera);
        const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.renderToScreen = true;
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;
        const composer = new THREE.EffectComposer(this.app.renderer);
        composer.setSize(window.innerWidth, window.innerHeight);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        this.app.renderer = composer;
    }
}