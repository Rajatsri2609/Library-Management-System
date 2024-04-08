export default {
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <router-link v-if="isLoggedIn" :to="isLibrarian ? '/librarian-dashboard' : '/user-dashboard'" class="navbar-brand">Library</router-link>
      <router-link v-else to="/login" class="navbar-brand">Library</router-link>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">
          <button v-if="isLoggedIn" class="nav-link" @click="logout">Logout</button>
        </div>
      </div>
    </nav>
  `,
  data() {
    return {
      isLoggedIn: localStorage.getItem('auth-token') !== null,
      isLibrarian: localStorage.getItem('is_Librarian') === 'true',
    };
  },
  methods: {
    logout() {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('is_Librarian');
      this.$router.push({ path: '/login' });
    },
  },
};
