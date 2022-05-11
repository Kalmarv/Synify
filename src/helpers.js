import extractColors from 'extract-colors'

const choose = (arr, count) => {
  let pickedColors = []

  for (let i = 0; i < count; i++) {
    pickedColors.push(arr[i % arr.length].hex)
  }
  // return arr[Math.floor(Math.random() * arr.length)].hex;

  return pickedColors
}

const getSetting = (item) => {
  try {
    return JSON.parse(window.localStorage.getItem('settings'))[item]
  } catch {
    return null
  }
}

const getColors = async (imageURL) => {
  const options = {
    crossOrigin: 'Anonymous',
  }

  const colorRes = extractColors(imageURL, options)

  return await colorRes
}

const remove = (scene, name) => {
  const textObject = scene.getObjectByProperty('name', name)
  textObject.geometry.dispose()
  textObject.material.dispose()
  scene.remove(textObject)
}

const defaultSettings = {
  albumScale: 2,
  lacunarity: 1.95,
  gain: 0.52,
}

const params = {
  albumScale: getSetting('albumScale') || defaultSettings.albumScale,
  lacunarity: getSetting('lacunarity') || defaultSettings.lacunarity,
  gain: getSetting('gain') || defaultSettings.gain,
}

const uniforms = {
  u_time: {
    type: 'f',
    value: params.lacunarity,
  },
  lacunarity: {
    type: 'f',
    value: params.gain,
  },
  gain: {
    type: 'f',
    value: 0.52,
  },
  u_resolution: {
    type: 'v2',
    value: [0, 0, 0],
  },
  col1: {
    type: 'v3',
    value: [0, 0, 0],
  },
  col2: {
    type: 'v3',
    value: [0, 0, 0],
  },
  col3: {
    type: 'v3',
    value: [0, 0, 0],
  },
  col4: {
    type: 'v3',
    value: [0, 0, 0],
  },
}

export { choose, getSetting, getColors, remove, params, defaultSettings, uniforms }
