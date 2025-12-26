<template>
	<div>
		<page-card ref="ref_page" page_class="App\AdminPage\Catalog\VariantCard" :go_back="true" v-model:record="record">
			<!-- Actions -->
			<template #["action:bc_copy_one"]>
				<v-btn size="small" variant="elevated" color="primary" @click="copyDataFromBC">
					<span>Copy Data From BC</span>
				</v-btn>
			</template>
		</page-card>
	</div>
</template>

<script setup>

// Plugins
const { $product_variant } = useNuxtApp();

// Refs
const is_loading = ref(false);
const record = ref({});
const form_messages = ref();

// Template Ref
const ref_page = useTemplateRef("ref_page");

// Functions
async function copyDataFromBC() {
	if (!record.value || !record.value.id) {
		return;
	}

	is_loading.value = true;
	const response_data = await $product_variant.copyDataFromBC(record.value.id);
	form_messages.value = response_data.messages;
	is_loading.value = false;
	
	ref_page.value.requestRead();
}

</script>
