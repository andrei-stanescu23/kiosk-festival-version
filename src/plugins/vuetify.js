import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
	iconfont: 'md',
	theme: {
		primary: '#ffc91d',
		background: '#ffc91d',
		backgroundDark: '#ffc91d',
		cards: '#424242',
		activeCard: '#424242',
		secondary: '#f46036',
		accent: '#f7bc1c',
		error: '#f46036'
	}
})
