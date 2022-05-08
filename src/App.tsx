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
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';


interface CreateFloorProps {
  position: { x: number; y: number; z: number };
  rotateX?: number;
  rotateY?: number;
  width: number;
  height: number;
  textureImage: string;
}

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

  const [isLoadSuccess, setIsLoadSuccess] = useState<boolean>(false);

  // 平行光
  const pointLight = useRef<PointLight>(new PointLight(0xffffff, 1, 70)).current;
  // 环境光
  const ambientLight = useRef<AmbientLight>(new AmbientLight('#ffffff', 1)).current;



  const init = useCallback(() => {
    render.setSize(body.current!.offsetWidth, body.current!.offsetHeight);
    render.shadowMap.enabled = true;
    camera.aspect = body.current!.offsetWidth / body.current!.offsetHeight;
    camera.fov = 45;
    camera.near = 1;
    camera.far = 1000;
    camera.position.set(0, 130, 100);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [render, body])

  /**
   * 创建灯光
   */
  const createLight = useCallback(() => {
    // pointLight.castShadow = true;
    pointLight.visible = true;
    pointLight.position.set(0, 0, -40);
    // pointLight.shadow.mapSize.width = 100;
    // pointLight.shadow.mapSize.height = 100;
    scene.add(pointLight, ambientLight);
    lights.push(pointLight, ambientLight);
  }, [])

  const renderScene = useCallback(() => {
    render.render(scene, camera);

    const time = clock.current.getDelta();
    // if (mixer.current) {
    //     mixer.current.update(time);
    // }
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
   * 模型加载进度
   */
  const modelProgress = (progress: ProgressEvent<EventTarget>) => {
    // const { loaded, total } = progress;
    // const rate = (loaded / total * 100).toFixed(2);
    // if (Number(rate) >= 100) {
    //     // 播放音乐
    //     audioRef.current.play();
    //     setIsLoadSuccess(true);
    // }
  }

  /**
   * 加载模型
   */
  const loaderFbx = useCallback(() => {
    // let loader = new OBJLoader(); //obj加载器
    // let mtlLoader = new MTLLoader(); //材质文件加载器
    // mtlLoader.load('/obj/room.mtl', function (materials) {
    //   // 返回一个包含材质的对象MaterialCreator
    //   console.log(materials);
    //   materials.preload();
    //   //obj的模型会和MaterialCreator包含的材质对应起来
    //   loader.setMaterials(materials);
    //   const texture = new Texture()
    //   loader.load('/obj/room.obj', function (obj) {
    //     console.log(obj);
    //     scene.add(obj); //返回的组对象插入场景中
    //     // 加载后操作
    //     obj.scale.set(10, 10, 10); //缩放球体网格模型		
    //   })
    // })


    let loader = new FBXLoader(); //FBX加载器
      loader.load('/fbx/room.fbx', (obj) => {
          obj.position.set(0, 0, 0);
          obj.scale.set(0.1, 0.1, 0.1);
          scene.add(obj);
      }, modelProgress)
  }, [])

  /**
   * 随机数
   * @param min 
   * @param max 
   * @returns 
   */
  const randomRange = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  }

  /**
   * 初始化
   */
  useEffect(() => {
    body.current!.append(render.domElement);
    init();
    initControls();
    createLight();
    loaderFbx();
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
