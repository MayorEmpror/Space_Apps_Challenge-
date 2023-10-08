/// import { ArrowHelper } from "three";
import Engine from "./js";
import EngineEnviornmentInstance from "./js/gd/Enviornment";
import { PhysicsFPSController } from "./js/3d/FirstPerson/PhysicsFPSController";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
class Eclipses extends Engine {
  async aforeBegin() {
    // this._camera.position.z += 100;
  }

  declare() {
    this.enablePostProc();
    this.enableShadows();
    this.configureShadowType(Engine.THREE.VSMShadowMap);
    // this._useOrbitControls();
    // this._useDebugUI();
    Engine.useNerdStatistics();
    this.Planets = {};
  }

  async addObjects() {
    const SolarSystem = new EngineEnviornmentInstance("Solar System");
    this.Earth;
    this.SolarSystem = SolarSystem;
    const __group = new Engine.THREE.Group();
    this.FinalSpeed = 0.01
    let MoonSpinConstant = this.FinalSpeed
    const CameraDefaultPosition = {
      x: 673.424329148119,
      y: 31.669350451073157,
      z: 1625.254797755093,
    };
    this.isExperiencingEclipse = false;
    this.isCameraSpecialState = false;
    const SolarEclipseCamera = new Engine.THREE.PerspectiveCamera(
      75,
      this._size.width / this._size.height,
      0.1,
      5000
    );

    SolarSystem.begin();
    SolarSystem.plugin("Earth", async () => {
      const __path = new URL("../static/realEarth.glb", import.meta.url).href;
      const Earth = (await SolarSystem.useGLBLoader(__path, false)).scene;

      Earth.traverse((object3d) => {
        if (object3d.isMesh && object3d.name.includes("atmos")) {
          object3d.material.alphaMap = object3d.material.map;
          object3d.material.transparent = true;

          // console.log("Ok");
        } else {
          object3d.castShadow = true;
          object3d.receiveShadow = true;
        }
      });
      Earth.castShadow = true;
      Earth.receiveShadow = true;

      this.Planets["Earth"] = Earth;
      this.Earth = Earth;
      __group.add(Earth);

      this._scene.add(__group);

      Engine.applyToRenderLoop(() => {
        __group.rotation.y += MoonSpinConstant;
        Earth.rotation.y += 0.01;

        __group.position.x =
          Math.sin(Engine._clock.getElapsedTime() * 0.0) * 2000;
        __group.position.z =
          Math.cos(Engine._clock.getElapsedTime() * 0.0) * 2000;

        Earth.traverse((obj) => {
          if (obj.material && this.isExperiencingEclipse) {
            obj.material.color = new Engine.Color("red");
          } else if (obj.isMesh) {
            obj.material.color = new Engine.Color("white");
          }
        });
      });
      const _directionalLight = new Engine.THREE.DirectionalLight("white", 1);
      this._scene.add(_directionalLight);
      _directionalLight.castShadow = true;

      _directionalLight.shadow.normalBias = -10;
      _directionalLight.shadow.mapSize.width = 1024;
      _directionalLight.shadow.mapSize.height = 1024;
      _directionalLight.position.x -= 290;
      Engine.applyToRenderLoop(() => {
        _directionalLight.position.x =
          -Math.sin(Engine._clock.getElapsedTime() * 0.01) * 100;
        _directionalLight.position.z =
          -Math.cos(Engine._clock.getElapsedTime() * 0.01) * 100;
        _directionalLight.target.position.copy(__group.position);
      });
      SolarSystem.createHelperUsingObject(_directionalLight, true);
    });

    SolarSystem.plugin("Moon", async () => {
      const __path = new URL("../static/the_moon/scene.gltf", import.meta.url)
        .href;
      const Moon = (await SolarSystem.useGLBLoader(__path, false)).scene;
      __group.add(Moon);
      // Moon.scale.x = 22.5;
      // Moon.scale.y = 22.5;
      // Moon.scale.z = 22.5;
      Moon.scale.setScalar(5);
      // this._camera.position.z = 1950.33;
      Moon.castShadow = true;
      Moon.receiveShadow = true;
      this.Planets["Moon"] = Moon;
      SolarSystem.writeToPlugStream("MoonModel", Moon);
      const rayCaster = new Engine.THREE.Raycaster(
        Engine.IntelligentVector(2480, 0, 0),
        new Engine.THREE.Vector3(-1.0, 0.0, 0.0)
      );
      let i = 1;
      Engine.applyToRenderLoop(() => {
        Moon.position.x = Math.sin(Engine._clock.getElapsedTime() * 0.1) * 100;
        Moon.position.z = Math.cos(Engine._clock.getElapsedTime() * 0.1) * 100;
        i += 0.001;
        // console.log(SolarSystem.readFromPlugStream("MoonModel"));
        if (rayCaster.intersectObject(Moon).length > 1) {
          this.isExperiencingEclipse = true;
          // console.log("Its Eclipse Time🕶️");
        } else {
          this.isExperiencingEclipse = false;
        }
      });
      // SolarSystem.plugin("SpaceShip", async () => {
      // SolarSystem.addAmbientLight("white", 0.1);
      const __path_ = new URL(
        "../static/spaceship_corridor.glb",
        import.meta.url
      ).href;
      const SpaceShipModel = (await SolarSystem.useGLBLoader(__path_, true))
        .scene;
      SpaceShipModel.scale.setScalar(20);
      SpaceShipModel.position.set(639, 0, 1746.2);
      const Screen = new Engine.THREE.Mesh(
        new Engine.THREE.PlaneGeometry(30, 20),
        new Engine.THREE.MeshStandardMaterial({
          opacity: 0.5,
          transparent: true,
          color: "#40E0D0",
          emissive: "#40E0D0",
          side: Engine.THREE.DoubleSide,
        })
      );
      Screen.position.set(
        CameraDefaultPosition.x + 100,
        CameraDefaultPosition.y,
        CameraDefaultPosition.z + 10
      );
      Screen.rotation.y += Math.PI * 0.5;
      // Screen.rotation.
      const Screen2 = Screen.clone();
      Screen2.position.z += 40;
      // Screen2.position.x += 17
      const Screen3 = Screen.clone();
      Screen3.position.z += 40;
      this._scene.add(Screen, Screen2, Screen3);
      const _plight = SolarSystem.addPointLight("white", 1000);
      _plight.position.x = 645.2;
      _plight.position.y = 41.2;
      _plight.position.z = 1668.1;
      SpaceShipModel.rotation.y = Math.PI * 0.5;

      // this.debugUI.add(Screen2.position, "x", -4000, 4000, 1).name("x S2");
      // this.debugUI.add(Screen3.position, "x", -4000, 4000, 1).name("x S3");
      // // this.debugUI.add( Screen4.position,'x',-4000,4000,1).name("x S4")

      // this.debugUI.add(Screen2.position, "z", -4000, 4000, 1).name("z S2");
      // this.debugUI.add(Screen3.position, "z", -4000, 4000, 1).name("z S3");
      // this.debugUI.add( Screen4.position,'z',-4000,4000,1).name("z S4")

      this._world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.81, 0),
      });
      const floor = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(200, 10, 250)),
        type: CANNON.BODY_TYPES.STATIC,
      });
      floor.position.y += 0.1;
      floor.position.set(
        SpaceShipModel.position.x,
        SpaceShipModel.position.y,
        SpaceShipModel.position.z
      );

      const wall1 = new CANNON.Body({
        type: CANNON.BODY_TYPES.STATIC,
      });

      wall1.addShape(
        new CANNON.Box(new CANNON.Vec3(100, 100, 1)),
        new CANNON.Vec3(0, 0, 30)
      );
      wall1.addShape(
        new CANNON.Box(new CANNON.Vec3(100, 100, 1)),
        new CANNON.Vec3(0, 0, -200)
      );
      wall1.addShape(
        new CANNON.Box(new CANNON.Vec3(1, 100, 200)),
        new CANNON.Vec3(-10, 0, -100)
      );
      wall1.addShape(
        new CANNON.Box(new CANNON.Vec3(1, 100, 200)),
        new CANNON.Vec3(30, 0, -100)
      );

      wall1.position.set(
        SpaceShipModel.position.x,
        SpaceShipModel.position.y,
        SpaceShipModel.position.z
      );

      this._world.broadphase = new CANNON.SAPBroadphase(this._world);
      this._world.addBody(floor);
      this._world.addBody(wall1);

      PhysicsFPSController.RADIUS = 10;
      PhysicsFPSController.DEFAULT_POSITION = new CANNON.Vec3(
        CameraDefaultPosition.x - 10,
        CameraDefaultPosition.y,
        CameraDefaultPosition.z
      );

      const Controls = new PhysicsFPSController(this._world);
      Controls.jumpVelocity = 30;
      Controls.CannonBody.linearDamping = 0.9;
      Engine.applyToRenderLoop(() => {
        this._world.step(1 / 60, 0.1, 3);
        Controls.cn.update(0.1);
      });
      document
        .querySelector(".Patrial_Solar_Eclpse")
        .addEventListener("click", (e) => {
          document.getElementById("Solar_Info_Partial").showModal();
          this.openModal = document.getElementById("Solar_Info_Partial")
          cleanupAction()
          console.log("Hello");
          MoonSpinConstant = 0.001
          Controls.cn.velocity = new CANNON.Vec3(0, 0, 0);
          document.querySelector("dialog").close();
          Controls.CannonBody.position.set(0, 0, 0);
          Controls.cn.pitchObject.remove(this._camera);
          this._camera.position.set(0, 0, 0);
          this._camera.position.z += 1950.33;
          Moon.scale.setScalar(22.5);
          this.isCameraSpecialState = true;
        });
      const light = new Engine.THREE.AmbientLight("red", 10);
      // this.debugUI.add(this, "FinalSpeed", 0, 1, 0.01)
      const cleanupAction = () => {
        if (this.isCameraSpecialState) {
          this.openModal.close()
          console.log("clear");
          MoonSpinConstant = this.FinalSpeed
          Controls.CannonBody.position.set(
            PhysicsFPSController.DEFAULT_POSITION.x,
            PhysicsFPSController.DEFAULT_POSITION.y,
            PhysicsFPSController.DEFAULT_POSITION.z
          );
          this._camera.position.set(0, 0, 0);
          this._camera.rotation.y = 0;

          Controls.cn.pitchObject.add(this._camera);
          Controls.cn.velocity = Controls.CannonBody.velocity;
          Moon.scale.setScalar(3);
          this.isCameraSpecialState = false;
          Moon.remove(light);
        }
      };
      document.querySelector("#tteclipse").addEventListener("click", () => {
        cleanupAction();
        document.getElementById("Solar_Info_Total").showModal();
        this.openModal = document.getElementById("Solar_Info_Total")

        MoonSpinConstant = 0.001
        Controls.cn.velocity = new CANNON.Vec3(0, 0, 0);
        document.querySelector("dialog").close();
        Controls.CannonBody.position.set(0, 0, 0);
        Controls.cn.pitchObject.remove(this._camera);
        this._camera.position.set(0, 0, 0);
        this._camera.position.z += 1950.33;
        Moon.scale.setScalar(25);
        this.isCameraSpecialState = true;
      });

      document.querySelector(".earth_domain").addEventListener("click", () => {
        cleanupAction();
        MoonSpinConstant = 0.001
        Controls.cn.velocity = new CANNON.Vec3(0, 0, 0);
        document.querySelector("dialog").close();
        Controls.CannonBody.position.set(0, 0, 0);
        Controls.cn.pitchObject.remove(this._camera);
        this._camera.position.set(0, 0, 0);
        this._camera.position.z += 1900.33;
        this._camera.rotation.y += Math.PI;

        Moon.scale.setScalar(3);
        this.isCameraSpecialState = true;
      });

      document.querySelector(".Lunar_Eclipse").addEventListener("click", () => {
        cleanupAction();
        document.getElementById("Lunar_Info").showModal();
        this.openModal = document.getElementById("Lunar_Info")

        MoonSpinConstant = 0.001
        Controls.cn.velocity = new CANNON.Vec3(0, 0, 0);
        document.querySelector("dialog").close();
        Controls.CannonBody.position.set(0, 0, 0);
        Controls.cn.pitchObject.remove(this._camera);
        this._camera.position.set(0, 0, 0);
        this._camera.position.z += 2049.84;
        this._camera.rotation.y += Math.PI;
        Moon.scale.setScalar(25);
        this.isCameraSpecialState = true;
        Moon.add(light);
      });

      document.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "b":
            cleanupAction();
            break;
        }
      });
    });

    SolarSystem.plugin("Sun", async () => {
      const __path = new URL("../static/sun/scene.gltf", import.meta.url).href;
      const Sun = (await SolarSystem.useGLBLoader(__path, false)).scene;
      this._scene.add(Sun);
      Sun.scale.x = 90.4;
      Sun.scale.y = 90.4;
      Sun.scale.z = 90.4;
      Sun.position.x = -162.8;
      this.Planets["Sun"] = Sun;
      let target;
      Sun.traverse((obj) => {
        if (obj.isMesh) {
          target = obj;
          obj.material.color = new Engine.THREE.Color("#FFFF00");
        }
      });
      const godraysEffect = new Engine.POSTPROCESSING.GodRaysEffect(
        this._camera,
        target,
        {
          resolutionScale: 0.9,
          density: 0.5,
          decay: 0.9,
          weight: 0.5,
          samples: 50,
        }
      );
      const bloomEffect = new Engine.POSTPROCESSING.BloomEffect();
      this.addPostProcEffect(godraysEffect, bloomEffect);
    });

    const _path_HDRI = new URL(
      "../static/inside_galaxy_skybox_hdri_360_panorama.glb",
      import.meta.url
    ).href;
    const HDRI = (await SolarSystem.useGLBLoader(_path_HDRI, true)).scene;
    HDRI.scale.x = 4000;
    HDRI.scale.y = 4000;
    HDRI.scale.z = 4000;
    SolarSystem.resolvePlugs();
  }

  addDebugUI() {}
}

new Eclipses().begin();
