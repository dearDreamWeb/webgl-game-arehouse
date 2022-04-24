import React, { useEffect, useState, useRef } from 'react'
import styles from './App.module.less'
import { initShaders, rand, normalization } from '@/utils/common'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pointCount] = useState(2000);
  const [dataArr, setDataArr] = useState<Float32Array>()
  const [gl, setGl] = useState<WebGLRenderingContext>()
  const [program, setProgram] = useState<WebGLProgram>()
  const mousePosition = useRef({ x: 0, y: 0 })

  useEffect(() => {
    init();
    if (canvasRef.current) {
      canvasRef.current.onmousemove = null;
      canvasRef.current.onmousemove = (e) => {
        mousePosition.current = normalization({ x: e.clientX, y: e.clientY });
        console.log(normalization({ x: e.clientX, y: e.clientY }));
      }
    }
  }, [])

  const init = () => {
    const canvasDom = canvasRef.current;
    if (!canvasDom) {
      return;
    }
    const gl = canvasDom.getContext('webgl');
    if (!gl) {
      console.log('获取webgl绘图上下文失败');
      return;
    }
    setGl(gl);
    // 顶点着色器
    var VSHADER_SOURCE = `
     attribute vec2 a_Position;
     attribute vec3 a_Color;
     attribute float a_PointSize;
     varying vec3 v_Color;
     void main() {
         gl_Position = vec4(a_Position,0.0,1.0); // 设置坐标
         gl_PointSize = a_PointSize; // 设置尺寸
         v_Color = a_Color;
     } 
 `;
    // 片元着色器
    var FSHADER_SOURCE = `
    precision mediump float;
    varying vec3 v_Color;
     void main () {
         gl_FragColor = vec4(v_Color,1.0); // 设置颜色
     }
 `;

    const program = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)


    let arr: Float32Array | number[] = [];
    for (let i = 0; i < pointCount; i++) {
      arr.push(rand(-1, 1))
      arr.push(rand(-1, 1))
      arr.push(rand(1, 3))
      arr.push(rand(0, 1))
      arr.push(rand(0, 1))
      arr.push(rand(0, 1))
    }
    arr = new Float32Array(arr);
    setDataArr(arr)
    setProgram(program);
  }

  useEffect(() => {
    render();
  }, [gl, dataArr, program])

  const render = () => {
    if (!gl || !dataArr || !program) {
      return;
    }
    // BYTES_PER_ELEMENT属性代表了强类型数组中每个元素所占用的字节数
    const FSIZE = dataArr.BYTES_PER_ELEMENT;
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, dataArr, gl.STATIC_DRAW)

    const a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0)
    gl.enableVertexAttribArray(a_Position)

    const a_PointSize = gl.getAttribLocation(program, 'a_PointSize');
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2)
    gl.enableVertexAttribArray(a_PointSize)

    const a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
    gl.enableVertexAttribArray(a_Color)

    // 指定清空<canvas>的颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制一个点
    gl.drawArrays(gl.POINTS, 0, pointCount);
  }

  return (
    <div className={styles.app}>
      <canvas id='canvasDom' className={styles.canvasBox} ref={canvasRef} width='800' height='800'></canvas>
    </div>
  )
}

export default App
