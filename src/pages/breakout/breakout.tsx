import React, { useEffect, useRef, useState } from 'react';
import { initShaders, rand, normalization } from '@/utils/common'


function Breakout() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gl, setGl] = useState<WebGLRenderingContext>()
    const [program, setProgram] = useState<WebGLProgram>()
    // const dataArr = useRef<Float32Array>().current;
    let bufferId = useRef<WebGLBuffer>();
    let sizeId = useRef<WebGLBuffer>();
    let colorId = useRef<WebGLBuffer>();

    useEffect(() => {
        init();
    }, [])

    /**
     * 初始化webgl程序
     * @returns 
     */
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
        const VSHADER_SOURCE = `
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
        const FSHADER_SOURCE = `
            precision mediump float;
            varying vec3 v_Color;
            void main () {
                gl_FragColor = vec4(v_Color,1.0); // 设置颜色
            }
        `;
        const program = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)
        bufferId.current = gl.createBuffer()!;
        colorId.current = gl.createBuffer()!;
        sizeId.current = gl.createBuffer()!;
        setProgram(program);
    }

    useEffect(() => {
        render();
    }, [gl, program])

    /**
     * 使用bufferData
     * @param dataArr 
     * @returns 
     */
    const applyBufferData = (dataArr: number[]) => {
        if (!gl || !program) {
            return;
        }
        // BYTES_PER_ELEMENT属性代表了强类型数组中每个元素所占用的字节数
        const FSIZE = new Float32Array(dataArr).BYTES_PER_ELEMENT;
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId.current!);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dataArr), gl.STATIC_DRAW);
        const a_Position = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0);
        gl.enableVertexAttribArray(a_Position);

        const a_PointSize = gl.getAttribLocation(program, 'a_PointSize');
        gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2)
        gl.enableVertexAttribArray(a_PointSize)

        const a_Color = gl.getAttribLocation(program, 'a_Color');
        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
        gl.enableVertexAttribArray(a_Color)
    }

    const render = () => {
        if (!gl || !program || !bufferId.current || !sizeId.current || !colorId.current) {
            return;
        }
        applyBufferData([
            -0.1, -0.1, 1, 1, 1, 3,
            -0.1, 0.1, 1, 1, 1, 3,
            0.3, 0.1, 1, 1, 1, 3,
            0.3, -0.1, 1, 1, 1, 3,
        ])
        // 指定清空<canvas>的颜色
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // 清空canvas
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.LINE_LOOP, 0, 4);
    }

    return <canvas ref={canvasRef}></canvas>
}

export default Breakout