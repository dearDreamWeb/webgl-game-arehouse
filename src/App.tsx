import React, { useRef, useEffect, useCallback } from 'react'
import styles from './app.module.less'
import { useNavigate } from 'react-router-dom'
import {
  Scene, PerspectiveCamera, WebGLRenderer, Mesh, Clock, AnimationMixer, ImageUtils,
  SpotLight, MeshBasicMaterial, MeshLambertMaterial, BufferAttribute, DoubleSide,
  DirectionalLight, AmbientLight, PlaneGeometry, Vector3, Vector2, Raycaster, Texture,
  PointLight, GridHelper, AxesHelper, Object3D, MeshPhongMaterial, BoxGeometry,
  CylinderGeometry, SphereGeometry, TextureLoader, QuadraticBezierCurve3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';


const linkData = [
  {
    path: '/particleEffects',
    text: '粒子特效'
  },
]

function App() {
  const navigate = useNavigate();
  const body = useRef<HTMLDivElement>(null)
  const scene = useRef<Scene>(new Scene()).current;
  const camera = useRef<PerspectiveCamera>(new PerspectiveCamera()).current;
  const render = useRef(new WebGLRenderer({ antialias: true })).current;
  const lights = useRef<any[]>([]).current;
  const raf = useRef<number>();
  const tank = useRef<Object3D>(new Object3D()).current;
  let controls = useRef<OrbitControls>().current;
  let turretPivot = useRef<Object3D>(new Object3D()).current;
  let bodyMesh = useRef<Mesh>().current;
  let bulletMesh = useRef<Mesh>().current;
  let animationInterval = useRef<number>().current;
  let raycaster = useRef<Raycaster>(new Raycaster()).current;
  let mouse = useRef<Vector3>(new Vector3()).current;
  let fontUuid = useRef<string[]>([]).current
  let bulletPointsIndex = useRef<number>(0).current
  let floorModelArr = useRef<Array<Mesh<TextGeometry, MeshLambertMaterial>>>([]).current;

  // 平行光
  const pointLight = useRef<PointLight>(new PointLight(0xffffff, 1, 100)).current;
  // 环境光
  const ambientLight = useRef<AmbientLight>(new AmbientLight('#ffffff', 1)).current;



  const init = useCallback(() => {
    render.setSize(body.current!.offsetWidth, body.current!.offsetHeight);
    render.shadowMap.enabled = true;
    camera.aspect = body.current!.offsetWidth / body.current!.offsetHeight;
    camera.fov = 45;
    camera.near = 1;
    camera.far = 1000;
    camera.position.set(-60, 20, 100);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    if (body.current) {
      body.current.onclick = null;
      body.current.onclick = (e) => onMouseHandle(e, 'click')
      body.current.onmousemove = null;
      body.current.onmousemove = (e) => onMouseHandle(e, 'move')

    }
    return () => {
      if (!body.current) {
        return;
      }
      body.current.onclick = null;
      body.current.onmousemove = null;
    }
  }, [render, body])

  /**
   * 创建灯光
   */
  const createLight = useCallback(() => {
    pointLight.visible = true;
    pointLight.position.set(10, 40, 0);
    scene.add(pointLight, ambientLight);
    lights.push(pointLight, ambientLight);
  }, [])

  const renderScene = useCallback(() => {
    render.render(scene, camera);
    raf.current = window.requestAnimationFrame(() => renderScene());
  }, [render])

  /**
   * 初始化控制器
   */
  const initControls = () => {
    // 创建参考线
    const gridHelper = new GridHelper(320, 32)
    scene.add(gridHelper)
    // 创建坐标轴
    const axisHelper = new AxesHelper(500);
    scene.add(axisHelper);
    // 创建控制器
    controls = new OrbitControls(camera, render.domElement);
    controls.enableDamping = true // 启用阻尼（惯性），这将给控制器带来重量感，如果该值被启用，必须在动画循环里调用.update()
    controls.dampingFactor = 0.25 // 阻尼惯性大小
    controls.rotateSpeed = 0.35
  }

  /**
   * 初始化坦克
   */
  const initTank = () => {
    scene.add(tank);
    tank.position.x = -25;
    tank.position.z = 25;
    // tank.rotation.y = -Math.PI / 3
    // 创建底盘
    const carWidth = 15
    const carHeight = 4
    const carLength = 10

    // 轮子参数
    const wheelRadius = 2.5
    const wheelThickness = 0.5
    const wheelSegments = 64

    // 几何体
    const bodyGeometry = new BoxGeometry(carWidth, carHeight, carLength)
    const bodyMaterial = new MeshPhongMaterial({ color: 0x6688aa })
    bodyMesh = new Mesh(bodyGeometry, bodyMaterial)
    bodyMesh.position.y = wheelRadius * 2
    tank.add(bodyMesh)


    // 圆柱体
    const wheelGeometry = new CylinderGeometry(
      wheelRadius, // 圆柱顶部圆的半径
      wheelRadius, // 圆柱底部圆的半径
      wheelThickness, // 厚度
      wheelSegments // X轴分成多少段
    )
    const wheelMaterial = new MeshPhongMaterial({ color: 0x888888 })
    // 根据底盘 定位轮胎位置
    const wheelPositions = [
      [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, carLength / 2 + wheelThickness],
      [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, -carLength / 2 - wheelThickness],
      [- wheelThickness / 2, -carHeight / 2, carLength / 2 + wheelThickness],
      [- wheelThickness / 2, -carHeight / 2, -carLength / 2 - wheelThickness],
      [carWidth / 2 - wheelThickness / 2, -carHeight / 2, carLength / 2 + wheelThickness],
      [carWidth / 2 - wheelThickness / 2, -carHeight / 2, -carLength / 2 - wheelThickness]
    ]
    wheelPositions.forEach((position) => {
      const mesh = new Mesh(wheelGeometry, wheelMaterial)
      mesh.position.set(position[0], position[1], position[2])
      mesh.rotation.z = Math.PI * 0.5
      mesh.rotation.y = Math.PI * 0.5
      bodyMesh!.add(mesh)
    })


    // 坦克头
    const domeRadius = 4
    const domeWidthSubdivisions = 64
    const domeHeightSubdivisions = 64
    const domePhiStart = 0
    const domePhiEnd = Math.PI * 2
    const domeThetaStart = 0
    const domeThetaEnd = Math.PI * 0.5
    const domeGeometry = new SphereGeometry(
      domeRadius,
      domeWidthSubdivisions,
      domeHeightSubdivisions,
      domePhiStart,
      domePhiEnd,
      domeThetaStart,
      domeThetaEnd
    )
    const domeMesh = new Mesh(domeGeometry, bodyMaterial)
    bodyMesh.add(domeMesh)
    domeMesh.position.y = 2

    // 炮干
    const turretWidth = 0.5
    const turretHeight = 0.5
    const turretLength = 10
    const turretGeometry = new BoxGeometry(turretWidth, turretHeight, turretLength)
    const turretMesh = new Mesh(turretGeometry, bodyMaterial)
    turretPivot = new Object3D()
    turretPivot.position.y = 5
    turretMesh.position.z = turretLength * 0.5
    turretPivot.rotation.y = Math.PI
    turretPivot.add(turretMesh)
    bodyMesh.add(turretPivot)

    document.onkeydown = (e) => {
      console.log(e.code);
      console.log(tank.rotation.y);
      if (e.code === 'ArrowUp') {
        if (tank.rotation.y % 0.5 === 0) {

        }
        console.log(Math.sin(Math.PI / 180 * tank.rotation.y));
        console.log(Math.cos(Math.PI / 180 * tank.rotation.y));
        tank.position.z += Math.sin(Math.PI / 180 * tank.rotation.y / 3)
        tank.position.x += Math.cos(Math.PI / 180 * tank.rotation.y / 3)
      } else if (e.code === 'ArrowDown') {
        tank.position.z -= Math.sin(Math.PI / 180 * tank.rotation.y / 3)
        tank.position.x -= Math.cos(Math.PI / 180 * tank.rotation.y / 3)
      } else if (e.code === 'ArrowLeft') {
        tank.rotation.y -= 0.1
        tank.rotation.y = Number(tank.rotation.y.toFixed(1))
      } else if (e.code === 'ArrowRight') {
        tank.rotation.y += 0.1
        tank.rotation.y = Number(tank.rotation.y.toFixed(1))
      }
    }
  }


  /**
   * 初始化墙
   */
  const initWall = () => {
    const wallW = 60;
    const wallH = 50;
    const wallD = 10;
    const geometry = new BoxGeometry(wallW, wallH, wallD);
    const textureLoader = new TextureLoader()
    textureLoader.load('https://cdn2.mihuiai.com/webglStone.png', (texture) => {
      const material = new MeshLambertMaterial({
        map: texture,//设置颜色贴图属性值
        side: DoubleSide,
      }); //材质对象Material 
      let mesh = new Mesh(geometry, material); //网格模型对象Mesh 
      scene.add(mesh)
      mesh.position.x = 35
      mesh.position.y = wallH / 2
      mesh.position.z = -15
      mesh.rotation.y = -Math.PI / 3;
    })

    // 加载文字
    const loader = new FontLoader();
    loader.load('https://cdn2.mihuiai.com/BiaoTiMinChoS_Regular.json', function (font) {
      let arr: Array<Mesh<TextGeometry, MeshLambertMaterial>> = [];
      linkData.forEach((item, index) => {
        const geometry = new TextGeometry(item.text, {
          font: font,
          size: 5,
          height: 0.1,
          bevelThickness: 1,
          bevelSegments: 5,
        });
        const fontMaterial = new MeshLambertMaterial({
          color: 0xffffff
        });
        const fontModel = new Mesh(geometry, fontMaterial);
        fontUuid = [...fontUuid, fontModel.uuid]
        fontModel.rotation.y = -Math.PI / 3;
        fontModel.position.x = 20
        fontModel.position.y = wallH - 10 * (index + 1)
        fontModel.position.z = -30
        scene.add(fontModel)
        arr.push(fontModel)
      })
      floorModelArr = arr
    });
  }

  /**
   * 初始化地板
   */
  const initFloor = () => {
    const geometry = new PlaneGeometry(600, 600);
    const textureLoader = new TextureLoader()
    textureLoader.load('https://cdn2.mihuiai.com/webglFloor.png', (texture) => {
      const material = new MeshLambertMaterial({
        map: texture,//设置颜色贴图属性值
        side: DoubleSide,
      }); //材质对象Material 
      let mesh = new Mesh(geometry, material); //网格模型对象Mesh 
      scene.add(mesh)
      mesh.rotation.x = -90 / 180 * Math.PI;
    })
  }


  /**
   * 鼠标
   * @param event 
   */
  function onMouseHandle(event: MouseEvent, type: 'click' | 'move') {

    //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
    raycaster.setFromCamera(mouse, camera);

    // 获取raycaster直线和所有模型相交的数组集合
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length) {
      const { x, y, z } = intersects[0].point;
      mouse = new Vector3(x, y, z)
      if (type === 'move') {
        console.log(123123);
        // 炮干指向鼠标
        turretPivot.lookAt(mouse)
        floorModelArr.forEach((item) => {
          item.material.color.set(0xffffff)
        })
        if (fontUuid.includes(intersects[0].object.uuid)) {
          (intersects[0].object as any).material.color.set(0xff0000)
          body.current!.style.cursor = 'pointer'
        } else {
          body.current!.style.cursor = 'auto'
        }
      } else if (type === 'click' && fontUuid.includes(intersects[0].object.uuid)) {
        // const pointStart = new Vector3(turretPivot.position.x, turretPivot.position.y + 8, turretPivot.position.z);
        // const pointEnd = new Vector3(mouse.x, mouse.y, mouse.z);
        // const pointControl = new Vector3((mouse.x - turretPivot.position.x) / 2, (mouse.y - turretPivot.position.y) / 2, (mouse.z - turretPivot.position.z) / 2)
        // // 创建三维二次贝塞尔曲线
        // const curve = new QuadraticBezierCurve3(
        //   pointStart,
        //   pointControl,
        //   pointEnd
        // );
        // bulletPointsIndex = 0;
        // const divisions = 30; // 曲线的分段数量
        // const points = curve.getPoints(divisions);
        // bulletPointsIndex = points.length;
        // bulletMesh && scene.remove(bulletMesh);
        // animationInterval && cancelAnimationFrame(animationInterval)
        // const geometry = new SphereGeometry(1, 32, 32);
        // const material = new MeshLambertMaterial({ color: 0xffff00, side: DoubleSide, });
        // bulletMesh = new Mesh(geometry, material);
        // scene.add(bulletMesh)
        // animation(points, 0)

        navigate(linkData[fontUuid.indexOf(intersects[0].object.uuid)].path)
      }
    }
  }

  /**
   * 移动
   * @param points 
   * @param index 
   * @returns 
   */
  const animation = (points: Vector3[], index: number) => {
    if (index >= points.length) {
      bulletMesh && scene.remove(bulletMesh);
      animationInterval && cancelAnimationFrame(animationInterval)
      return;
    }
    bulletMesh!.position.x = points[index].x;
    bulletMesh!.position.y = points[index].y;
    bulletMesh!.position.z = points[index].z;
    index++;
    animationInterval = window.requestAnimationFrame(() => animation(points, index))
  }

  /**
   * 初始化
   */
  useEffect(() => {
    body.current!.append(render.domElement);
    init();
    // initControls();
    initTank();
    initWall();
    initFloor();
    createLight();
    renderScene();
    return () => {
      cancelAnimationFrame(raf.current!);
      lights.forEach((item) => {
        scene.remove(item);
      })
      render.dispose();
    }
  }, [])

  useEffect(() => {
  }, [])
  return (
    <div className={styles.appBox}>
      <div className={styles.three_box} ref={body}></div>
    </div>
  )
}

export default App
