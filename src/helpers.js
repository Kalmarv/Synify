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

const params = {
  albumScale: getSetting('albumScale') || 2,
}

const remove = (scene, name) => {
  const textObject = scene.getObjectByProperty('name', name)
  textObject.geometry.dispose()
  textObject.material.dispose()
  scene.remove(textObject)
}

export { choose, getSetting, getColors, params, remove }
