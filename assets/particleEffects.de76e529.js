import{r as s,j as R}from"./index.43cbc453.js";import{n as x,i as T,r as a}from"./common.f10fb308.js";const y="particleEffects-module__canvasDown___uVmuv";var O={canvasDown:y};const B=2e3,L=.4;function U(){const n=s.exports.useRef(null),[e,w]=s.exports.useState(),[l,P]=s.exports.useState(),c=s.exports.useRef(),v=s.exports.useRef(),d=s.exports.useRef(!1),g=s.exports.useRef(!1),[b,C]=s.exports.useState(!1);s.exports.useEffect(()=>{D(),S()},[]);const S=()=>{n.current&&(n.current.onmousemove=null,n.current.onmousemove=t=>{d.current=!0,v.current=x({x:t.clientX,y:t.clientY})},n.current.onmouseleave=()=>{d.current=!1},n.current.onmousedown=null,n.current.onmouseup=null,n.current.onmousedown=t=>{g.current=!0,C(!0),v.current=x({x:t.clientX,y:t.clientY})},n.current.onmouseup=()=>{g.current=!1,C(!1)})},D=()=>{const t=n.current;if(!t)return;t.width=window.innerWidth,t.height=window.innerHeight;const i=t.getContext("webgl");if(!i){console.log("\u83B7\u53D6webgl\u7ED8\u56FE\u4E0A\u4E0B\u6587\u5931\u8D25");return}w(i);var h=`
     attribute vec2 a_Position;
     attribute vec3 a_Color;
     attribute float a_PointSize;
     varying vec3 v_Color;
     void main() {
         gl_Position = vec4(a_Position,0.0,1.0); // \u8BBE\u7F6E\u5750\u6807
         gl_PointSize = a_PointSize; // \u8BBE\u7F6E\u5C3A\u5BF8
         v_Color = a_Color;
     } 
 `,E=`
    precision mediump float;
    varying vec3 v_Color;
     void main () {
         gl_FragColor = vec4(v_Color,1.0); // \u8BBE\u7F6E\u989C\u8272
     }
 `;const p=T(i,h,E);let o=[];for(let f=0;f<B;f++)o.push(a(-1,1)),o.push(a(-1,1)),o.push(a(2,3)),o.push(a(0,1)),o.push(a(0,1)),o.push(a(0,1)),o.push(a(-.01,.01)),o.push(a(-.01,.01));o=new Float32Array(o),c.current=o,P(p)};s.exports.useEffect(()=>{F()},[e,l]);const F=()=>{if(!e||!c.current||!l)return;if(e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),v.current&&d.current){const{x:o,y:f}=v.current;let _=[];c.current.forEach((r,u)=>{u%8!==0?_[_.length-1].push(r):_.push([r])}),_.forEach(r=>{const u=Math.sqrt(Math.pow(o-r[0],2)+Math.pow(f-r[1],2)),A=Math.atan2(f-r[1],o-r[0]);if(u<=L){if(g.current)r[6]-=1e-4/u*Math.cos(A),r[7]-=1e-4/u*Math.sin(A);else{if(u<.05){r[6]=a(-.001,.001),r[7]=a(-.001,.001);return}r[6]=.003/u*Math.cos(A),r[7]=.003/u*Math.sin(A)}r[0]+=r[6],r[1]+=r[7]}else r[6]*=.99,r[7]*=.99,r[0]+=r[6],r[1]+=r[7];r[0]<=-1?(r[0]=-.99,r[6]*=-1):r[0]>=1&&(r[0]=.99,r[6]*=-1),r[1]<=-1?(r[1]=-.99,r[7]*=-1):r[1]>=1&&(r[1]=.99,r[7]*=-1)}),c.current=new Float32Array(_.flat())}const t=c.current.BYTES_PER_ELEMENT,i=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,c.current,e.STATIC_DRAW);const h=e.getAttribLocation(l,"a_Position");e.vertexAttribPointer(h,2,e.FLOAT,!1,t*8,0),e.enableVertexAttribArray(h);const E=e.getAttribLocation(l,"a_PointSize");e.vertexAttribPointer(E,1,e.FLOAT,!1,t*8,t*2),e.enableVertexAttribArray(E);const p=e.getAttribLocation(l,"a_Color");e.vertexAttribPointer(p,3,e.FLOAT,!1,t*8,t*3),e.enableVertexAttribArray(p),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.POINTS,0,B),requestAnimationFrame(F)};return R("div",{children:R("canvas",{id:"canvasDom",className:b?O.canvasDown:"",ref:n,width:"800",height:"800"})})}export{U as default};
