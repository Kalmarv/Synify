<script>
  let imgSrc = './pictures/enterfullscreen.svg'
  const enterfullscreen = () => {
    const elem = document.documentElement
    imgSrc = './pictures/exitfullscreen.svg'
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen()
    }
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      imgSrc = './pictures/enterfullscreen.svg'
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      exitFullscreen()
    } else {
      enterfullscreen()
    }
  }
</script>

<img src={imgSrc} alt="" on:click={toggleFullscreen} />

<style>
  img {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    max-width: 2rem;
    opacity: 0.25;
    transition: 0.1s;
  }

  img:hover {
    opacity: 1;
    bottom: 0.9rem;
    right: 0.9rem;
    max-width: 2.2rem;
  }
</style>
