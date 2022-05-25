import { initShaders, rand, normalization, Vector2d } from '@/utils/common'

class Rect {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    bufferId: WebGLBuffer;
    bufferIndex: WebGLBuffer;
    rectData: number[][]
    arrData: number[][]
    arrIndex: number[][]

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
        this.program = this.initProgram()
        this.bufferId = this.gl.createBuffer()!
        this.bufferIndex = this.gl.createBuffer()!
        this.rectData = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 0, 0],
            // [0, 0, 1, 1, 1, 1, 0, 0],
            // [0, 1, 1, 1, 1, 1, 1, 0],
            // [1, 1, 1, 1, 1, 1, 1, 1],
        ]
        const [arr, arrIndex] = this.createBufferData();
        this.arrData = arr;
        this.arrIndex = arrIndex;
    }

    initProgram() {
        // 顶点着色器
        const VSHADER_SOURCE = `
            attribute vec2 a_Position;
            attribute vec3 a_Color;
            varying vec3 v_Color;
            void main() {
                gl_Position = vec4(a_Position,0.0,1.0); // 设置坐标
                gl_PointSize = 1.0; // 设置尺寸
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
        return initShaders(this.gl, VSHADER_SOURCE, FSHADER_SOURCE)
    }

    createBufferData(): number[][][] {
        let arr: number[][] = [];
        let arrIndex: number[][] = [];
        let itemWidth = 2 / 8;
        let itemHeight = 0.06;
        let i = 0;
        this.rectData.forEach((item, index) => {
            item.forEach((subItem, subIndex) => {
                if (subItem) {
                    arrIndex.push([
                        i * 4, i * 4 + 1, i * 4 + 2,
                        i * 4, i * 4 + 2, i * 4 + 3
                    ])
                    let colorRgbArr = [rand(0, 1), rand(0, 1), rand(0, 1)]
                    arr.push([
                        subIndex * itemWidth - 1, 0.8 - index * itemHeight, ...colorRgbArr,
                        subIndex * itemWidth - 1, 0.8 - (index + 1) * itemHeight, ...colorRgbArr,
                        (subIndex + 1) * itemWidth - 1, 0.8 - (index + 1) * itemHeight, ...colorRgbArr,
                        (subIndex + 1) * itemWidth - 1, 0.8 - index * itemHeight, ...colorRgbArr,
                    ])
                    i++
                }
            })
        })
        return [arr, arrIndex];
    }

    draw({ x: bulletX, y: bulletY }: { x: number; y: number; }) {
        this.gl.useProgram(this.program)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferId)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.arrData.flat()), this.gl.STATIC_DRAW)

        const FSIZE = new Float32Array(this.arrData.flat()).BYTES_PER_ELEMENT
        const a_Position = this.gl.getAttribLocation(this.program, 'a_Position')
        this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, FSIZE * 5, 0)
        this.gl.enableVertexAttribArray(a_Position)

        const a_Color = this.gl.getAttribLocation(this.program, "a_Color");
        this.gl.vertexAttribPointer(a_Color, 3, this.gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
        this.gl.enableVertexAttribArray(a_Color);
        let indexArr: number[] = []
        this.arrIndex.forEach((item, index) => {
            if (!item.length) {
                return;
            }
            const leftTop = [this.arrData[index][0], this.arrData[index][1]]
            const leftBottom = [this.arrData[index][5], this.arrData[index][6]]
            const rightBottom = [this.arrData[index][10], this.arrData[index][11]]
            const rightTop = [this.arrData[index][15], this.arrData[index][16]]
            const p1p2 = new Vector2d(leftBottom[0] - leftTop[0], leftBottom[1] - leftTop[1])
            const p1p0 = new Vector2d(bulletX - leftTop[0], bulletY - leftTop[1])
            const p3p4 = new Vector2d(rightTop[0] - rightBottom[0], rightTop[1] - rightBottom[1])
            const p3p0 = new Vector2d(bulletX - rightBottom[0], bulletY - rightBottom[1])
            const p2p3 = new Vector2d(rightBottom[0] - leftBottom[0], rightBottom[1] - leftBottom[1])
            const p2p0 = new Vector2d(bulletX - leftBottom[0], bulletY - leftBottom[1])
            const p4p1 = new Vector2d(leftTop[0] - rightTop[0], leftTop[1] - rightTop[1])
            const p4p0 = new Vector2d(bulletX - rightTop[0], bulletY - rightTop[1])

            if (p1p2.cross(p1p0) * p3p4.cross(p3p0) >= 0 && p2p3.cross(p2p0) * p4p1.cross(p4p0) >= 0) {
                console.log(bulletX, bulletY)
                indexArr.push(index)
                // this.arrData[0]=[]
                // this.arrIndex[0] = []
                return;
            }
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.bufferIndex);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(item), this.gl.STATIC_DRAW);
            this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0)
        })
        indexArr.forEach((item) => {
            this.arrData[item] = []
            this.arrIndex[item] = []
        })
    }
}

export default Rect