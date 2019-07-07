import Vue from 'vue';

export default new Vue({
    data: function () {
        let ip = localStorage.ip;
        
        return {
            ip: ip || 'localhost:3000',
        };
    },
    mounted () {
        console.log(localStorage);
        if (localStorage.ip) {
            this.ip = localStorage.ip;
        }
    },
    watch: {
        ip (address) {
            localStorage.ip = address;
        }
    }
});
