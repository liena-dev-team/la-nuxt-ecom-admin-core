
export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {
		class ProductVariant {
			constructor() { }

			async filter(filter_request) {
				return await useApiFetch(
					"/admin/catalog/variant/filter", {
					method: HTTP_METHOD.POST,
					body: {
						pagination: filter_request.pagination,
						filters: filter_request.filters,
						sorts: filter_request.sorts
					}
				});
			}

			async getConfigurableFromVariantId(variant_id) {
				return await useApiFetch(
					"/admin/catalog/variant/configurable/" + variant_id, {
					method: HTTP_METHOD.GET
				});
			}

			async copyAllDataFromBC() {
				return await useApiFetch("/admin/catalog/variant/bc/all", {
					method: HTTP_METHOD.PUT
				});
			}

			async copyDataFromBC(variant_id) {
				return await useApiFetch("/admin/catalog/variant/bc/one/" + variant_id, {
					method: HTTP_METHOD.PUT
				});
			}
		}

		const product_variant = new ProductVariant();
		return {
			provide: {
				product_variant: product_variant,
			},
		};
	}
})
