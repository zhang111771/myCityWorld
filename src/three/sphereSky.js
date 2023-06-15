import * as THREE from 'three'
import gsap from 'gsap'
import eventHub from '@/utils/eventHub'
export default class SphereSky{
    constructor(radius,texture,renderer){
        this.renderer=renderer
        let sphereSky=new THREE.SphereGeometry(radius,32,32)
        let material=new THREE.MeshBasicMaterial({
            map:texture,
            side:THREE.BackSide
        })
        this.mesh=new THREE.Mesh(sphereSky,material)
        let uTime={
            value:0
        }
        material.onBeforeCompile=(shader)=>{
            shader.uniforms.uTime=uTime
            shader.fragmentShader.replace('#include <common>',`
            #include <common>
            uniform float uTime;
            `)
            shader.fragmentShader.replace('#include <dithering_fragment>',          
            `
            #include <dithering_fragment>
            float dayStrength=0.0;
            if(abs(uTime-12.0)<4.0){
              dayStrength=1.0;
            }
            if(abs(uTime-12.0)>6.0){
              dayStrength=0.15;
            }
            if(abs(uTime-12.0)>=4.0&&abs(uTime-12.0)<=6.0){
              dayStrength=1.0-(abs(uTime-12.0)-4.0)/2.0;
              dayStrength=clamp(dayStrength,0.15,1.0);
            }
            gl_FragColor=mix(vec4(0.0,0.0,0.0,1.0),gl_FragColor,dayStrength);
            `
            )
        }
      
        gsap.to(uTime,{
            value:24,
            duration:24,
            repeat:-1,
            onUpdate:(time)=>{
                this.updateSun(uTime.value)
                eventHub.emit('getSunTime',uTime.value)
                if(uTime.value>6){
                    this.sun.visible=true
                   

                }
                if(uTime.value>18){
                    this.sun.visible=false
               
                }
                if(Math.abs(uTime.value-12)<4){
                    renderer.toneMappingExposure=3
                   
              
                }
                if(Math.abs(uTime.value-12)>6){
                    renderer.toneMappingExposure=0.5
         
                }
                if(Math.abs(uTime.value-12)>=4&&Math.abs(uTime.value-12)<=6){
                    let strength=3-( Math.abs(uTime.value-12)-4)*2
                    strength<0.5?(strength=0.5):(strength=strength)
                    renderer.toneMappingExposure=strength
                }
            
            }
        })
        //创建太阳
        let sunGeometry=new THREE.SphereGeometry(5,32,32)
        let sunMaterial=new THREE.MeshBasicMaterial({
            emissive:0xffffaa,
            transparent:true
        })
        this.sun=new THREE.Mesh(sunGeometry,sunMaterial)
        this.sun.position.set(30,40,0)
        
        //创建直线光
        let sunLight=new THREE.DirectionalLight(0xffffcc,0.1)
        sunLight.castShadow=true
        this.sun.visible=false
        this.sun.add(sunLight)
        this.mesh.add(this.sun)

    }
    updateSun(time){
        this.sun.position.x = -Math.cos(((time -6) * 2 * Math.PI) / 24) * 100;
        this.sun.position.y = Math.sin(((time -6) * 2 * Math.PI) / 24) * 100;

    }
}