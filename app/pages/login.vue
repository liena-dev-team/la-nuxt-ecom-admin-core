<template>
	<div class="la-login-panel">
		<v-card class="mx-auto" elevation="1">
			<!-- Logo -->
			<div class="logo">
				<img class="" src="@/assets/img/logo_primary_color.png" @click.stop="logoClick()" />
				<h4>Ecommerce Website</h4>
				<layout-environment />
			</div>
			<!-- Errors -->
			<v-alert v-if="error_message" class="v-warning" :value="error_message" dense rounded="0" text type="warning"
				icon="mdi-information-outline">
			</v-alert>
			<!-- Form -->
			<v-form ref="form" @submit.prevent="logIn" v-model="form_valid">
				<div class="v-container">
					<form-message :messages="messages"></form-message>

					<v-text-field class="mb-4" v-model="email" :rules="[rules.required]" color="primary" label="Email"
						required prepend-inner-icon="mdi-account-outline">
					</v-text-field>
					<v-text-field class="mb-4" v-model="password" :rules="[rules.required, rules.min]"
						:append-icon="show ? 'mdi-eye' : 'mdi-eye-off'" prepend-inner-icon="mdi-lock-outline"
						:type="show ? 'text' : 'password'" hint="At least 8 characters"
						placeholder="Enter your password" label="Password" name="input-10-1" required counter
						@click:append="show = !show"></v-text-field>

					<div>
						<v-btn :loading="is_loading" :disabled="!form_valid" depressed block color="primary"
							type="submit" size="large">Login
						</v-btn>
					</div>
				</div>
			</v-form>
		</v-card>
	</div>
</template>

<script setup>

// Meta
definePageMeta({
	layout: "login",
});

// Router
const router = useRouter();

// Plugins
const { $admin_user } = useNuxtApp();

// Ref
const form_valid = ref(false);
const email = ref("");
const password = ref("");
const error_message = ref();
const is_loading = ref(false);
const rules = {
	required: (val) => (val || "").length > 0 || "Field is required",
	min: (v) => v?.length >= 2 || "Min 2 characters",
};

const show = ref(false);
const messages = ref([]);

// Functions
const logIn = async () => {
	try {
		is_loading.value = true;

		const res_data = await $admin_user.login(email.value, password.value);
		if (res_data.result) {
			router.push("/");
		} else {
			messages.value = res_data.messages;
		}
	} catch (error) {
		console.log(error);
	}

	is_loading.value = false;
};

onMounted(() => { });

</script>

<style lang="less" scoped>
.la-login-panel {
	height: 100%;
	background-image: url("@/assets/img/login-background.jpg");
	display: flex;
	background-size: cover;
	background-position: center;

	.v-card {
		width: 100%;
		max-width: 400px;
		display: grid;
		margin: auto;
	}

	.v-control {
		margin: 16px 16px 16px 16px;
	}

	.v-warning {
		margin-bottom: 0;

		span {
			font-size: 14px;
		}
	}

	.logo {
		display: grid;
		gap: 4px;
		justify-content: center;
		justify-items: center;
		text-align: center;
		padding: 32px 32px 8px 32px;

		h4 {
			color: var(--la_primary_color_silver_6);
		}
	}

	.title-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

}
</style>