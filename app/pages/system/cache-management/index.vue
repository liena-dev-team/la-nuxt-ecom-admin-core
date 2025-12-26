<template>
	<page-list ref="ref_page" page_class="App\AdminPage\System\CacheManagementList">
		<template #["action:flush_cache"]>
			<v-btn size="small" variant="elevated" color="primary" @click="purgeAllCache" :loading="is_loading">
				<span>Flush Cache</span>
			</v-btn>
		</template>
	</page-list>
</template>
<script setup>
// Plugins
const { $cache_manager } = useNuxtApp();
// Refs
const is_loading = ref(false);
const form_messages = ref();
const ref_page = useTemplateRef("ref_page");

async function purgeAllCache() {
	is_loading.value = true;
	const response_data = await $cache_manager.purgePageHtmlCache();
	// Wait 10 seconds before stopping loading
	await new Promise((resolve) => setTimeout(resolve, 10000));
	is_loading.value = false;
}
</script>