uniform vec3 uColor;
uniform sampler2D uTexture;
uniform float uSunTime;
void main(){
    float opacity=1.0-sin(uSunTime/6.28);
    gl_FragColor=vec4(uColor,opacity);
}