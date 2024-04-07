import router from './routes.js'
import Navbar from './components/Navbar.js'
import UserNavbar from './components/UserNavbar.js';

router.beforeEach((to, from, next) => {
    if (to.name !== 'Login' && to.name !=='Register' && !localStorage.getItem('auth-token')) {
      next({ name: 'Login' });
    } else {
      next();
    }
  });
new Vue({
    el: '#app',
    router,
    components: {
        Navbar,
        UserNavbar
    },
    data() {
        return {
            isLoggedIn: false
        };
    },
    created() {
        // Check if the user is already logged in
        this.isLoggedIn = localStorage.getItem('auth-token') !== null;
    },
    watch: {
        $route() {
            // Update isLoggedIn based on the current route
            this.isLoggedIn = localStorage.getItem('auth-token') !== null;
        }
    },
    template: `
    <div>
        <component :is="isLoggedIn ? 'UserNavbar' : 'Navbar'" />
        <router-view />
    </div>
    `
});