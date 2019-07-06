
import Vue from 'vue';
import VueRouter from 'vue-router'
import Vuetify from 'vuetify'
import VueMoment from 'vue-moment'
const moment = require('moment')

Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.use(Vuetify)
Vue.use(VueMoment, {
    moment
})

/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

window.axios = require('axios');

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

window.Vue = Vue;

import "vue-material-design-icons/styles.css"
import 'vuetify/dist/vuetify.min.css'

const files = require.context('./', true, /\.vue$/i)

files.keys().map(key => {
    var paths = key.split('/');
    return Vue.component(paths[paths.length - 1].split('.')[0], files(key).default)
})

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */


const routes = [
    { path: '/', component: {template: '<home></home>'}, name: 'home' },
]

const router = new VueRouter({
    mode: 'history',
    routes // short for `routes: routes`
})


const app = new Vue({
    template: '<app></app>',
    router
}).$mount('#app');
