<script>
  import { onMount } from 'svelte'
  import { songName, songArtist, songImage, songLink, albumProg } from '../stores.js'
  import { choose, getColors, defaultSettings, remove, params, uniforms, textSpacing, resetSite } from '../helpers.js'
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
    Vector3,
    BackSide,
    ShaderMaterial,
  } from 'three'
  import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
  import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
  import { Pane } from 'tweakpane'
  import skyFrag from '../shaders/sky.frag.glsl'
  import skyVert from '../shaders/sky.vert.glsl'
  import textFrag1 from '../shaders/text1.frag.glsl'
  import textFrag2 from '../shaders/text2.frag.glsl'
  import textVert from '../shaders/text.vert.glsl'

  Cache.enabled = true
  const clock = new Clock()
  let delta = 0
  let camera, scene, renderer, albumMesh, colors, raycaster, mouse, bgMesh, controls
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
  tab.pages[0].addInput(params, 'cameraPos', { hidden: true, x: {}, y: {}, z: {} }).on('change', (ev) => {
    camera.position.set(ev.value.x, ev.value.y, ev.value.z)
    camera.updateProjectionMatrix()
  })
  tab.pages[0].addInput(params, 'cameraQuat', { hidden: true, x: {}, y: {}, z: {}, w: {} }).on('change', (ev) => {
    camera.quaternion.set(ev.value.x, ev.value.y, ev.value.z, ev.value.w)
    camera.updateProjectionMatrix()
  })
  tab.pages[0].addInput(params, 'target', { hidden: true, x: {}, y: {}, z: {}, w: {} }).on('change', (ev) => {
    controls.target = new Vector3(ev.value.x, ev.value.y, ev.value.z)
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
  tab.pages[2].addInput(params, 'speed', { label: 'Speed', min: 0, max: 5 }).on('change', (ev) => {
    uniforms.speed_mult.value = ev.value
  })

  const saveSettings = pane.addButton({ title: 'Save Settings' })
  const resetSettings = pane.addButton({ title: 'Reset Settings' })
  const logout = pane.addButton({ title: 'Logout' })

  saveSettings.on('click', () => {
    let preset = pane.exportPreset()
    pane.refresh()
    window.localStorage.setItem('settings', JSON.stringify(preset))
  })

  resetSettings.on('click', () => {
    pane.refresh()
    window.localStorage.removeItem('settings')
    pane.importPreset(defaultSettings)
    controls.target = new Vector3(params.target.x, params.target.y, params.target.z)
    camera.updateProjectionMatrix()
  })

  logout.on('click', () => {
    resetSite()
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

      const textMaterial = new ShaderMaterial({
        uniforms: uniforms,
        vertexShader: textVert,
        fragmentShader: name === 'Title' ? textFrag1 : textFrag2,
      })

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

    const albumTextures = [
      new MeshBasicMaterial({ color: 0x000000 }),
      new MeshBasicMaterial({ color: 0x000000 }),
      new MeshBasicMaterial({ color: 0x000000 }),
      new MeshBasicMaterial({ color: 0x000000 }),
      new MeshBasicMaterial({ map: texture }),
      new MeshBasicMaterial({ color: 0x000000 }),
    ]

    albumMesh = new Mesh(geometry, albumTextures)
    albumMesh.position.set(0, 0, -2)
    albumMesh.scale.set(params.albumScale, params.albumScale, 0.1)
    albumMesh.name = 'Album'
    scene.add(albumMesh)
  }

  const init = () => {
    raycaster = new Raycaster()
    mouse = new Vector2()
    camera = new PerspectiveCamera(params.cameraFOV, window.innerWidth / window.innerHeight, 0.01, 10000)

    renderer = new WebGLRenderer({ antialias: true, precision: 'mediump' })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    camera.position.set(params.cameraPos.x, params.cameraPos.y, params.cameraPos.z)
    camera.quaternion.set(params.cameraQuat.x, params.cameraQuat.y, params.cameraQuat.z, params.cameraQuat.w)
    controls.target = new Vector3(params.target.x, params.target.y, params.target.z)

    scene = new Scene()
    scene.background = new Color('#000000')

    window.addEventListener('resize', onWindowResize)

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
    controls.update()
    requestAnimationFrame(animate)
    renderer.domElement.addEventListener('mousedown', onMouseDown, false)
    renderer.domElement.addEventListener('mousemove', onHover, false)

    clock.getDelta()
    delta = clock.elapsedTime
    uniforms.u_time.value = delta
    albumMesh.rotation.x = Math.cos(delta) / 40
    albumMesh.rotation.y = Math.PI * -0.1 + Math.sin(delta) / 30

    params.cameraPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
    params.cameraQuat = {
      x: camera.quaternion.x,
      y: camera.quaternion.y,
      z: camera.quaternion.z,
      w: camera.quaternion.w,
    }
    params.target = {
      x: controls.target.x,
      y: controls.target.y,
      z: controls.target.z,
    }

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

    // Front texture
    if (albumMesh?.material[4]?.map) {
      albumMesh.material[4].map = new TextureLoader().load($songImage)
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
    uniforms.speed_mult.value = params.speed

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
