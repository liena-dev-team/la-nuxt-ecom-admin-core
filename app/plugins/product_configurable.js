
export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {
		// console.log("plugin: product_configurable");

		class ProductConfigurable {
			async pushConfigurableToGoogleMerchant(configurable_id) {
				return await useApiFetch("/admin/catalog/configurable/google_merchant/one/" + configurable_id, {
					method: HTTP_METHOD.PUT
				});
			}
			async pushAllConfigurableToGoogleMerchant() {
				return await useApiFetch("/admin/auto-google-merchant/sync-all-google-merchant-products", {
					method: HTTP_METHOD.POST
				});
			}
		}

		const product_configurable = new ProductConfigurable();

		return {
			provide: {
				product_configurable: product_configurable,
			},
		};
	}
})
