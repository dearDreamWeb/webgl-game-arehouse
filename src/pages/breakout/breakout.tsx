import React, { useEffect, useRef, useState } from 'react';
import { initShaders, rand, normalization } from '@/utils/common'
import Bullet from './engine/bullet'
import Rect from './engine/rect'

const FLATDATA = {
    initSpeed: 0.1,
    initHelpSpeed: 0.005,
    width: 0.4,
    height: 0.01,
    startX: -0.1,
    startY: -0.89
}

function Breakout() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gl, setGl] = useState<WebGLRenderingContext>()
    const [program, setProgram] = useState<WebGLProgram>()
    let bufferId = useRef<WebGLBuffer>();
    let bufferIndex = useRef<WebGLBuffer>();
    // 平板的速度
    let flatSpeed = useRef<number>(FLATDATA.initSpeed);
    let flatHelpSpeed = useRef<number>(FLATDATA.initHelpSpeed);
    // 平板的x轴距离
    let flatX = useRef<number>(0);

    // 平板的长方形数据
    const flatDataArr = useRef<number[]>([
        // 左上角
        FLATDATA.startX, FLATDATA.startY, 1.0, 0.0, 1.0, 3.0,
        // 左下角
        FLATDATA.startX, FLATDATA.startY - FLATDATA.height, 1.0, 0.0, 1.0, 3.0,
        // 右下角
        FLATDATA.startX + FLATDATA.width, FLATDATA.startY - FLATDATA.height, 1.0, 0.0, 1.0, 3.0,
        // 右上角
        FLATDATA.startX + FLATDATA.width, FLATDATA.startY, 1.0, 0.0, 1.0, 3.0,
    ]).current
    const bullet = useRef<Bullet>();
    const rect = useRef<Rect>();

    useEffect(() => {
        init();
        document.onkeydown = (e) => {
            if (e.code === 'ArrowLeft') {
                flatHelpSpeed.current *= 1.01;
                flatSpeed.current = -Math.abs(flatSpeed.current) - flatHelpSpeed.current
                flatX.current += flatSpeed.current
                flatBoundaryCheck();
            } else if (e.code === 'ArrowRight') {
                flatHelpSpeed.current *= 1.01;
                flatSpeed.current = Math.abs(flatSpeed.current) + flatHelpSpeed.current
                flatX.current += flatSpeed.current
                flatBoundaryCheck();
            }
        }
        document.onkeyup = () => {
            flatHelpSpeed.current = FLATDATA.initHelpSpeed
            flatSpeed.current = FLATDATA.initSpeed;
        }
        return () => {
            document.onkeydown = null;
        }
    }, [])

    /**
     * 平板的边界检测
     */
    const flatBoundaryCheck = () => {
        const minX = -1.0 - FLATDATA.startX;
        const maxX = 1.0 - FLATDATA.startX - FLATDATA.width;
        if (FLATDATA.startX + flatX.current <= minX) {
            flatX.current = minX
        } else if (flatX.current + FLATDATA.startX >= maxX) {
            flatX.current = maxX
        }
    }

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
        bullet.current = new Bullet({ gl })
        rect.current = new Rect(gl)
        setGl(gl);
        // 顶点着色器
        const VSHADER_SOURCE = `
            attribute vec2 a_Position;
            attribute vec3 a_Color;
            attribute float a_PointSize;
            uniform mat4 mat;  // 创建一个 uniform 变量，代表平移矩阵
            varying vec3 v_Color;
            void main() {
                gl_Position = mat * vec4(a_Position,0.0,1.0); // 设置坐标
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
        bufferIndex.current = gl.createBuffer()!;
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
    const applyBufferData = () => {
        if (!gl || !program) {
            return;
        }
        // BYTES_PER_ELEMENT属性代表了强类型数组中每个元素所占用的字节数
        const FSIZE = new Float32Array(flatDataArr).BYTES_PER_ELEMENT;
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId.current!);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatDataArr), gl.STATIC_DRAW);
        const a_Position = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0);
        gl.enableVertexAttribArray(a_Position);

        const a_PointSize = gl.getAttribLocation(program, 'a_PointSize');
        gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 5)
        gl.enableVertexAttribArray(a_PointSize)

        const a_Color = gl.getAttribLocation(program, 'a_Color');
        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
        gl.enableVertexAttribArray(a_Color)
        let Tx = flatX.current;    //x坐标的位置
        let Ty = 0.0;    //y坐标的位置
        let Tz = 0.0;    //z坐标的位置
        let Tw = 1.0;    //差值
        const mat = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            Tx, Ty, Tz, Tw,
        ]);
        const matLocation = gl!.getUniformLocation(program!, 'mat');
        gl!.uniformMatrix4fv(matLocation, false, mat);

        let indexArr = new Uint16Array([
            0, 1, 2,
            0, 2, 3,
        ]);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferIndex.current!);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArr, gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    }

    const render = () => {
        if (!gl || !program || !bufferId.current) {
            return;
        }
        // 指定清空<canvas>的颜色
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // 清空canvas
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program)
        applyBufferData();
        bullet.current!.draw({ flatX: FLATDATA.startX + flatX.current, flatEndX: FLATDATA.startX + flatX.current + FLATDATA.width, flatY: FLATDATA.startY, flatH: FLATDATA.height })
        rect.current!.draw({...bullet.current!.position});
        requestAnimationFrame(render)
    }

    return <canvas ref={canvasRef}></canvas>
}

export default Breakout