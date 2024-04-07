import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/register.js'
import Userdashboard from './components/Userdashboard.js'
const routes = [
    { path: '/', component: Home},
    { path: '/login', component: Login,name:'Login'},
    { path: '/register', component: Register ,name:'Register'},
    { path: '/user-dashboard', component: Userdashboard, name: 'Userdashboard' }
    // { path: '/users', component: Users },
    // { path: '/create-resource', component: SudyResourceForm },
  ]
  
  export default new VueRouter({
    routes,
  })