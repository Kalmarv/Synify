<script>
  import { onMount } from "svelte";
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
  } from "three";
  import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
  import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import extractColors from "extract-colors";
  import { Pane } from "tweakpane";

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

  const clock = new Clock();
  let delta = 0;
  let camera, scene, renderer;
  let albumMesh;
  let colors;

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

      scene.add(textMesh);
      textMesh.position.set(x, y, z);
      textMesh.rotation.set(0, -45, 0);
      textMesh.name = name;
    });
  };

  const createAlbum = (scene) => {
    const geometry = new BoxGeometry();
    let texture = new TextureLoader().load($songImage);
    const material = new MeshBasicMaterial({ map: texture });
    albumMesh = new Mesh(geometry, material);
    albumMesh.position.set(0, 0, -2);
    albumMesh.scale.set(
      getSetting("albumScale") || 2,
      getSetting("albumScale") || 2,
      0.1
    );
    scene.add(albumMesh);
  };

  const init = () => {
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
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    requestAnimationFrame(animate);

    clock.getDelta();
    delta = clock.elapsedTime;
    albumMesh.rotation.x = Math.cos(delta) / 40;
    albumMesh.rotation.y = Math.sin(delta) / 30;
    renderer.render(scene, camera);
  };

  const remove = (name) => {
    const object = scene.getObjectByProperty("name", name);

    object.geometry.dispose();
    object.material.dispose();
    scene.remove(object);
  };

  const getColors = async (imageURL) => {
    const options = {
      crossOrigin: "Anonymous",
    };

    const colorRes = extractColors(imageURL, options);

    return await colorRes;
  };

  onMount(async () => {
    init();

    colors = await getColors($songImage);
    // scene.background.set(colors[3].hex);

    createAlbum(scene);
    createText($songName, scene, "Title", colors[0].hex, {
      x: 1.5,
      y: 0.5,
      z: -1,
    });
    createText($songArtist, scene, "Artist", colors[1].hex, {
      x: 1.5,
      y: -0.5,
      z: -1,
    });

    animate();
    setInterval(async () => {
      if (albumMesh.material.map.source.data.currentSrc !== $songImage) {
        colors = await getColors($songImage);
        albumMesh.material.map = new TextureLoader().load($songImage);
        remove("Title");
        remove("Artist");
        createText($songName, scene, "Title", colors[0].hex, {
          x: 1.5,
          y: 0.5,
          z: -1,
        });
        createText($songArtist, scene, "Artist", colors[1].hex, {
          x: 1.5,
          y: -0.5,
          z: -1,
        });
      }
    }, 1000);
  });
</script>
