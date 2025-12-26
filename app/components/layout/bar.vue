<template>
	<div class="la-layout-bar">
		<!-- Left Section -->
		<div class="left-section d-flex align-end ma-2 ga-2">
			<layout-environment />
		</div>
		<v-spacer></v-spacer>
		<!-- Right Section -->
		<div class="right-section d-flex align-center ma-2">
			<!-- Icons -->
			<!-- <v-icon color="black" class="ml-3">mdi-printer</v-icon>
			<v-icon color="black" class="ml-3">mdi-bell</v-icon> -->

			<!-- Dropdown -->
			<div class="text-center custom-menu">
				<v-menu open-on-hover>
					<template v-slot:activator="{ props }">
						<!-- Admin User Info -->
						<div v-if="admin_store.user" class="admin-user-info">
							<div v-bind="props" class="d-flex align-center">
								<!-- <v-avatar size="40" class="ml-3">
									<img src="https://randomuser.me/api/portraits/men/85.jpg" alt="User Avatar" />
								</v-avatar> -->
								<div class="ml-2">
									<div>
										Hi, <strong>{{ admin_store.user.name }}</strong>
										<v-icon color="black" class="">mdi-menu-down</v-icon>
									</div>
								</div>
							</div>
						</div>
					</template>

					<v-list nav density="compact">
						<v-list-item :prepend-icon="item.icon" v-for="(item, index) in items" :key="index"
							:value="item.title" @click="onClickMenuItem(item)">
							<v-list-item-title>{{ item.title }}</v-list-item-title>
						</v-list-item>
					</v-list>
				</v-menu>
			</div>
		</div>
	</div>
</template>

<script setup>

// Use
const router = useRouter();
const admin_store = useAdminStore();

// Plugins
const { $admin_user } = useNuxtApp();

const items = ref([
	// { title: "Profile", icon: "mdi-account-circle" },
	// { title: "Settings", icon: "mdi-cog" },
	{ title: "Profile", value: "profile", icon: "mdi-account-circle" },
	{ title: "Logout", value: "logout", icon: "mdi-logout" },
]);

// Functions
async function onClickMenuItem(item) {
	switch (item.value) {
		case "logout":
			const result = await $admin_user.logout();
			if (result) {
				router.push("/login");
			}
			break;
		case "profile":
			router.push("/profile");
			break;
	}

	return true;
}

</script>
<style scoped lang="less">
.la-layout-bar {
	display: flex;
	background-color: var(--la-secondary-color);

	.admin-user-info {
		cursor: pointer;
	}
}
</style>
