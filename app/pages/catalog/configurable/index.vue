<template>
	<div>
		<page-list page_class="App\AdminPage\Catalog\ConfigurableList" v-model:is_loading="is_loading"
			v-model:form_messages="form_messages">
			<!-- Actions -->
			<template #["action:google_merchant_all"]>
				<v-btn color="primary" size="small" variant="elevated" @click="dialog_apply = true">
					<span>Sync All to Google Merchant</span>
				</v-btn>
			</template>
		</page-list>
		<!-- Dialog - Apply -->
		<v-dialog v-model="dialog_apply" transition="dialog-top-transition" max-width="600">
			<v-card title="Ask">
				<v-card-text>
					<p>
						Do you want to Sync to Google Merchant ?
					</p>
				</v-card-text>
				<v-card-actions>
					<v-btn @click="pushAllConfigurableToGoogleMerchant" color="primary"
						:loading="is_loading">Yes</v-btn>
					<v-btn @click="dialog_apply = false">No</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<!-- Snakbar - Success -->
		<v-snackbar v-model="snackbar_apply_success" multi-line timeout="3000" color="success">
			<p>Google merchant is applied successfully !</p>
			<template v-slot:actions>
				<v-btn variant="text" @click="snackbar_apply_success = false">
					Close
				</v-btn>
			</template>
		</v-snackbar>

		<!-- Snakbar - Failed -->
		<v-snackbar v-model="snackbar_apply_failure" multi-line timeout="3000" color="error">
			<p>Failed to apply Google merchant !</p>
			<template v-slot:actions>
				<v-btn variant="text" @click="snackbar_apply_failure = false">
					Close
				</v-btn>
			</template>
		</v-snackbar>
	</div>
</template>
<script setup>

// Plugins
const { $product_configurable } = useNuxtApp();

// Refs
const is_loading = ref(false);
const form_messages = ref();
const dialog_apply = ref(false);
const snackbar_apply_success = ref(false);
const snackbar_apply_failure = ref(false);

// Functions
async function pushAllConfigurableToGoogleMerchant() {
	is_loading.value = true;
	const response_data = await $product_configurable.pushAllConfigurableToGoogleMerchant();
	form_messages.value = response_data.messages;
	if (response_data.result) {
		snackbar_apply_success.value = true;
	} else {
		snackbar_apply_failure.value = true;
	}
	is_loading.value = false;
	dialog_apply.value = false;
}

</script>
