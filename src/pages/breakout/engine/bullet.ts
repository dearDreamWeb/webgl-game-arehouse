import { initShaders, rand, normalization, Vector2d } from '@/utils/common'

interface BulletProps {
    gl: WebGLRenderingContext
}

interface ApplyBufferDataProps {
    flatX: number;
    flatEndX: number;
    flatY: number;
    flatH: number;
}

/**
 * 子弹
 */
class Bullet {
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
    flatData: ApplyBufferDataProps;

    constructor({ gl }: BulletProps) {
        this.gl = gl;
        this.program = this.initProgram();
        this.bufferId = this.gl.createBuffer()!;

        this.flatData = {
            flatX: 0,
            flatEndX: 0,
            flatY: 0,
            flatH: 0,
        }

        this.vx = 0.006;
        this.vy = -0.009;
        this.position = {
            x: 0.0,
            y: 0.0
        }
        this.dataArr = [this.position.x, this.position.y, 1.0, 1.0, 1.0]
        this.isMove = false;
    }

    initProgram() {
        // 顶点着色器
        const VSHADER_SOURCE = `
            attribute vec2 a_Position;
            attribute vec3 a_Color;
            varying vec3 v_Color;
            uniform mat4 mat;  // 创建一个 uniform 变量，代表平移矩阵
            void main() {
                gl_Position = mat * vec4(a_Position,0.0,1.0); // 设置坐标
                gl_PointSize = 8.0; // 设置尺寸
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

    applyBufferData() {
        this.gl.useProgram(this.program)
        // BYTES_PER_ELEMENT属性代表了强类型数组中每个元素所占用的字节数
        const FSIZE = new Float32Array(this.dataArr).BYTES_PER_ELEMENT;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferId);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.dataArr), this.gl.STATIC_DRAW);

        const a_Position = this.gl.getAttribLocation(this.program, "a_Position");
        this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, FSIZE * 5, 0);
        this.gl.enableVertexAttribArray(a_Position);

        const a_Color = this.gl.getAttribLocation(this.program, "a_Color");
        this.gl.vertexAttribPointer(a_Color, 3, this.gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
        this.gl.enableVertexAttribArray(a_Color);

        const { x, y } = this.position;

        this.beyondBoundary();

        this.position = {
            x: x + this.vx,
            y: y + this.vy
        }
        // console.log(this.position.y)
        let Tx = this.position.x;    //x坐标的位置
        let Ty = this.position.y;    //y坐标的位置
        let Tz = 0.0;    //z坐标的位置
        let Tw = 1.0;    //差值
        const mat = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            Tx, Ty, Tz, Tw,
        ]);
        const matLocation = this.gl!.getUniformLocation(this.program, 'mat');
        this.gl!.uniformMatrix4fv(matLocation, false, mat);
    }

    isBeyondBoundaryY() {
        const { y } = this.position
        return Math.abs(y) > 1;
    }

    beyondBoundary() {
        const bulletRadius = 8 / (window.innerWidth / 2)
        let { x, y } = this.position;
        const { flatX, flatEndX, flatY, flatH } = this.flatData;
        if (y < flatY) {
            return
        }

        if ((x + bulletRadius > flatX && x < flatEndX && y < 0 && y >= flatY && Number((Math.abs(y - flatY)).toFixed(2)) <= flatH) || y >= 1) {
            this.vy *= -1
        }

        if (Math.abs(x) >= 1) {
            this.vx *= -1
        }
    }

    // startX +flatX.current,startX + FLATDATA.width,-0.89,0.01
    draw({ flatX, flatEndX, flatY, flatH }: ApplyBufferDataProps) {
        this.flatData = { flatX, flatEndX, flatY, flatH }
        this.applyBufferData();
        if (this.isBeyondBoundaryY()) {
            return;
        }
        this.gl.drawArrays(this.gl.POINTS, 0, 1)
    }

}

export default Bullet