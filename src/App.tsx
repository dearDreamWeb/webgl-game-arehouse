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
  Texture,
  PointLight,
  GridHelper,
  AxesHelper,
  Object3D,
  MeshPhongMaterial,
  BoxGeometry,
  CylinderGeometry,
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
  const tank = useRef<Object3D>();
  const bodyMesh = useRef<Mesh>()

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
    camera.position.set(10, 10, 50);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [render, body])

  /**
   * 创建灯光
   */
  const createLight = useCallback(() => {
    // pointLight.castShadow = true;
    pointLight.visible = true;
    pointLight.position.set(10, 40, 0);
    // pointLight.shadow.mapSize.width = 100;
    // pointLight.shadow.mapSize.height = 100;
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
    tank.current = new Object3D();
    scene.add(tank.current);
    // 创建底盘
    const carWidth = 15
    const carHeight = 4
    const carLength = 10

    // 轮子参数
    const wheelRadius = 2.5
    const wheelThickness = 0.5
    const wheelSegments = 36

    // 几何体
    const bodyGeometry = new BoxGeometry(carWidth, carHeight, carLength)
    const bodyMaterial = new MeshPhongMaterial({ color: 0x6688aa })
    bodyMesh.current = new Mesh(bodyGeometry, bodyMaterial)
    bodyMesh.current.position.y = wheelRadius*2 - carHeight / 2 + wheelThickness
    tank.current.add(bodyMesh.current)


    // 圆柱体
    const wheelGeometry = new CylinderGeometry(
      wheelRadius, // 圆柱顶部圆的半径
      wheelRadius, // 圆柱底部圆的半径
      wheelThickness, // 高度
      wheelSegments // X轴分成多少段
    )
    const wheelMaterial = new MeshPhongMaterial({ color: 0x888888 })
    // 根据底盘 定位轮胎位置
    const wheelPositions = [
      [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, carLength / 2],
      [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, -carLength / 2],
      [- wheelThickness / 2, -carHeight / 2, carLength / 2],
      [- wheelThickness / 2, -carHeight / 2, -carLength / 2],
      [carWidth / 2 - wheelThickness / 2, -carHeight / 2, carLength / 2],
      [carWidth / 2 - wheelThickness / 2, -carHeight / 2, -carLength / 2]
    ]
    wheelPositions.forEach((position) => {
      const mesh = new Mesh(wheelGeometry, wheelMaterial)
      mesh.position.set(position[0], position[1], position[2])
      mesh.rotation.z = Math.PI * 0.5
      mesh.rotation.y = Math.PI * 0.5
      bodyMesh.current!.add(mesh)
    })
  }

  /**
   * 初始化
   */
  useEffect(() => {
    body.current!.append(render.domElement);
    init();
    initControls();
    initTank();
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
