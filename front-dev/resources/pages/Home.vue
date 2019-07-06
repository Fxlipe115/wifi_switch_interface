<template>
    <div :class="{'turned-on': !status, 'screen': true}" :style="{'height': `${screen.height}px`}">
        <div class="luminosity">
            {{ dimmer.value }}%
        </div>
        <div class="d-flex justify-content-center align-items-center flex-row mt-3">
            <lightbulb-outline class="icon"></lightbulb-outline>
            <input @input="setDimmer($event.target.value)" type="range" :min="dimmer.min" :max="dimmer.max" v-model="dimmer.value" class="dimmer" :disabled="!status || automatic">
            <lightbulb class="icon"></lightbulb>
        </div>
        <div class="wrapper">
            <v-switch
                    v-model="status"
                    @change="sendSwitch()"
                    color="indigo"
                    hide-details>
            <span slot="label" class="label-status">
                {{ status ? 'Ligado' : 'Desligado' }}
            </span>
            </v-switch>

            <v-switch
                    v-model="automatic"
                    @change="sendAutomatic()"
                    color="indigo"
                    :disabled="!status"
                    hide-details>
            <span slot="label" class="label-status">
                {{ automatic ? 'Automático' : 'Manual' }}
            </span>
            </v-switch>


            <v-bottom-sheet v-model="sheet">
                <v-btn fab dark slot="activator" color="indigo" style="position: fixed;bottom: 5px;right:5px">
                    <v-icon dark>swap_horiz</v-icon>
                </v-btn>

                    <v-list>
                        <v-subheader>Perfis pré definidos</v-subheader>
                        <v-list-tile v-for="profile in profiles" :key="profile.title" @click="sheet = false">
                            <v-list-tile-avatar>
                                <v-icon class="profile-icon">{{ profile.icon }}</v-icon>
                            </v-list-tile-avatar>
                            <v-list-tile-title>{{ profile.title }}</v-list-tile-title>
                        </v-list-tile>
                    </v-list>


            </v-bottom-sheet>


        </div>
        <div class="footer d-flex justify-content-center align-items-center flex-row">
            <span class="timer">
                {{ horarioAtual }}
            </span>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import moment from 'moment'
    require('moment/locale/pt');

    import Lightbulb from "vue-material-design-icons/Lightbulb.vue"
    import LightbulbOutline from "vue-material-design-icons/LightbulbOutline.vue"
    import LightbulbOn from "vue-material-design-icons/LightbulbOn.vue"
    import AccountConvert from "vue-material-design-icons/AccountConvert.vue"

    export default {
        name: "Home",
        data() {
            return {
                status: false,
                automatic: false,
                dimmer: {
                    value: 50,
                    max: 100,
                    min: 0,
                    changed: false
                },
                sheet: false,
                profiles: [ // https://material.io/tools/icons/
                    { icon: 'music_note', title: 'Música' },
                    { icon: 'event_seat', title: 'Descanso' },
                    { icon: 'theaters', title: 'Netflix' },
                ],
                horarioAtual: null,
                screen: {
                    height: window.innerHeight
                }
            }
        },
        created() {
            this.getSwitch();
            this.getAutomatic();
            this.getDimmer();

            setInterval(() => {
                // Caso percebeu alguma alteração, envia para o server
                if (this.dimmer.changed) {
                    this.sendDimmer();
                }

                // Se estiver no modo automático, pega os dados do dimmer
                if(this.automatic && this.status) {
                    this.getDimmer();
                }
            }, 5000);


            setInterval(() => {
                this.horarioAtual = this.moment().format('HH:mm:ss');
            }, 1000);

        },
        components: {
            Lightbulb,
            LightbulbOn,
            LightbulbOutline,
            AccountConvert
        },
        methods: {
            moment: function () {
                return moment();
            },
            setDimmer: function (value) {
                this.dimmer.changed = true;
            },
            sendDimmer: function () {
                axios.post('http://localhost:3000/api/feed', {feed: 'dimmer', value: this.dimmer.value})
                    .then(res => {
                        console.log(res.data, `O feed ${res.data.feed_key} foi atualizado para ${res.data.value}`);
                    })
                this.dimmer.changed = false;
            },
            getDimmer: function () {
                // Atualiza com o valor do dimmer
                axios.get('http://localhost:3000/api/feed/dimmer')
                    .then(res => {
                        this.dimmer.value = res.data.value;
                    });
            },
            getSwitch: function () {
                // Atualiza se o switch estiver ligado ou desligado
                axios.get('http://localhost:3000/api/feed/switch')
                    .then(res => {
                        this.status = parseInt(res.data.value) === 1;
                    });
            },
            getAutomatic: function () {
                // Atualiza o valor automático que estiver no server
                axios.get('http://localhost:3000/api/auto')
                    .then(res => {
                        this.automatic = res.data.status;
                    });
            },
            sendSwitch: function () {
                axios.post('http://localhost:3000/api/feed', {feed: 'switch', value: this.status ? 1 : 0})
                    .then(res => {
                        console.log(res.data, `O feed ${res.data.feed_key} foi atualizado para ${res.data.value}`);
                    });
            },
            sendAutomatic: function () {
                this.sendDimmer();
                axios.post('http://localhost:3000/api/auto', {status: this.automatic})
                    .then(res => {
                        console.log(res.data);
                    });
            }
        }
    }
</script>

<style scoped>

    .screen {
        display: flex;
        flex-direction: column;
    }

    .turned-on .icon {color: gray;opacity: .4;}
    .icon {font-size: 2rem;width: 60px;justify-content: center;color: #eda426;}

    .label-status {
        font-family: sans-serif;
        font-size: 20px;
    }

    .wrapper {
        padding: 0 2rem;
        flex-grow: 1;
    }

    .luminosity {
        background: #334656;
        height: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-family: sans-serif;
        font-size: 24px;
        font-weight: 300;
    }

    .footer {
        background: #dbdbdb;
        padding: 2rem;
    }
    .timer {
        font-size: 2rem;
        font-weight: 300;
        color: #888888;
    }

    
    /* Profiles */
    .profile-icon {
        background: #334656;
        color: #fff;
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        border-radius: 50%;
    }
    
    .dimmer[disabled] {opacity: .4}
    .dimmer[disabled]::-webkit-slider-thumb {background: #999;}
    .dimmer[disabled]::-moz-range-thumb {background: #999;}

    .dimmer {-webkit-appearance: none;width: 100%;height: 40px;background: #d3d3d3;outline: none;opacity: 0.7;-webkit-transition: .2s;transition: opacity .2s;flex-grow: 1;
        -webkit-border-radius: 50px;
        -moz-border-radius: 50px;
        border-radius: 50px;}
    .dimmer:hover {opacity: 1;}
    .dimmer::-webkit-slider-thumb {-webkit-appearance: none;appearance: none;width: 40px;height: 40px;background: #4CAF50;cursor: pointer;border-radius:50%}
    .dimmer::-moz-range-thumb {width: 40px;height: 40px;background: #4CAF50;cursor: pointer;border-radius:50%}
</style>