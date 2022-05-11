# TODO

- Logout button
- UI component for errors
- Front page content and styling
- Setup domain with Vercel
- Update Favicon
- Create better album model
- Add lighting to scene
- Post-processing
- More shaders
- Tweakpane settings and organization
- https://open.spotify.com/track/1f7mS9pbnFLuKzOR34cpHk?si=5e529ef80d86456b breaks?
- Font wrapping? Something like this maybe
```ts
const formatText = (name, maxWidth) => {
  const splitName = name.split(' ')
  let tempText = ''
  let returnText = ''
    for (let i = 0; i < splitName.length; i++) {
      if (tempText.length >= maxWidth) {
        returnText += tempText + '\n'
        tempText = ''
      }
        tempText += (`${splitName[i]} `)
    }
  returnText += tempText
  return returnText.trim()
}
```
