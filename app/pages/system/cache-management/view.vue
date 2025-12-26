<template>
	<page-card ref="ref_page" page_class="App\AdminPage\System\CacheManagementCard" :go_back="true"
		v-model:record="record" v-model:form_messages="form_messages">
		<template #["action:flush_cache_card"]>
			<v-btn size="small" variant="elevated" color="primary" @click="purgeCacheType" :loading="is_loading">
				<span>Flush Cache </span>
			</v-btn>
		</template>
	</page-card>
</template>

<script setup>
// Refs
const is_loading = ref(false);
const record = ref({});
const form_messages = ref();
const { $cache_manager } = useNuxtApp();
// Template Ref
const ref_page = useTemplateRef("ref_page");

// Functions
async function purgeCacheType() {
	console.log("run");
	console.log({ record });
	if (!record.value || !record.value.id) {
		return;
	}
	is_loading.value = true;
	const response_data = await $cache_manager.purgePageHtmlCache(record.value.cache_type);
	// Wait 10 seconds before stopping loading
	await new Promise((resolve) => setTimeout(resolve, 10000));
	is_loading.value = false;

	ref_page.value.requestRead();
}
</script>
