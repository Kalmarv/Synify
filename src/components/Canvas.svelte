<script>
  import { onMount } from 'svelte'
  import { songName, songArtist, songImage, songLink, albumProg } from '../stores.js'
  import {
    choose,
    getColors,
    defaultSettings,
    remove,
    params,
    uniforms,
    textFormatter,
    textSpacing,
  } from '../helpers.js'
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
    BackSide,
    ShaderMaterial,
  } from 'three'
  import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
  import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
  import { Pane } from 'tweakpane'
  import { skyVert } from '../shaders/skyVert'
  import { skyFrag } from '../shaders/skyFrag'

  Cache.enabled = true
  const clock = new Clock()
  let delta = 0
  let camera, scene, renderer, albumMesh, colors, raycaster, mouse, bgMesh
  // because the songName calls a function on update, basic check for if the scene is ready
  let initScene = 0

  const pane = new Pane({
    title: 'Parameters',
    expanded: false,
  })

  const tab = pane.addTab({
    pages: [{ title: 'Camera' }, { title: 'Album' }, { title: 'Shader' }],
  })

  tab.pages[0].addInput(params, 'cameraFOV', { label: 'Camera FOV', min: 0, max: 100 }).on('change', (ev) => {
    camera.fov = ev.value
    camera.updateProjectionMatrix()
  })
  tab.pages[1].addInput(params, 'albumScale', { label: 'Album Scale', min: 0, max: 10 }).on('change', (ev) => {
    albumMesh.scale.x = ev.value
    albumMesh.scale.y = ev.value
  })
  tab.pages[2].addInput(params, 'lacunarity', { label: 'Lacunarity', min: 0, max: 5 }).on('change', (ev) => {
    uniforms.lacunarity.value = ev.value
  })
  tab.pages[2].addInput(params, 'gain', { label: 'Gain', min: 0, max: 1 }).on('change', (ev) => {
    uniforms.gain.value = ev.value
  })

  const saveSettings = pane.addButton({ title: 'Save Settings' })
  const resetSettings = pane.addButton({ title: 'Reset Settings' })

  saveSettings.on('click', () => {
    let preset = pane.exportPreset()
    window.localStorage.setItem('settings', JSON.stringify(preset))
  })

  resetSettings.on('click', () => {
    window.localStorage.clear()
    pane.importPreset(defaultSettings)
  })

  const createText = (text, scene, name, color, { x, y, z }) => {
    const loader = new FontLoader()
    loader.load('./fonts/Manrope_Regular.json', function (font) {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.2,
        height: 0.05,
        curveSegments: 12,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelEnabled: true,
      })

      let textMaterial = new MeshBasicMaterial({ color: color })

      const textMesh = new Mesh(textGeometry, textMaterial)

      textMesh.position.set(x, y, z)
      textMesh.rotation.set(0, -44.95, 0)
      textMesh.name = name
      scene.add(textMesh)
    })
  }

  const createAlbum = (scene) => {
    const geometry = new BoxGeometry()
    let texture = new TextureLoader().load($songImage)
    const material = new MeshBasicMaterial({ map: texture })
    albumMesh = new Mesh(geometry, material)
    albumMesh.position.set(0, 0, -2)
    albumMesh.scale.set(params.albumScale, params.albumScale, 0.1)
    albumMesh.name = 'Album'
    scene.add(albumMesh)
  }

  const init = () => {
    raycaster = new Raycaster()
    mouse = new Vector2()
    camera = new PerspectiveCamera(params.cameraFOV, window.innerWidth / window.innerHeight, 0.01, 10000)

    camera.position.set(-6.539036451399613, 0.11775855411335079, 4.115906106711372)
    camera.rotation.set(0, -1, 0)

    scene = new Scene()
    scene.background = new Color('#000000')

    renderer = new WebGLRenderer({ antialias: true, precision: 'mediump' })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    window.addEventListener('resize', onWindowResize)
    new OrbitControls(camera, renderer.domElement)
    uniforms.u_resolution.value.x = renderer.domElement.width
    uniforms.u_resolution.value.y = renderer.domElement.height

    initScene = 1
  }

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    uniforms.u_resolution.value.x = renderer.domElement.width
    uniforms.u_resolution.value.y = renderer.domElement.height
  }

  const onMouseDown = (e) => {
    e.preventDefault()
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    let intersects = raycaster.intersectObject(scene, true)

    if (intersects.length > 0) {
      let object = intersects[0].object
      if (object.name == 'Album') {
        window.open($songLink, '_blank')
      }
    }
  }

  const onHover = (e) => {
    e.preventDefault()
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    let intersects = raycaster.intersectObject(scene, true)

    if (intersects.length > 1) {
      let object = intersects[0].object

      if (object.name == 'Album') {
        document.getElementById('body').style.cursor = 'pointer'
        albumProg.set(1.15)
      }
    } else {
      document.getElementById('body').style.cursor = 'default'
      albumProg.set(1)
    }
  }

  const animate = () => {
    requestAnimationFrame(animate)
    renderer.domElement.addEventListener('mousedown', onMouseDown, false)
    renderer.domElement.addEventListener('mousemove', onHover, false)

    clock.getDelta()
    delta = clock.elapsedTime
    uniforms.u_time.value = delta
    albumMesh.rotation.x = Math.cos(delta) / 40
    albumMesh.rotation.y = Math.PI * -0.1 + Math.sin(delta) / 30
    renderer.render(scene, camera)
  }

  const tweening = () => {
    if (initScene) {
      albumMesh.scale.set(params.albumScale * $albumProg, params.albumScale * $albumProg, 0.1 * $albumProg)
    }
  }

  const update = async () => {
    if (!initScene) return

    colors = choose(await getColors($songImage), 2)
    let shaderColors = choose(await getColors($songImage), 4)

    uniforms.col1.value = new Color(shaderColors[0])
    uniforms.col2.value = new Color(shaderColors[1])
    uniforms.col3.value = new Color(shaderColors[2])
    uniforms.col4.value = new Color(shaderColors[3])

    if (albumMesh?.material?.map) {
      albumMesh.material.map = new TextureLoader().load($songImage)
    }
    remove(scene, 'Artist')
    remove(scene, 'Title')

    const textInfo = textSpacing($songName, $songArtist, 30)

    createText(textInfo.nameFormatted, scene, 'Title', colors[0], {
      x: 1.5,
      y: (textInfo.totalLines + textInfo.totalLines / 2) * 0.1,
      z: -1,
    })
    createText(textInfo.artistFormatted, scene, 'Artist', colors[1], {
      x: 1.5,
      y: -(textInfo.nameLines * 2) * 0.2 + (textInfo.totalLines + textInfo.totalLines / 2) * 0.1,
      z: -1,
    })
  }

  const createBg = () => {
    let bgMaterial = new ShaderMaterial({
      uniforms: uniforms,
      vertexShader: skyVert,
      fragmentShader: skyFrag,
      side: BackSide,
    })

    bgMesh = new Mesh(new BoxGeometry(20, 20, 20), bgMaterial)
    scene.add(bgMesh)
  }

  // Update scene on song name, or artist change
  $: $songName, $songArtist, update()
  $: $albumProg, tweening()

  onMount(async () => {
    init()

    colors = choose(await getColors($songImage), 2)
    let shaderColors = choose(await getColors($songImage), 4)

    uniforms.col1.value = new Color(shaderColors[0])
    uniforms.col2.value = new Color(shaderColors[1])
    uniforms.col3.value = new Color(shaderColors[2])
    uniforms.col4.value = new Color(shaderColors[3])

    // Shader uniforms do not seem to set from params, so we set them manually on the first render
    uniforms.lacunarity.value = params.lacunarity
    uniforms.gain.value = params.gain

    createAlbum(scene)

    const textInfo = textSpacing($songName, $songArtist, 30)

    // Math for placement breaks down at about 9+ lines
    // IDK why, but it's good enough for now I think
    createText(textInfo.nameFormatted, scene, 'Title', colors[0], {
      x: 1.5,
      y: (textInfo.totalLines + textInfo.totalLines / 2) * 0.1,
      z: -1,
    })
    createText(textInfo.artistFormatted, scene, 'Artist', colors[1], {
      x: 1.5,
      y: -(textInfo.nameLines * 2) * 0.2 + (textInfo.totalLines + textInfo.totalLines / 2) * 0.1,
      z: -1,
    })
    createBg()

    animate()
  })
</script>
