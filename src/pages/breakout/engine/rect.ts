import { initShaders, rand, normalization } from '@/utils/common'

interface RectProps {
    gl: WebGLRenderingContext
}
class Rect {

    gl: WebGLRenderingContext;
    program: WebGLProgram;
    dataArr: number[];
    bufferId: WebGLBuffer;
    vx: number;
    vy: number;
    position: {
        x: number;
        y: number;
    }
    isMove: boolean;

    constructor({ gl }: RectProps) {
        this.gl = gl;
        this.program = this.initProgram();
        this.bufferId = this.gl.createBuffer()!;

        this.vx = 0;
        this.vy = 0;
        this.position = {
            x: 0.0,
            y: 0.0
        }
        this.dataArr = [this.position.x, this.position.y]
        this.isMove = false;
        this.init();
    }

    init() {
        this.applyBufferData();
    }

    initProgram() {
        // 顶点着色器
        const VSHADER_SOURCE = `
            attribute vec2 a_Position;
            void main() {
                gl_Position = vec4(a_Position,0.0,1.0); // 设置坐标
                gl_PointSize = 500.0; // 设置尺寸
            } 
        `;
        // 片元着色器
        const FSHADER_SOURCE = `
            void main () {
                gl_FragColor = vec4(0.0,1.0,1.0,1.0); // 设置颜色
            }
        `;
        return initShaders(this.gl, VSHADER_SOURCE, FSHADER_SOURCE)
    }

    applyBufferData() {
        // BYTES_PER_ELEMENT属性代表了强类型数组中每个元素所占用的字节数
        const FSIZE = new Float32Array(this.dataArr).BYTES_PER_ELEMENT;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferId);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.dataArr), this.gl.STATIC_DRAW);
        const a_Position = this.gl.getAttribLocation(this.program, "a_Position");
        this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, FSIZE * 2, 0);
        this.gl.enableVertexAttribArray(a_Position);

        const { x, y } = this.position;
        let Tx = x;    //x坐标的位置
        let Ty = y;    //y坐标的位置
        let Tz = 0.0;    //z坐标的位置
        let Tw = 1.0;    //差值
        const mat = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            Tx, Ty, Tz, Tw,
        ]);
        // const matLocation = this.gl!.getUniformLocation(this.program, 'mat');
        // this.gl!.uniformMatrix4fv(matLocation, false, mat);
    }

    draw() {
        this.gl.drawArrays(this.gl.POINTS, 0, 1)
    }

}

export default Rect