import * as THREE from 'three'
import eventHub from '@/utils/eventHub'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import CameraModule from './camera'
import renderer from './renderer'
class ControlsModule{
    constructor(){
        this.setOrbitControls()
        eventHub.on(`toggleControls`,(name)=>{
            this[`set${name}Controls`]()
        })
    }
    setOrbitControls(){
        CameraModule.setActive('default')
        this.controls = new OrbitControls(CameraModule.activeCamera, renderer.domElement);
        this.controls.enableDamping = true;
    }
}
export default new ControlsModule()