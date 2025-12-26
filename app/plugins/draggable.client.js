
import draggable from 'vuedraggable';

export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {
		nuxtApp.vueApp.component('draggable', draggable);
	}
})
