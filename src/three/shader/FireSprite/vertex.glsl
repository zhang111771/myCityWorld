varying vec2 vUv;
varying vec4 vViewPosition;

void main(){
    vUv=uv;
    
    vec4 modelPosition=modelMatrix*vec4(position,1);
    vec4 viewPosition=viewMatrix*modelPosition;
    vViewPosition=viewPosition;
    gl_Position=projectionMatrix*viewPosition;

}