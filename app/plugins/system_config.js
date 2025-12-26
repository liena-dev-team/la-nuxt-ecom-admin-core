
export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {
		// the next plugin will be executed immediately
		// console.log("plugin: system_config");

		class SystemConfig {
			async getEnvironment() {
				return await useApiFetch(
					"/system/config/env", {
					method: HTTP_METHOD.GET
				});
			}
		}

		const system_config = new SystemConfig();

		return {
			provide: {
				system_config: system_config,
			},
		};
	}
});
