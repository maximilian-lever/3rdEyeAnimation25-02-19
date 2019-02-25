/**
 * Created by Owlz on 12/01/2019.
 */
export default class Island extends THREE.Mesh {
    constructor(geometry, material, tweens) {
        super(geometry, material);
        //keep a reference to scenes tween group
        this.tweens = tweens;

        //make it very small to hide it, but not zero to avoid mesh warnings
        this.scale.x = 0.00001;
        this.scale.y = 0.00001;
        this.scale.z = 0.00001;
    }

    animateIn(i = 0) {
        new TWEEN.Tween(this.scale, this.tweens)
            .to({x: 2, y: 2, z: 2}, 800)
            .easing(TWEEN.Easing.Elastic.Out)
            .delay(1000 + i * 200)
            .onComplete(() => {
                new TWEEN.Tween(this.position, this.tweens)
                    .to({y: this.position.y - 4}, 1800 + Math.random() * 400)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .yoyo(true)
                    .repeat(Infinity)
                    .delay(Math.random() * 200)
                    .start();
            })
            .start();
    }

    animateOut() {

    }
}