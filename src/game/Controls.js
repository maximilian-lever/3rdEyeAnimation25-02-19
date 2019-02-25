/**
 * Created by Owlz on 12/01/2019.
 */

import common from "../common";

export default class Controls {
    constructor(camera, tweens) {
        this.camera = camera;
        this.tweens = tweens;
        this.scrollSpeed = (isMobile.any) ? common.config.dollySpeed.mobile : common.config.dollySpeed.desktop;
        this.scrollEase = common.config.dollyEase;
        this.rotateSpeed = common.config.lookSpeed;
        this.rotateEase = common.config.lookEase;
        this._targetZ = camera.position.z;
        this._targetRotY = camera.rotation.y;
        this._targetRotX = camera.rotation.x;

        this.maxRotationY = Math.PI * 0.05;
        this.minRotationY = -Math.PI * 0.05;
        this.maxRotationX = Math.PI * 0.05;
        this.minRotationX = -Math.PI * 0.05;

        this._cameraStartX = this.camera.position.x;

        this.focalOffset = {x: 0, y: 0};

        this._startX = null;
        this._startY = null;

        this._lastX = null;
        this._lastY = null;

        //this._isDown = false;
        //this._isTweening = false;

        this._maxZ = 60;
        this._minZ = -40;

        document.addEventListener("wheel", (e) => this.onScroll(e));
        document.addEventListener("mousedown", (e) => this.onDown(e));
        document.addEventListener("mouseup", (e) => this.onUp(e));
        document.addEventListener("mousemove", (e) => this.onMove(e));

        document.addEventListener("touchstart", (e) => this.onDown(e));
        document.addEventListener("touchend", (e) => this.onUp(e));
        document.addEventListener("touchmove", (e) => this.onTouchMove(e));

        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", (event) => {
                this.onGyro({x: event.beta, y: event.gamma});
            }, true);
        } else if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', function () {
                this.onGyro({x: event.acceleration.x * 2, y: event.acceleration.y * 2});
            }, true);
        } else {
            window.addEventListener("MozOrientation", function () {
                this.onGyro({x: event.orientation.x * 50, y: event.orientation.y * 50});
            }, true);
        }
    }

    update(dt) {
        this.camera.position.z += (this._targetZ - this.camera.position.z) * this.scrollEase;

        this.camera.rotation.y += (this._targetRotY - this.camera.rotation.y) * this.rotateEase;
        this.camera.rotation.x += (this._targetRotX - this.camera.rotation.x) * this.rotateEase;

        this.camera.position.x = Math.sin(this.camera.position.z * 0.006) * 60 + Math.sin(this.camera.position.z * 0.01) * 18 + this._cameraStartX;
        this.focalOffset.y = -(Math.sin(this.camera.position.z * 0.006) * Math.PI * 0.1 + Math.sin(this.camera.position.z * 0.01) * Math.PI * 0.06);
        //this.camera.position.x = Math.sin(this.camera.position.z * 0.015) * 3;
        //this.camera.position.y = Math.sin(this.camera.position.z * 0.008) * 14 + Math.sin(this.camera.position.z * 0.016) * 6;

        if (this._targetRotX < this.focalOffset.x + this.minRotationX) this._targetRotX = this.focalOffset.x + this.minRotationX;
        else if (this._targetRotX > this.focalOffset.x + this.maxRotationX) this._targetRotX = this.focalOffset.x + this.maxRotationX;

        if (this._targetRotY < this.focalOffset.y + this.minRotationY) this._targetRotY = this.focalOffset.y + this.minRotationY;
        else if (this._targetRotY > this.focalOffset.y + this.maxRotationY) this._targetRotY = this.focalOffset.y + this.maxRotationY;

    }

    scrollTrigger() {

    }

    onScroll(event) {
        if (event.preventDefault) event.preventDefault();
        this._targetZ += Math.sign(event.deltaY) * this.scrollSpeed;
        if (this.scrollTrigger) this.scrollTrigger();

        if (this._targetZ > this._maxZ) this._targetZ = this._maxZ;
        else if (this._targetZ < this._minZ) this._targetZ = this._minZ;
    }

    onGyro(event) {
        //TODO - disabled, look for cause of irratic shaking
        return;
        if (event.x && event.y) {
            const dx = event.x - this._lastX;
            this._targetRotY -= this.rotateSpeed * Math.sign(dx) * 0.01;

            const dy = event.y - this._lastY;
            this._targetRotX -= this.rotateSpeed * Math.sign(dy) * 0.01;

            this._lastX = event.x;
            this._lastY = event.y;
        }
    }

    onMove(event) {
        //if (this._isTweening) return;

        event.preventDefault();

        /*
         if (this._isDown) {
         const dx = event.x - this._startX;
         this._targetRotY += this.rotateSpeed * Math.sign(dx) * 0.001;
         if (this._targetRotY < this.minRotationY) this._targetRotY = this.minRotationY;
         else if (this._targetRotY > this.maxRotationY) this._targetRotY = this.maxRotationY;

         const dy = event.y - this._startY;
         this._targetRotX += this.rotateSpeed * Math.sign(dy) * 0.001;
         if (this._targetRotX < this.minRotationX) this._targetRotX = this.minRotationX;
         else if (this._targetRotX > this.maxRotationX) this._targetRotX = this.maxRotationX;
         }
         */

        if (this._lastX && this._lastY) {
            const dx = event.x - this._lastX;
            this._targetRotY -= this.rotateSpeed * Math.sign(dx) * 0.001;

            const dy = event.y - this._lastY;
            this._targetRotX -= this.rotateSpeed * Math.sign(dy) * 0.001;
        }

        this._lastX = event.x;
        this._lastY = event.y;
    }

    onTouchMove(event) {
        //if (this._isTweening) return;

        event.preventDefault();

        //single touch / multi touch
        if (!event.touches[1]) {
            const dy = this._startY - event.touches[0].pageY;
            this._targetRotX += this.rotateSpeed * Math.sign(dy) * 0.001;
            if (this._targetRotX < this.minRotationX) this._targetRotX = this.minRotationX;
            else if (this._targetRotX > this.maxRotationX) this._targetRotX = this.maxRotationX;

            this.onScroll({deltaY: dy});
        } else {
            // console.log(event);
            const dx = event.touches[0].pageX - this._startX;
            this._targetRotY -= this.rotateSpeed * Math.sign(dx) * 0.001;
            if (this._targetRotY < this.minRotationY) this._targetRotY = this.minRotationY;
            else if (this._targetRotY > this.maxRotationY) this._targetRotY = this.maxRotationY;

            const dy = event.touches[0].pageY - this._startY;
            this._targetRotX -= this.rotateSpeed * Math.sign(dy) * 0.001;
            if (this._targetRotX < this.minRotationX) this._targetRotX = this.minRotationX;
            else if (this._targetRotX > this.maxRotationX) this._targetRotX = this.maxRotationX;
        }
    }

    onDown(event) {
        //if (this._isTweening) return;

        event.preventDefault();

        this._isDown = true;

        if (event.x) {
            this._startX = event.x;
            this._startY = event.y;
        } else if (event.touches) {
            this._startX = event.touches[0].clientX;
            this._startY = event.touches[0].clientY;
        }
    }

    onUp(event) {
        //if (this._isTweening) return;

        event.preventDefault();

        this._isDown = false;
        this._startX = null;
        this._startY = null;

        //this._isTweening = true;

        /*
         const v = 2;//velocity

         const dX = Math.abs(this.camera.rotation.x);//distance
         const tX = dX / v;     //v = d/t
         const dY = Math.abs(this.camera.rotation.y);//distance
         const tY = dY / v;     //v = d/t

         const t = (tX > tY) ? tX : tY;

         new TWEEN.Tween(this.camera.rotation, this.tweens)
         .to({x: 0, y: 0}, t * 10000)
         .easing(TWEEN.Easing.Quadratic.InOut)
         .delay(200)
         .onComplete(() => this._isTweening = false)
         .start();

         this._targetRotX = 0;
         this._targetRotY = 0;
         */
    }
}