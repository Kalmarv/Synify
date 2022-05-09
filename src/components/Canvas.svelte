<script>
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { songName, songArtist, songImage, songLink } from "../stores.js";
  import {
    PerspectiveCamera,
    Scene,
    BoxGeometry,
    TextureLoader,
    MeshBasicMaterial,
    Mesh,
    WebGLRenderer,
    Color,
    Clock,
    Cache,
    Raycaster,
    Vector2,
  } from "three";
  import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
  import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import extractColors from "extract-colors";
  import { Pane } from "tweakpane";

  const choose = (arr, count) => {
    let pickedColors = [];

    for (let i = 0; i < count; i++) {
      pickedColors.push(arr[i % arr.length].hex);
    }
    // return arr[Math.floor(Math.random() * arr.length)].hex;

    return pickedColors;
  };

  const getSetting = (item) => {
    try {
      return JSON.parse(window.localStorage.getItem("settings"))[item];
    } catch {
      return null;
    }
  };

  const pane = new Pane({
    title: "Parameters",
    expanded: false,
  });

  const params = {
    albumScale: getSetting("albumScale") || 2,
  };

  pane
    .addInput(params, "albumScale", {
      label: "Album Scale",
    })
    .on("change", (ev) => {
      albumMesh.scale.x = ev.value;
      albumMesh.scale.y = ev.value;
    });

  const tweakPaneButton = pane.addButton({
    title: "Save Settings",
  });

  tweakPaneButton.on("click", () => {
    let preset = pane.exportPreset();
    window.localStorage.setItem("settings", JSON.stringify(preset));
  });

  Cache.enabled = true;
  const clock = new Clock();
  let delta = 0;
  let camera, scene, renderer, albumMesh, colors, raycaster, mouse;
  // because the songName calls a function on update, basic check for if the scene is ready
  let initScene = 0;

  const createText = (text, scene, name, color, { x, y, z }) => {
    const loader = new FontLoader();
    loader.load("./fonts/Manrope_Regular.json", function (font) {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.25,
        height: 0.075,
        curveSegments: 12,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelEnabled: true,
      });

      let textMaterial = new MeshBasicMaterial({
        color: color,
      });

      const textMesh = new Mesh(textGeometry, textMaterial);

      textMesh.position.set(x, y, z);
      textMesh.rotation.set(0, -45, 0);
      textMesh.name = name;
      scene.add(textMesh);
    });
  };

  const createAlbum = (scene) => {
    const geometry = new BoxGeometry();
    let texture = new TextureLoader().load($songImage);
    const material = new MeshBasicMaterial({ map: texture });
    albumMesh = new Mesh(geometry, material);
    albumMesh.position.set(0, 0, -2);
    albumMesh.scale.set(params.albumScale, params.albumScale, 0.1);
    albumMesh.name = "Album";
    scene.add(albumMesh);
  };

  const init = () => {
    raycaster = new Raycaster();
    mouse = new Vector2();
    camera = new PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.01,
      10000
    );
    camera.position.set(-2.46, 0.2, 2.34);
    camera.rotation.set(-3.33, -27.5, -1.5);

    scene = new Scene();
    scene.background = new Color("#000000");

    renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener("resize", onWindowResize);
    new OrbitControls(camera, renderer.domElement);
    initScene = 1;
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const onMouseDown = (e) => {
    e.preventDefault();

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObject(scene, true);

    if (intersects.length > 0) {
      let object = intersects[0].object;

      if (object.name == "Album") {
        window.open($songLink, "_blank");
      }
    }
  };

  const progress = tweened(1, {
    duration: 150,
    cubicOut,
  });

  const onHover = (e) => {
    e.preventDefault();

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObject(scene, true);

    if (intersects.length > 0) {
      let object = intersects[0].object;

      if (object.name == "Album") {
        document.getElementById("body").style.cursor = "pointer";
        progress.set(1.15);
      }
    } else {
      document.getElementById("body").style.cursor = "default";
      progress.set(1);
    }
  };

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.domElement.addEventListener("mousedown", onMouseDown, false);
    renderer.domElement.addEventListener("mousemove", onHover, false);

    clock.getDelta();
    delta = clock.elapsedTime;
    albumMesh.rotation.x = Math.cos(delta) / 40;
    albumMesh.rotation.y = Math.sin(delta) / 30;
    renderer.render(scene, camera);

    albumMesh.scale.set(
      params.albumScale * $progress,
      params.albumScale * $progress,
      0.1 * $progress
    );
  };

  const remove = (name) => {
    const textObject = scene.getObjectByProperty("name", name);
    textObject.geometry.dispose();
    textObject.material.dispose();
    scene.remove(textObject);
  };

  const getColors = async (imageURL) => {
    const options = {
      crossOrigin: "Anonymous",
    };

    const colorRes = extractColors(imageURL, options);

    return await colorRes;
  };

  const update = async () => {
    if (initScene) {
      colors = choose(await getColors($songImage), 2);
      if (albumMesh?.material?.map) {
        albumMesh.material.map = new TextureLoader().load($songImage);
      }
      remove("Artist");
      remove("Title");
      createText($songName, scene, "Title", colors[0], {
        x: 1.5,
        y: 0.5,
        z: -1,
      });
      createText($songArtist, scene, "Artist", colors[1], {
        x: 1.5,
        y: -0.5,
        z: -1,
      });
    }
  };

  // Update scene on song name, or artist change
  $: $songName, $songArtist, update();

  onMount(async () => {
    init();

    colors = choose(await getColors($songImage), 2);

    createAlbum(scene);
    createText($songName, scene, "Title", colors[0], {
      x: 1.5,
      y: 0.5,
      z: -1,
    });
    createText($songArtist, scene, "Artist", colors[1], {
      x: 1.5,
      y: -0.5,
      z: -1,
    });

    animate();
  });
</script>
