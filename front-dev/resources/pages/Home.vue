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
                    data-app
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
                    data-app
                    hide-details>
            <span slot="label" class="label-status">
                {{ automatic ? 'Automático' : 'Manual' }}
            </span>
            </v-switch>



            <v-list three-line class="mt-4">
                <v-divider></v-divider>
                <v-list-tile>
                    <v-list-tile-content @click="timerDialog = true">
                        <v-list-tile-title>Rotinas</v-list-tile-title>
                        <v-list-tile-sub-title>Horários pré-agendados para disparar ações da lâmpada.</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-divider></v-divider>
                <v-list-tile @click="configDialog = true">
                    <v-list-tile-content>
                        <v-list-tile-title>Configurações</v-list-tile-title>
                        <v-list-tile-sub-title>Parâmetros da aplicação.</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>


            <v-dialog v-model="timerDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
                <v-card>
                    <v-toolbar dark color="primary">
                        <v-btn icon dark @click="timerDialog = false">
                            <v-icon>close</v-icon>
                        </v-btn>
                        <v-toolbar-title>Rotinas</v-toolbar-title>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-list two-line>
                        <v-list-tile avatar>
                            <v-list-tile-content @click="timerBox.opened = true">
                                <v-list-tile-title>Incluir</v-list-tile-title>
                                <v-list-tile-sub-title>Agende um novo horário em sua rotina.</v-list-tile-sub-title>
                            </v-list-tile-content>

                            <v-list-tile-action>
                                <v-btn fab flat small @click="timerBox.opened = true">
                                    <v-icon :size="28">add_alarm</v-icon>
                                </v-btn>
                            </v-list-tile-action>
                        </v-list-tile>

                        <v-dialog v-model="timerBox.opened" max-width="290" persistent>
                            <v-card>
                                <v-card-title>
                                    <v-menu ref="menu" v-model="timerBox.menu" :close-on-content-click="false" :return-value.sync="timerBox.picker" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                        <v-text-field v-model="timerBox.picker" label="Horário" prepend-icon="access_time" readonly slot="activator"></v-text-field>
                                        <v-time-picker v-if="timerBox.menu" full-width @click:minute="$refs.menu.save(timerBox.picker)" v-model="timerBox.picker" format="24hr" color="green" header-color="primary"></v-time-picker>
                                    </v-menu>
                                    <v-select
                                            v-model="timerBox.type"
                                            :items="timerBox.types"
                                            class="mb-3"
                                            item-text="name"
                                            item-value="value"
                                            label="Escolher a ação"
                                            :prepend-icon="timerBox.type.icon"
                                            return-object
                                            hide-details
                                            solo
                                    ></v-select>
                                    <v-btn block large @click="timerBox.opened = false;timerBox.picker = null;timerBox.type = false;"><v-icon>clear</v-icon></v-btn>
                                    <v-btn block large color="indigo" @click="saveRoutine()" :disabled="!timerBox.picker || !timerBox.type" style="color: #fff;"><v-icon>save</v-icon></v-btn>
                                </v-card-title>
                            </v-card>
                        </v-dialog>
                    </v-list>
                    <v-divider></v-divider>

                    <v-list two-line subheader>
                        <v-subheader>Itens incluídos</v-subheader>

                        <div v-if="timerBox.routines.length > 0">
                            <v-list-tile v-for="(routine, index) in timerBox.routines" :key="routine.id">
                                <v-list-tile-action>
                                    <v-icon color="indigo">{{ routine.type.icon }}</v-icon>
                                </v-list-tile-action>

                                <v-list-tile-content>
                                    <v-list-tile-title>{{ routine.time }}</v-list-tile-title>
                                    <v-list-tile-sub-title>{{ routine.type.name }}</v-list-tile-sub-title>
                                </v-list-tile-content>

                                <v-list-tile-action>
                                    <v-btn fab flat small @click="deleteRoutine(routine.id)">
                                        <v-icon>clear</v-icon>
                                    </v-btn>
                                </v-list-tile-action>
                            </v-list-tile>
                        </div>
                        <div v-else class="mt-5" style="text-align: center">
                            <v-icon style="color: #ddd;font-size: 6rem;">sentiment_very_dissatisfied</v-icon>
                            <p class="mt-0" style="text-align: center;color: #afafaf;font-size: 14px;">Nenhuma rotina inclusa</p>
                        </div>

                    </v-list>
                </v-card>
            </v-dialog>

            <v-dialog v-model="configDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
                <v-card>
                    <v-toolbar dark color="primary">
                        <v-btn icon dark @click="configDialog = false">
                            <v-icon>close</v-icon>
                        </v-btn>
                        <v-toolbar-title>Configurações</v-toolbar-title>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-list two-line>
                        <v-list-tile avatar>
                            <v-list-tile-content>
                                <v-text-field
                                        v-model="$config.ip"
                                        type="text"
                                        label="IP do servidor"
                                ></v-text-field>
                            </v-list-tile-content>

                            <v-list-tile-action>
                                <v-btn fab flat small>
                                    <v-icon :size="28">add_alarm</v-icon>
                                </v-btn>
                            </v-list-tile-action>
                        </v-list-tile>

                    </v-list>
                </v-card>
            </v-dialog>

            <v-bottom-sheet v-model="profilesBox">
                <v-btn fab dark slot="activator" color="indigo" style="position: fixed;bottom: 5px;right:5px">
                    <v-icon dark>swap_horiz</v-icon>
                </v-btn>

                    <v-list>
                        <v-subheader>Perfis pré definidos</v-subheader>
                        <v-list-tile v-for="profile in profiles" :key="profile.title" @click="setProfile(profile)">
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
                {{ currentTime }}
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
                status      : false,
                automatic   : false,
                dimmer      : {
                    value: 50,
                    max: 100,
                    min: 0,
                    changed: false
                },
                profilesBox : false,
                profiles    : [ // https://material.io/tools/icons/
                    { icon: 'local_library', title: 'Leitura', value: 40 },
                    { icon: 'event_seat', title: 'Descanso', value: 5 },
                    { icon: 'theaters', title: 'Netflix', value: 20 },
                ],
                configDialog: false,
                timerDialog: false,
                timerBox: {
                    opened: false,
                    menu: false,
                    landscape: false,
                    picker: null,
                    type: false,
                    types: [
                        {
                            value: 0,
                            name: "Desligar",
                            icon: "not_interested"
                        },
                        {
                            value: 1,
                            name: "Ligar",
                            icon: "wb_incandescent"
                        },
                        {
                            value: 2,
                            name: "Amanhecer",
                            icon: "wb_sunny"
                        },
                        {
                            value: 3,
                            name: "Anoitecer",
                            icon: "brightness_3"
                        },
                    ],
                    routines: []
                },
                currentTime: null,
                screen      : {
                    height: window.innerHeight
                }
            }
        },
        sockets: {
            connect() {
                console.log('conectado');
            },
            disconnect() {
                console.log('desconectado');
            },
            status(value) {
                this.status = value;
                // this.sendSwitch();
            },
            dimmer(value) {
                this.dimmer.value = value;
            }
        },
        created() {
            this.getSwitch();
            this.getAutomatic();
            this.getDimmer();
            this.getRoutines();

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
                this.currentTime = this.moment().format('HH:mm:ss');
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
            getDimmer: function () {
                // Atualiza com o valor do dimmer
                axios.get(`http://${this.$config.ip}/api/feed/dimmer`)
                    .then(res => {
                        this.dimmer.value = res.data.value;
                    });
            },
            getRoutines: function () {
                axios.get(`http://${this.$config.ip}/api/routine/`)
                    .then(res => {
                        this.timerBox.routines = res.data.routines;
                    });
            },
            getSwitch: function () {
                // Atualiza se o switch estiver ligado ou desligado
                axios.get(`http://${this.$config.ip}/api/feed/switch`)
                    .then(res => {
                        this.status = parseInt(res.data.value) === 1;
                    });
            },
            getAutomatic: function () {
                // Atualiza o valor automático que estiver no server
                axios.get(`http://${this.$config.ip}/api/auto`)
                    .then(res => {
                        this.automatic = res.data.status;
                    });
            },
            setDimmer: function (value) {
                this.dimmer.changed = true;
            },
            setProfile: function(profile) {
                if(!this.status) {
                    this.status = true;
                }
                this.dimmer.value = profile.value;
                this.sendDimmer();
                this.sendSwitch();
                this.profilesBox = false;
            },
            saveRoutine: function () {
                this.timerBox.opened = false;

                let currentRoutine = {
                    time: this.timerBox.picker,
                    type: this.timerBox.type
                };

                axios.post(`http://${this.$config.ip}/api/routine`, currentRoutine)
                    .then(res => {
                        this.timerBox.routines.push(res.data.routine)
                        this.timerBox.picker = null;
                        this.timerBox.type = false;
                        console.log(JSON.stringify(res.data.routine));
                    });
            },
            deleteRoutine: function (id) {
                let routineIndex = this.timerBox.routines.findIndex(routine => routine.id === id);
                axios.delete(`http://${this.$config.ip}/api/routine/${id}`)
                    .then(res => {
                        this.$delete(this.timerBox.routines, routineIndex);
                        console.log(`A rotina ${res.data.routineId} foi deletada.`);
                    });
            },
            sendDimmer: function () {
                axios.post(`http://${this.$config.ip}/api/feed`, {feed: 'dimmer', value: this.dimmer.value})
                    .then(res => {
                        console.log(res.data, `O feed ${res.data.feed_key} foi atualizado para ${res.data.value}`);
                    })
                this.dimmer.changed = false;
            },
            sendSwitch: function () {
                axios.post(`http://${this.$config.ip}/api/feed`, {feed: 'switch', value: this.status ? 1 : 0})
                    .then(res => {
                        console.log(res.data, `O feed ${res.data.feed_key} foi atualizado para ${res.data.value}`);
                    });
            },
            sendAutomatic: function () {
                this.sendDimmer();
                axios.post(`http://${this.$config.ip}/api/auto`, {status: this.automatic})
                    .then(res => {
                        console.log(res.data);
                    });
            },
        }
    }
