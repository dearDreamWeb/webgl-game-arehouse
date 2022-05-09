import React, { useRef, useEffect, useState, useCallback } from 'react'
import styles from './app.module.less'
import { useNavigate } from 'react-router-dom'

import {
  Scene, PerspectiveCamera, WebGLRenderer, Mesh, Clock,
  AnimationMixer, ImageUtils, SpotLight,
  MeshBasicMaterial, MeshLambertMaterial,
  BufferAttribute, DoubleSide,
  DirectionalLight,
  AmbientLight,
  PlaneGeometry,
  Vector3,
  Raycaster,
  Texture,
  PointLight,
  GridHelper,
  AxesHelper,
  Object3D,
  MeshPhongMaterial,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  TextureLoader,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


function App() {
  const navigate = useNavigate();
  const body = useRef<HTMLDivElement>(null)
  const scene = useRef<Scene>(new Scene()).current;
  const camera = useRef<PerspectiveCamera>(new PerspectiveCamera()).current;
  const render = useRef(new WebGLRenderer({ antialias: true })).current;
  const lights = useRef<any[]>([]).current;
  const raf = useRef<number>();
  const clock = useRef<Clock>(new Clock())
  const mixer = useRef<any>();
  const audioRef = useRef<any>();
  const meshes = useRef<any[]>([]).current;
  const snowClass = useRef<any[]>([]).current;
  const tank = useRef<Object3D>(new Object3D()).current;
  const turretPivot = useRef<Object3D>(new Object3D()).current;
  let bodyMesh = useRef<Mesh>().current;
  let wall = useRef<Mesh>().current
  const mousePosition = useRef({ x: 0, y: 0, z: 0 })

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

    // if (body.current) {
    //   body.current.onmousemove = null;
    //   body.current.onmousemove = (e) => {
    //     const { x, y, z } = getMousePosition(e)
    //     const targetPosition2 = new Vector3(-x, -y, -z)
    //     console.log(targetPosition2);
    //     // 获取目标全局坐标
    //     // targetMesh.getWorldPosition(targetPosition2)
    //     // 炮台瞄准目标
    //     turretPivot!.lookAt(targetPosition2)

    //     mousePosition.current = { x, y, z }
    //   }
    // }
    // return () => {
    //   if (!body.current) {
    //     return;
    //   }
    //   body.current.onmousemove = null;
    // }
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
    const controls = new OrbitControls(camera, render.domElement);
    controls.enableDamping = true
    controls.dampingFactor = 0.25
    controls.rotateSpeed = 0.35
  }

  /**
   * 初始化坦克
   */
  const initTank = () => {
    scene.add(tank);
    tank.position.x = -25;
    tank.position.z = 25;
    tank.rotation.y = -Math.PI / 3
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
    const turretRadius = 0.5
    const turretHeight = 10
    const turretRadialSegments = 64;
    const turretGeometry = new CylinderGeometry(
      turretRadius, // 圆柱顶部圆的半径
      turretRadius, // 圆柱底部圆的半径
      turretHeight, // 长度
      turretRadialSegments, // X轴分成多少段
      turretRadialSegments // y轴分成多少段
    )
    const turretMaterial = new MeshPhongMaterial({ color: 0x888888 })
    const turretMesh = new Mesh(turretGeometry, turretMaterial)
    turretPivot.add(turretMesh)
    turretMesh.position.y = 3
    turretMesh.position.z = -5
    turretMesh.rotation.z = Math.PI / 2
    turretMesh.rotation.y = Math.PI / 2
    bodyMesh.add(turretPivot)
  }


  /**
   * 初始化墙
   */
  const initWall = () => {
    const wallW = 60;
    const wallH = 50;
    const wallD = 10;
    const geometry = new BoxGeometry(wallW, wallH, wallD);
    const textureLoader = new TextureLoader();
    textureLoader.load('/images/stone.png', (texture) => {
      const material = new MeshLambertMaterial({
        // color: 0x0000ff, // 设置颜色纹理贴图：Texture对象作为材质map属性的属性值 
        map: texture,//设置颜色贴图属性值
        side: DoubleSide
      }); //材质对象Material 
      let mesh = new Mesh(geometry, material); //网格模型对象Mesh 
      scene.add(mesh)
      mesh.position.x = 35
      mesh.position.y = wallH / 2
      mesh.position.z = -15
      mesh.rotation.y = -Math.PI / 3;
    })
  }

  /**
   * 获取鼠标的3d坐标
   */
  const getMousePosition = (event: MouseEvent) => {
    event.preventDefault();
    let vector = new Vector3();//三维坐标对象
    vector.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      - (event.clientY / window.innerHeight) * 2 + 1,
      0.5);
    vector.unproject(camera);
    let raycaster = new Raycaster(camera.position, vector.sub(camera.position).normalize());
    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      let selected = intersects[0];//取第一个物体
      return { x: selected.point.x, y: selected.point.y, z: selected.point.z }
    }
    return { x: 0, y: 0, z: 0 }
  }

  /**
   * 初始化
   */
  useEffect(() => {
    body.current!.append(render.domElement);
    init();
    initControls();
    initTank();
    initWall();
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
