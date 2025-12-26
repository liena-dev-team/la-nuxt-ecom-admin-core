<template>
	<page-list page_class="App\AdminPage\Catalog\VariantList" :insertable="false"
		v-model:is_loading="is_loading" v-model:form_messages="form_messages" >
		<!-- Actions -->
		<template #["action:bc_copy_all"]>
			<v-btn size="small" variant="elevated" color="primary" @click="copyAllDataFromBC">
				<span>Copy All Data From BC</span>
			</v-btn>
		</template>
		<template #["field:price"]="{ field }">
			<span v-html="formatPrice(field.value, true)"></span>
		</template>
	</page-list>
</template>

<script setup>

// Plugins
const { $product_variant } = useNuxtApp();

// Refs
const is_loading = ref(false);
const form_messages = ref();

// Functions
async function copyAllDataFromBC() {
	is_loading.value = true;
	const response_data = await $product_variant.copyAllDataFromBC();
	form_messages.value = response_data.messages;
	is_loading.value = false;
}

</script>
