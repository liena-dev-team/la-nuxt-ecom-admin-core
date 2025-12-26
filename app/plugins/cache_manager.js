
export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {
		const PAGE_HTML_CACHE_TYPE = 'Page html';

		class CacheManager {
			async purgePageHtmlCache(cache_type = 'all') {
				return await useApiFetch(`/admin/system/cache-management/purge-cache/${cache_type}`, {
					method: HTTP_METHOD.POST,
				});
			}
		}

		const cache_manager = new CacheManager();

		return {
			provide: {
				cache_manager: cache_manager,
			},
		};
	}
});
