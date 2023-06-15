// precision mediump float;
// uniform float uTime;
// uniform bool starState;
//  mat3 rotate3d(float _angle){
//     return mat3(cos(_angle),0,sin(_angle),0,1,0,-sin(_angle),0,cos(_angle));
//  }
//  float random (in vec2 st) {
//     return fract(sin(dot(st.xy,
//                          vec2(12.9898,78.233)))
//                  * 43758.5453123);
// }

// void main(){
//     vec4 modelPosition;
//     vec3 vPosition;
//     float lastTime;
//     if(starState){
//          float r=random(position.xy);
//         vPosition=vec3(position.x*cos(r*uTime)*5.0,position.y+10.0,position.z*sin(r*uTime)*5.0);
//          modelPosition=modelMatrix*vec4(vPosition,1);
//     }
  
//     vec4 viewPosition=viewMatrix*modelPosition;
//     gl_Position=projectionMatrix*viewPosition;
//     gl_PointSize=2.0;

// }
attribute vec3 aPosition;
uniform float uTime;
void main(){
    vec4 currentPosition=modelMatrix*vec4(position,1.0);
    vec3 direction=aPosition-currentPosition.xyz;
    vec3 targetPosition=currentPosition.xyz+direction*0.1*uTime;
    vec4 vPosition=viewMatrix*vec4(targetPosition,1.0);
    gl_Position=projectionMatrix*vPosition;
    gl_PointSize=2.0;
}