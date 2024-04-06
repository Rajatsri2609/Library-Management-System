import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/register.js'
const routes = [
    { path: '/', component: Home},
    { path: '/login', component: Login},
    { path: '/register', component: Register }
    // { path: '/users', component: Users },
    // { path: '/create-resource', component: SudyResourceForm },
  ]
  
  export default new VueRouter({
    routes,
  })