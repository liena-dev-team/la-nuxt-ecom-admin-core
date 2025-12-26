
export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {
		// the next plugin will be executed immediately
		// console.log("plugin: bc_service");
		
		class BcService {
			
			async filterItems(filter_request) {
				return await useApiFetch(
					"/admin/service/bc/item/filter", {
					method: HTTP_METHOD.POST,
					body: {
						pagination: filter_request.pagination,
						filters: filter_request.filters,
						sorts: filter_request.sorts
					}
				});
			}
			
			async filterItemVariant(filter_request) {
				return await useApiFetch(
					"/admin/service/bc/item-variant/filter", {
					method: HTTP_METHOD.POST,
					body: {
						pagination: filter_request.pagination,
						filters: filter_request.filters,
						sorts: filter_request.sorts
					}
				});
			}

			async filterItemCategories(filter_request) {
				return await useApiFetch(
					"/admin/service/bc/item-category/filter", {
					method: HTTP_METHOD.POST,
					body: {
						pagination: filter_request.pagination,
						filters: filter_request.filters,
						sorts: filter_request.sorts
					}
				});
			}

			async filterDimensionValues(filter_request) {
				return await useApiFetch(
					"/admin/service/bc/dimension-value/filter", {
					method: HTTP_METHOD.POST,
					body: {
						pagination: filter_request.pagination,
						filters: filter_request.filters,
						sorts: filter_request.sorts
					}
				});
			}
		}

		const bc_service = new BcService();
		
		return {
			provide: {
				bc_service: bc_service,
			},
		};
	}
});
