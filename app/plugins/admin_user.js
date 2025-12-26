
import { useAdminStore } from "~/stores/admin";

export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {
		const admin_store = useAdminStore();

		class AdminUser {

			async login(email, password) {
				const res_data = await useApiFetch(
					"/admin/profile/login", {
					method: HTTP_METHOD.POST,
					body: {
						email: email,
						password: password
					}
				});

				if (res_data.result) {
					const res_data = await admin_user.getMe();
					if (res_data && res_data.result) {
						admin_store.user = res_data.admin_user;
					}
				}

				return res_data;
			}

			async logout() {
				const res_data = await useApiFetch(
					"/admin/profile/logout", {
					method: HTTP_METHOD.GET,
				});

				admin_store.user = null;

				return res_data.result;
			}

			async getMe() {
				const res_data = await useApiFetch(
					"/admin/profile/me", {
					method: HTTP_METHOD.GET,
				});

				if (res_data && res_data.result && res_data.admin_user) {
					admin_store.user = res_data.admin_user;
				} else {
					admin_store.user = null;
				}

				admin_store.api_env = res_data?.env;
				return res_data;
			}

			async filterRoles(filter_request) {
				const res_data = await useApiFetch(
					"/admin/role/filter", {
					method: HTTP_METHOD.POST,
					body: {
						pagination: filter_request.pagination,
						filters: filter_request.filters,
						sorts: filter_request.sorts
					}
				});

				return res_data;
			}

			async updateProfile(params) {
				const res_data = await useApiFetch(
					"/admin/profile/update", {
					method: HTTP_METHOD.PUT,
					body: params
				});

				if (res_data.result) {
					const res_data = await admin_user.getMe();
					if (res_data && res_data.result) {
						admin_store.user = res_data.admin_user;
					}
				}

				return res_data;
			}
		}

		const admin_user = new AdminUser();

		// NOTE: Session cookie authentication needs browser cookie to work !
		const res_data = await admin_user.getMe();
		if (res_data && res_data.result) {
			admin_store.user = res_data.admin_user;
		}

		return {
			provide: {
				admin_user: admin_user,
			},
		};
	}
});
