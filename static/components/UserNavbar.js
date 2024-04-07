export default {
    template: `
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <router-link to="/" class="navbar-brand">Library</router-link>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav">
           <button class="nav-link" @click='logout' >Logout</button>
          </div>
        </div>
      </nav>
    `,
    data() {
        return {
          is_login: localStorage.getItem('auth-token'),
        }
      },
      methods: {
        logout() {
          localStorage.removeItem('auth-token')
          this.$router.push({ path: '/login' })
        },
      },
  };