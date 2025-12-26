
export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {

		class AdminMenu {
			async getMainMenu() {
				return await useApiFetch("/admin/menu/main-menu", {
					method: HTTP_METHOD.GET,
				});
			}

			async getMainMenuPermission(role_id) {
				return await useApiFetch("/admin/menu/permission/" + role_id, {
					method: HTTP_METHOD.GET,
				});
			}

			async updateMainMenuPermission(role_id, menu_codes) {
				return await useApiFetch("/admin/menu/permission", {
					method: HTTP_METHOD.PUT,
					body: {
						role_id: role_id,
						menu_codes: menu_codes
					}
				});
			}
		}

		const admin_menu = new AdminMenu();

		return {
			provide: {
				admin_menu: admin_menu,
			},
		};
	}
});
