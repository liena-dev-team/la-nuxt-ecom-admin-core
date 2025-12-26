<template>
	<page-list ref="rule_list" page_class="App\AdminPage\Promotion\CartRuleList"
		:filter_request="filter_request"
		v-model:selected_records="selected_records">
		<!-- Actions -->
		<template #["action:duplicate"]>
			<v-btn v-if="selected_records && selected_records.length > 0" size="small" variant="elevated"
				color="primary" @click="duplicatePromotion">
				<span>Duplicate</span>
			</v-btn>
		</template>
	</page-list>
</template>

<script setup>

// Plugins
const { $promotion } = useNuxtApp();

// Template Ref
const rule_list = useTemplateRef("rule_list");

// Refs
const filter_request = ref(new FilterRequest());
filter_request.value.filters = [{
	field: {
		code: "type"
	},
	expression: "cart_rule"
}];

const selected_records = ref([]);

// Functions
async function duplicatePromotion() {
	// Only duplicate first selected record
	if (!selected_records.value) {
		return;
	}

	const first_rule = selected_records.value[0];
	const duplicate_reponse = await $promotion.duplicatePromotion(first_rule.id);
	if (duplicate_reponse.result) {
		rule_list.value.onDoFilter();
	}
}

</script>
