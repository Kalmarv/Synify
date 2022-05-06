<script>
  import { onMount } from "svelte";
  import { songName, songArtist, songImage, songLink } from "./stores.js";
  import {
    PerspectiveCamera,
    Scene,
    BoxGeometry,
    TextureLoader,
    MeshBasicMaterial,
    Mesh,
    WebGLRenderer,
    Color,
  } from "three";
  import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
  import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import extractColors from "extract-colors";

  let camera, scene, renderer;
  let albumMesh;
  let colors;

  const createText = (text, scene, name, color, { x, y, z }) => {
    const loader = new FontLoader();
    loader.load("./fonts/Manrope_Regular.json", function (font) {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 50,
        height: 10,
        curveSegments: 12,
        bevelThickness: 1,
        bevelSize: 1,
        bevelEnabled: true,
      });

      let textMaterial = new MeshBasicMaterial({
        color: color,
      });

      const textMesh = new Mesh(textGeometry, textMaterial);

      scene.add(textMesh);
      textMesh.position.set(x, y, z);
      textMesh.name = name;
    });
  };

  const createAlbum = (scene) => {
    const geometry = new BoxGeometry(200, 200, 200);
    let texture = new TextureLoader().load($songImage);
    const material = new MeshBasicMaterial({ map: texture });
    albumMesh = new Mesh(geometry, material);
    scene.add(albumMesh);
  };

  const init = () => {
    camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.z = 400;

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
    albumMesh.rotation.x += 0.005;
    albumMesh.rotation.y += 0.01;
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
      x: 200,
      y: 50,
      z: 0,
    });
    createText($songArtist, scene, "Artist", colors[1].hex, {
      x: 200,
      y: -50,
      z: 0,
    });

    animate();
    setInterval(async () => {
      if (albumMesh.material.map.source.data.currentSrc !== $songImage) {
        colors = await getColors($songImage);
        albumMesh.material.map = new TextureLoader().load($songImage);
        remove("Title");
        remove("Artist");
        createText($songName, scene, "Title", colors[0].hex, {
          x: 200,
          y: 50,
          z: 0,
        });
        createText($songArtist, scene, "Artist", colors[1].hex, {
          x: 200,
          y: -50,
          z: 0,
        });
      }
    }, 1000);
  });
</script>
