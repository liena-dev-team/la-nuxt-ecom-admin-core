
export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {
		// the next plugin will be executed immediately
		// console.log("plugin: cache");

		class StaticCache {
			cache_data = {};

			constructor() { }
			
			set(namespace, key, value) {
				if (!this.cache_data[namespace]) {
					this.cache_data[namespace] = {};
				}

				this.cache_data[namespace][key] = value;
			}

			get(namespace, key) {
				return this.cache_data?.[namespace]?.[key];
			}
		}

		const cache = new StaticCache();

		return {
			provide: {
				cache: cache,
			},
		};
	}
});
