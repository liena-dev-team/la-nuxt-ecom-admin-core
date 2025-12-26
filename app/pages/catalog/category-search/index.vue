<template>
	<page-list page_class="App\AdminPage\Catalog\CategorySearchKeywordList" :has_card_page="false">
		<!-- Fields -->
		<template #["field:category_name"]="{ field: field, record: record }">
			{{ field.value }}
		</template>
	</page-list>
</template>

<script setup>
</script>
