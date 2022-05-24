var P=Object.defineProperty;var D=(c,t,i)=>t in c?P(c,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):c[t]=i;var l=(c,t,i)=>(D(c,typeof t!="symbol"?t+"":t,i),i);import{r as n,j as L}from"./index.43cbc453.js";import{i as b}from"./common.f10fb308.js";class X{constructor({gl:t}){l(this,"gl");l(this,"program");l(this,"dataArr");l(this,"bufferId");l(this,"vx");l(this,"vy");l(this,"position");l(this,"isMove");l(this,"flatData");this.gl=t,this.program=this.initProgram(),this.bufferId=this.gl.createBuffer(),this.flatData={flatX:0,flatEndX:0,flatY:0,flatH:0},this.vx=.006,this.vy=-.009,this.position={x:0,y:0},this.dataArr=[this.position.x,this.position.y,1,1,1],this.isMove=!1}initProgram(){const t=`
            attribute vec2 a_Position;
            attribute vec3 a_Color;
            varying vec3 v_Color;
            uniform mat4 mat;  // \u521B\u5EFA\u4E00\u4E2A uniform \u53D8\u91CF\uFF0C\u4EE3\u8868\u5E73\u79FB\u77E9\u9635
            void main() {
                gl_Position = mat * vec4(a_Position,0.0,1.0); // \u8BBE\u7F6E\u5750\u6807
                gl_PointSize = 8.0; // \u8BBE\u7F6E\u5C3A\u5BF8
                v_Color = a_Color;
            } 
        `,i=`
        precision mediump float;
        varying vec3 v_Color;
            void main () {
                gl_FragColor = vec4(v_Color,1.0); // \u8BBE\u7F6E\u989C\u8272
            }
        `;return b(this.gl,t,i)}applyBufferData(){this.gl.useProgram(this.program);const t=new Float32Array(this.dataArr).BYTES_PER_ELEMENT;this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.bufferId),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(this.dataArr),this.gl.STATIC_DRAW);const i=this.gl.getAttribLocation(this.program,"a_Position");this.gl.vertexAttribPointer(i,2,this.gl.FLOAT,!1,t*5,0),this.gl.enableVertexAttribArray(i);const e=this.gl.getAttribLocation(this.program,"a_Color");this.gl.vertexAttribPointer(e,3,this.gl.FLOAT,!1,t*5,t*2),this.gl.enableVertexAttribArray(e);const{x:h,y:A}=this.position;this.beyondBoundary(),this.position={x:h+this.vx,y:A+this.vy};let f=this.position.x,s=this.position.y,E=0,u=1;const g=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,f,s,E,u]),d=this.gl.getUniformLocation(this.program,"mat");this.gl.uniformMatrix4fv(d,!1,g)}isBeyondBoundaryY(){const{y:t}=this.position;return Math.abs(t)>1}beyondBoundary(){const t=8/(window.innerWidth/2);let{x:i,y:e}=this.position;const{flatX:h,flatEndX:A,flatY:f,flatH:s}=this.flatData;e<f||((i+t>h&&i<A&&e<0&&e>=f&&Number(Math.abs(e-f).toFixed(2))<=s||e>=1)&&(this.vy*=-1),Math.abs(i)>=1&&(this.vx*=-1))}draw({flatX:t,flatEndX:i,flatY:e,flatH:h}){this.flatData={flatX:t,flatEndX:i,flatY:e,flatH:h},this.applyBufferData(),!this.isBeyondBoundaryY()&&this.gl.drawArrays(this.gl.POINTS,0,1)}}const r={initSpeed:.1,initHelpSpeed:.005,width:.4,height:.01,startX:-.1,startY:-.89};function O(){const c=n.exports.useRef(null),[t,i]=n.exports.useState(),[e,h]=n.exports.useState();let A=n.exports.useRef(),f=n.exports.useRef(),s=n.exports.useRef(r.initSpeed),E=n.exports.useRef(r.initHelpSpeed),u=n.exports.useRef(0);const g=n.exports.useRef([r.startX,r.startY,1,0,1,3,r.startX,r.startY-r.height,1,0,1,3,r.startX+r.width,r.startY-r.height,1,0,1,3,r.startX+r.width,r.startY,1,0,1,3]).current,d=n.exports.useRef();n.exports.useEffect(()=>(v(),document.onkeydown=o=>{o.code==="ArrowLeft"?(E.current*=1.01,s.current=-Math.abs(s.current)-E.current,u.current+=s.current,F()):o.code==="ArrowRight"&&(E.current*=1.01,s.current=Math.abs(s.current)+E.current,u.current+=s.current,F())},document.onkeyup=()=>{E.current=r.initHelpSpeed,s.current=r.initSpeed},()=>{document.onkeydown=null}),[]);const F=()=>{const o=-1-r.startX,a=1-r.startX-r.width;r.startX+u.current<=o?u.current=o:u.current+r.startX>=a&&(u.current=a)},v=()=>{const o=c.current;if(!o)return;o.width=window.innerWidth,o.height=window.innerHeight;const a=o.getContext("webgl");if(!a){console.log("\u83B7\u53D6webgl\u7ED8\u56FE\u4E0A\u4E0B\u6587\u5931\u8D25");return}d.current=new X({gl:a}),i(a);const m=b(a,`
            attribute vec2 a_Position;
            attribute vec3 a_Color;
            attribute float a_PointSize;
            uniform mat4 mat;  // \u521B\u5EFA\u4E00\u4E2A uniform \u53D8\u91CF\uFF0C\u4EE3\u8868\u5E73\u79FB\u77E9\u9635
            varying vec3 v_Color;
            void main() {
                gl_Position = mat * vec4(a_Position,0.0,1.0); // \u8BBE\u7F6E\u5750\u6807
                gl_PointSize = a_PointSize; // \u8BBE\u7F6E\u5C3A\u5BF8
                v_Color = a_Color;
            } 
        `,`
            precision mediump float;
            varying vec3 v_Color;
            void main () {
                gl_FragColor = vec4(v_Color,1.0); // \u8BBE\u7F6E\u989C\u8272
            }
        `);A.current=a.createBuffer(),f.current=a.createBuffer(),h(m)};n.exports.useEffect(()=>{R()},[t,e]);const B=()=>{if(!t||!e)return;const o=new Float32Array(g).BYTES_PER_ELEMENT;t.bindBuffer(t.ARRAY_BUFFER,A.current),t.bufferData(t.ARRAY_BUFFER,new Float32Array(g),t.STATIC_DRAW);const a=t.getAttribLocation(e,"a_Position");t.vertexAttribPointer(a,2,t.FLOAT,!1,o*6,0),t.enableVertexAttribArray(a);const _=t.getAttribLocation(e,"a_PointSize");t.vertexAttribPointer(_,1,t.FLOAT,!1,o*6,o*5),t.enableVertexAttribArray(_);const p=t.getAttribLocation(e,"a_Color");t.vertexAttribPointer(p,3,t.FLOAT,!1,o*6,o*3),t.enableVertexAttribArray(p);let m=u.current,y=0,x=0,S=1;const C=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,m,y,x,S]),w=t.getUniformLocation(e,"mat");t.uniformMatrix4fv(w,!1,C);let T=new Uint16Array([0,1,2,0,2,3]);t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,f.current),t.bufferData(t.ELEMENT_ARRAY_BUFFER,T,t.STATIC_DRAW),t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0)},R=()=>{!t||!e||!A.current||(t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(e),B(),d.current.draw({flatX:r.startX+u.current,flatEndX:r.startX+u.current+r.width,flatY:r.startY,flatH:r.height}),requestAnimationFrame(R))};return L("canvas",{ref:c})}export{O as default};
