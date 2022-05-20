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

const parseArtists = (artistJSON) => {
  let artists = []

  for (let i = 0; i < artistJSON.length; i++) {
    artists.push(artistJSON[i].name)
  }

  return artists.join(', ')
}

// Sometimes it will return 1 color, so we can lower the required
// distance while still maintaining the color variety of most albums
const getColors = async (imageURL) => {
  const colorRes = await extractColors(imageURL, { crossOrigin: 'Anonymous' })

  if (colorRes.length === 1) {
    const finalColors = await extractColors(imageURL, { crossOrigin: 'Anonymous', distance: 0 })
    return finalColors
  } else {
    return colorRes
  }
}

const remove = (scene, name) => {
  const textObject = scene.getObjectByProperty('name', name)
  textObject.geometry.dispose()
  textObject.material.dispose()
  scene.remove(textObject)
}

const defaultSettings = {
  cameraFOV: 26,
  albumScale: 2.5,
  lacunarity: 0.75,
  gain: 0.3,
  speed: 0.35,
  cameraPos: {
    x: -6.5390364514,
    y: 0.1177585541,
    z: 4.1159061067,
  },
  cameraQuat: {
    x: -0.0066703966012795326,
    y: -0.48336158583224653,
    z: -0.0036831836985306192,
    w: 0.8753876383115998,
  },
  target: {
    x: 0,
    y: 0,
    z: 0,
  },
}

const params = {
  cameraFOV: getSetting('cameraFOV') || defaultSettings.cameraFOV,
  albumScale: getSetting('albumScale') || defaultSettings.albumScale,
  target: getSetting('target') || defaultSettings.target,
  lacunarity: getSetting('lacunarity') || defaultSettings.lacunarity,
  gain: getSetting('gain') || defaultSettings.gain,
  speed: getSetting('speed') || defaultSettings.speed,
  cameraPos: getSetting('cameraPos') || defaultSettings.cameraPos,
  cameraQuat: getSetting('cameraQuat') || defaultSettings.cameraQuat,
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
  speed_mult: {
    type: 'f',
    value: 1.0,
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

const textFormatter = (text, maxLength) => {
  if (!text) return ''

  const splitText = text.split(' ')
  let tempText = ''
  let returnedText = ''

  for (let i = 0; i < splitText.length; i++) {
    if (tempText.length + splitText[i].length <= maxLength) {
      tempText += splitText[i] + ' '
    } else {
      returnedText += tempText + '\n'
      tempText = splitText[i] + ' '
    }
  }
  returnedText += tempText
  return returnedText.trim()
}

const textSpacing = (name, artist, maxLength) => {
  const nameFormatted = textFormatter(name, maxLength)
  const artistFormatted = textFormatter(artist, maxLength)
  const nameLines = nameFormatted.split('\n').length
  const artistLines = artistFormatted.split('\n').length
  const totalLines = nameLines + artistLines
  return { nameFormatted, artistFormatted, nameLines, artistLines, totalLines }
}

const resetSite = () => {
  window.localStorage.removeItem('code')
  window.localStorage.removeItem('authToken')
  window.localStorage.removeItem('code_verifier')
  window.localStorage.removeItem('refreshToken')
  window.location.reload()
}

export {
  choose,
  getSetting,
  getColors,
  remove,
  params,
  defaultSettings,
  uniforms,
  textFormatter,
  textSpacing,
  parseArtists,
  resetSite,
}
