import React, { useEffect, useState, useRef } from 'react'
import styles from './App.module.less'
import { initShaders, rand, normalization } from '@/utils/common'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pointCount] = useState(2000);
  const [gl, setGl] = useState<WebGLRenderingContext>()
  const [program, setProgram] = useState<WebGLProgram>()
  const dataArr = useRef<Float32Array>()
  const mousePosition = useRef<{ x: number; y: number; }>()
  const isBeyond = useRef<boolean>(false);
  const isMouseDown = useRef<boolean>(false);

  const radius = 0.4

  useEffect(() => {
    init();
    if (canvasRef.current) {
      canvasRef.current.onmousemove = null;
      canvasRef.current.onmousemove = (e) => {
        isBeyond.current = true;
        mousePosition.current = normalization({ x: e.clientX, y: e.clientY });
      }
      canvasRef.current.onmouseleave = () => {
        isBeyond.current = false;
      }

      canvasRef.current.onmousedown = null;
      canvasRef.current.onmouseup = null;
      canvasRef.current.onmousedown = (e) => {
        isMouseDown.current = true;
        mousePosition.current = normalization({ x: e.clientX, y: e.clientY });
      };
      canvasRef.current.onmouseup = () => {
        isMouseDown.current = false;
      };
    }
  }, [])

  const init = () => {
    const canvasDom = canvasRef.current;
    if (!canvasDom) {
      return;
    }
    canvasDom.width = window.innerWidth;
    canvasDom.height = window.innerHeight;
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
      // x坐标
      arr.push(rand(-1, 1))
      // y坐标
      arr.push(rand(-1, 1))
      // 大小
      arr.push(rand(2, 3))
      // 颜色
      arr.push(rand(0, 1))
      arr.push(rand(0, 1))
      arr.push(rand(0, 1))
      // x轴速度
      arr.push(rand(-0.01, 0.01))
      // y轴速度
      arr.push(rand(-0.01, 0.01))
    }
    arr = new Float32Array(arr);
    dataArr.current = arr;
    setProgram(program);
  }

  useEffect(() => {
    render();
  }, [gl, program])

  const render = () => {
    if (!gl || !dataArr.current || !program) {
      return;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (mousePosition.current && isBeyond.current) {
      const { x, y } = mousePosition.current;
      let newArr: number[][] = []
      dataArr.current.forEach((item, index) => {
        if (index % 8 !== 0) {
          newArr[newArr.length - 1].push(item);
        } else {
          newArr.push([item])
        }
      })
      newArr.forEach((item) => {
        const dist = Math.sqrt(Math.pow(x - item[0], 2) + Math.pow(y - item[1], 2))
        const angle = Math.atan2(y - item[1], x - item[0]); // 角度
        if (dist <= radius) {
          if(!isMouseDown.current){
            if (dist < 0.05) {
              item[6] = rand(-0.001, 0.001)
              item[7] = rand(-0.001, 0.001)
              return;
            }
            item[6] = 0.003 / dist * Math.cos(angle);
            item[7] = 0.003 / dist * Math.sin(angle);
          }else{
            item[6] -= 0.0001 / dist * Math.cos(angle);
            item[7] -= 0.0001 / dist * Math.sin(angle);
          }
          item[0] += item[6]
          item[1] += item[7]
        } else {
          item[6] *= 0.99;
          item[7] *= 0.99;
          item[0] += item[6]
          item[1] += item[7]
        }


        if (item[0] <= -1) {
          item[0] = -0.99
          item[6] *= -1
        } else if (item[0] >= 1) {
          item[0] = 0.99;
          item[6] *= -1
        }

        if (item[1] <= -1) {
          item[1] = -0.99
          item[7] *= -1
        } else if (item[1] >= 1) {
          item[1] = 0.99;
          item[7] *= -1
        }
      })

      dataArr.current = new Float32Array(newArr.flat())

    }
    // console.log(dataArr.current[0],dataArr.current[1],dataArr.current[6],dataArr.current[7]);


    // BYTES_PER_ELEMENT属性代表了强类型数组中每个元素所占用的字节数
    const FSIZE = dataArr.current.BYTES_PER_ELEMENT;
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, dataArr.current, gl.STATIC_DRAW)

    const a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 8, 0)
    gl.enableVertexAttribArray(a_Position)

    const a_PointSize = gl.getAttribLocation(program, 'a_PointSize');
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 8, FSIZE * 2)
    gl.enableVertexAttribArray(a_PointSize)

    const a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 3)
    gl.enableVertexAttribArray(a_Color)

    // 指定清空<canvas>的颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制一个点
    gl.drawArrays(gl.POINTS, 0, pointCount);
    requestAnimationFrame(render)
  }

  return (
    <div>
      <canvas id='canvasDom' ref={canvasRef} width='800' height='800'></canvas>
    </div>
  )
}

export default App
