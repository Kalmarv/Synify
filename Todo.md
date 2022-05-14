# TODO

- Logout button
- UI component for errors
  - Show when needed
- Front page content and styling
- Setup domain with Vercel
- Update Favicon
- Create better album model
- Add lighting to scene
- Post-processing
- More shaders
- Some albums render no text
  - https://open.spotify.com/track/1f7mS9pbnFLuKzOR34cpHk?si=5e529ef80d86456b
  - B-Sides and Rarities
- Fix font wrapping at 9+ lines
- Fix removing and replacing fonts, very prone to breakage, especially on slow network connections
- When access token is expired, it just consoles an error and has to wait for a now playing function after 5 seconds to reset it,
  - If it's expired, refresh immediately
  - Probably put a limit on the and show an error to reset, so it doesn't get into an infinite loop hitting Spotify's API
