
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {
		nuxtApp.vueApp.component("vue-date-picker", VueDatePicker);
	}
})
