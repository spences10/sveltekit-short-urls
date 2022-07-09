<script lang="ts" context="module">
  export const load = async ({ url: { pathname } }) => {
    if (pathname === '/') {
      return {
        status: 302,
        redirect: 'https://scottspence.com',
      }
    }
  }
</script>