</script>

<style scoped>
    .screen {display: flex;flex-direction: column;}
    .turned-on .icon {color: gray;opacity: .4;}
    .icon {font-size: 2rem;width: 60px;justify-content: center;color: #eda426;}
    .label-status {font-family: sans-serif;font-size: 20px;}
    .wrapper {padding: 0 2rem;flex-grow: 1;}
    .luminosity {background: #334656;height: 4rem;display: flex;justify-content: center;align-items: center;color: #fff;font-family: sans-serif;font-size: 24px;font-weight: 300;}
    .footer {background: #dbdbdb;padding: 2rem;}
    .timer {font-size: 2rem;font-weight: 300;color: #888888;}
    .profile-icon {background: #334656;color: #fff;-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;}
    .dimmer[disabled] {opacity: .4}
    .dimmer[disabled]::-webkit-slider-thumb {background: #999;}
    .dimmer[disabled]::-moz-range-thumb {background: #999;}
    .dimmer {-webkit-appearance: none;width: 100%;height: 40px;background: #d3d3d3;outline: none;opacity: 0.7;-webkit-transition: .2s;transition: opacity .2s;flex-grow: 1;-webkit-border-radius: 50px;-moz-border-radius: 50px;border-radius: 50px;}
    .dimmer:hover {opacity: 1;}
    .dimmer::-webkit-slider-thumb {-webkit-appearance: none;appearance: none;width: 40px;height: 40px;background: #4CAF50;cursor: pointer;border-radius:50%}
    .dimmer::-moz-range-thumb {width: 40px;height: 40px;background: #4CAF50;cursor: pointer;border-radius:50%}
</style>