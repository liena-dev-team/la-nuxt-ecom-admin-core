<template>
	<page-list page_class="App\AdminPage\Promotion\CatalogRuleList"
		:filter_request="filter_request">
	</page-list>
</template>

<script setup>

// Refs
const filter_request = ref(new FilterRequest());
filter_request.value.filters = [{
	field: {
		code: "type"
	},
	expression: "catalog_rule"
}];

</script>
