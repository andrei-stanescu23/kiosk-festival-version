//import api from "@/services/api";

/* eslint-disable */
export default async function auth({ next }) {
    const jwt = localStorage.getItem('token');
    const uuid = localStorage.getItem('config_uuid');
    if (!jwt || !uuid) {
        localStorage.removeItem('jwt')
        localStorage.removeItem('config_uuid')
        return next({ path: '/register' })
    } else {
        return next();
    }
}