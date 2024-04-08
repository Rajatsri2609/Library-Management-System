import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/register.js'
import Userdashboard from './components/Userdashboard.js'
import Librariandashboard from './components/Librariandashboard.js'
import AddSection from './components/AddSection.js'
import EditSection from './components/EditSection.js';
import DeleteConfirmation from './components/DeleteConfirmation.js'
import ShowEBooks from './components/ShowEBooks.js'
const routes = [
    { path: '/', component: Home},
    { path: '/login', component: Login,name:'Login'},
    { path: '/register', component: Register ,name:'Register'},
    { path: '/user-dashboard', component: Userdashboard, name: 'Userdashboard' },
    { path: '/add-section', component: AddSection, name: 'AddSection' },
    { path :'/librarian-dashboard', component: Librariandashboard,name:'Librariandashboard'},
    { path: '/edit-section/:id', component: EditSection, name: 'EditSection' },
    { path: '/delete-section/:sectionId', component: DeleteConfirmation, name: 'Deleteconformation' },
    { path: '/sections/:sectionId/ebooks', component: ShowEBooks, name: 'ShowEBooks' }


  ]
  
  export default new VueRouter({
    routes,
  })