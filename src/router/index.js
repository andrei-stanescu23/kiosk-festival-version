import Vue from 'vue'
import VueRouter from 'vue-router'

// Components
import Register from '@/components/public/Register'
import RegisterPassword from '@/components/public/RegisterPassword'
import Login from '@/components/public/Login'
import Dashboard from '@/components/private/Dashboard'

// Middlewares
import auth from '@/middleware/auth'

Vue.use(VueRouter)

const router = new VueRouter({
    routes: [
        {
            path: '/',
            name: 'Dashboard',
            component: Dashboard,
            meta: { requiresAuth: true }
        }, {
            path: '/login',
            name: 'Login',
            component: Login,
            props: true
        }, {
            path: '/register',
            name: 'Register',
            component: Register,
        }, {
            path: '/register/device',
            name: 'RegisterPassword',
            component: RegisterPassword,
            props: true
        }
    ]
})
/* eslint-disable */
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        auth({ next, to })
    } else {
        next()
    }
})

export default router
