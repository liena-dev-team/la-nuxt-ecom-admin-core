<template>
	<div>
		<v-sheet class="mb-2">
			<v-toolbar title="BC Table" density="compact" class="mb-2"></v-toolbar>
			<v-select label="Select" max-width="400" density="compact" :items="bc_tables"
				:hide-details="true" @update:modelValue="changeTable" return-object>
			</v-select>
		</v-sheet>
		<page-list v-if="selected_table" :page_class="selected_table.class" :has_card_page="false"
			:show_toolbar="false" :editable="false" :insertable="false" :deletable="false">
		</page-list>
	</div>
</template>

<script setup>

const bc_tables = [
	{
		title: "BC Item",
		value: "bc_item",
		class: "App\\AdminPage\\BC\\BcItemList"
	},
	{
		title: "BC Item Variant",
		value: "bc_item_variant",
		class: "App\\AdminPage\\BC\\BcItemVariantList"
	},
	{
		title: "BC Item Category",
		value: "bc_item_category",
		class: "App\\AdminPage\\BC\\BcItemCategoryList"
	},
	{
		title: "BC Price List Line",
		value: "bc_price_list_line",
		class: "App\\AdminPage\\BC\\BcPriceListLineList"
	}
];

// Ref
const selected_table = ref();

function changeTable(e) {
	selected_table.value = null;
	nextTick(() => {
		selected_table.value = e;
	})
}

</script>
