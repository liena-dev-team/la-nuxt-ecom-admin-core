
export default defineNuxtRouteMiddleware(async (to, from) => {
	
	if (to.path == '/login') {
		return;
	}

	const admin_store = useAdminStore();

	// NOTE:Session cookie authentication needs browser cookie to work !
	if (!admin_store.user) {
		return navigateTo("/login");
	}

});
