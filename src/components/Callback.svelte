<script>
  import { code } from '../stores.js'

  const url = new URL(window.location)

  if (url.searchParams.get('code') || url.searchParams.get('error')) {
    code.set(url.searchParams.get('code'))
    window.history.pushState('object or string', 'Title', '/')
  }
</script>
