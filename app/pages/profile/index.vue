<template>
	<div class="la-page-profile">
		<v-card class="mx-auto" elevation="3">
			<v-card-title class="text-h6 px-4 pt-4">Admin Profile</v-card-title>
			<v-card-subtitle class="px-4 " v-if="admin_store.user?.email">{{ admin_store.user.email }}</v-card-subtitle>
			<!-- Form -->
			<v-form ref="form" @submit.prevent="updateProfile" v-model="form_valid">
				<div class="v-container" v-if="admin_store.user">
					<form-message :messages="form_messages"></form-message>
					<div class="mb-2" v-if="role_user">
						<strong>Role:</strong> {{ role_user }}
					</div>
					<v-text-field class="mb-4" v-model="name" label="Name" required density="compact" variant="outlined"
						autocomplete="off" hide-details />
					<v-text-field class="mb-4" v-model="password" :rules="[rules.required, rules.min]" type="password"
						hint="At least 8 characters" prepend-inner-icon="mdi-lock-outline" density="compact"
						variant="outlined" label="Password" required counter autocomplete="off" hide-details>
					</v-text-field>
					<v-text-field class="mb-4" v-model="reenter_password" :rules="[rules.required, rules.min]"
						type="password" hint="At least 8 characters" prepend-inner-icon="mdi-lock-outline"
						density="compact" variant="outlined" label="Re-enter Password" required counter
						autocomplete="off" hide-details>
					</v-text-field>
					<div>
						<v-btn :loading="is_loading" :disabled="!form_valid" depressed block color="primary"
							type="submit" size="large">
							<span>Update</span>
						</v-btn>
					</div>
				</div>
			</v-form>
		</v-card>

		<!-- Snackbar notifications -->
		<v-snackbar v-model="snackbar" :timeout="snackbar_timeout" :color="snackbar_color" location="top right">
			{{ snackbar_text }}
			<template #actions>
				<v-btn variant="text" @click="snackbar = false">Close</v-btn>
			</template>
		</v-snackbar>
	</div>
</template>

<script setup>
//Use
const admin_store = useAdminStore();
//Plugins
const { $admin_user } = useNuxtApp();

// Ref
const is_loading = ref(false);
const form_valid = ref(false);
const form_messages = ref([]);
const name = ref(admin_store.user?.name || "");
const role_user = computed(() => Array.isArray(admin_store.user?.roles) ? admin_store.user.roles.join(', ') : '');
const password = ref("");
const reenter_password = ref("");
const snackbar = ref(false);
const snackbar_text = ref("");
const snackbar_color = ref("success");
const snackbar_timeout = ref(3000);
const rules = {
	required: (val) => (val || "").length > 0 || "Field is required",
	min: (v) => v?.length >= 2 || "Min 8 characters",
};

// Function
async function updateProfile() {
	form_messages.value = [];
	if (!form_valid.value) {
		form_messages.value = [{ type: 'error', text: 'Form is not valid.' }];
		snackbar_text.value = 'Form is not valid.';
		snackbar_color.value = 'error';
		snackbar.value = true;
		return;
	}

	is_loading.value = true;
	try {
		const params = {
			is_active: admin_store.user?.is_active,
			name: name.value,
			email: admin_store.user?.email || "",
			role_id: String(admin_store.user?.role_id ?? ""),
			is_super_admin: Boolean(admin_store.user?.is_super_admin),
			password: password.value,
			reenter_password: reenter_password.value,
			your_password: password.value,
		};

		const res = await $admin_user.updateProfile(params);
		form_messages.value = res?.messages || [];

		if (res?.result) {
			password.value = "";
			reenter_password.value = "";
			snackbar_text.value = 'Profile updated successfully';
			snackbar_color.value = 'success';
			snackbar.value = true;
		}
	} catch (e) {
		console.error('updateProfile failed', e);
		form_messages.value = [{ type: 'error', text: 'Update failed. Please try again.' }];
		snackbar_text.value = 'Update failed. Please try again.';
		snackbar_color.value = 'error';
		snackbar.value = true;
	} finally {
		is_loading.value = false;
	}
}

</script>

<style lang="less">
.la-page-profile {
	max-width: 400px;
	margin: 55px auto;
}
</style>