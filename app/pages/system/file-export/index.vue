<template>
	<page-list page_class="App\AdminPage\System\FileExportList">
		<template #["field:file_name"]="{ field, record }">
			<a :href="API_HOST + record.file_path" :title="field.value">
				{{ field.value }}
			</a>
		</template>
	</page-list>
</template>

<script setup>

// Use
const config = useRuntimeConfig();

const API_HOST = ref(config.public.apiHost);

</script>