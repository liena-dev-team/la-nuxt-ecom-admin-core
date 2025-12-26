
import { defineStore } from 'pinia';

export const useAdminStore = defineStore('admin', () => {
	// Admin user
	const user = ref();
	const api_env = ref();

	return {
		user,
		api_env
	};
});
