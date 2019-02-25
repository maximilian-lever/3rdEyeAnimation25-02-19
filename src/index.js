//import js libs
import jquery from "jquery";
window.$ = jquery;

import isMobile from "ismobilejs";
window.isMobile = isMobile;

import TWEEN from "./utils/Tween";
window.TWEEN = TWEEN;

import Proton from 'three.proton.js';
window.Proton = Proton;

//import threejs utils, put as many as you want in the utils folder but only import what you will use
import GLTFLoader from "./utils/GLTFLoader";
import OrbitControls from "./utils/OrbitControls";

import {CopyShader} from "./utils/CopyShader";

import {EffectComposer} from "./utils/EffectComposer";
import {ShaderPass} from "./utils/ShaderPass";
import {RenderPass} from "./utils/RenderPass";
import {LuminosityHighPassShader} from "./utils/LuminosityHighPassShader";
import {UnrealBloomShaderPass} from "./utils/UnrealBloomShaderPass";

//initialise app
import App from "./App";
const app = new App();
app.init();
