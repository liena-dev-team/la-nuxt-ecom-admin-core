<template>
	<v-sheet class="mx-auto">
		<v-container fluid>
			<v-row>
				<v-col cols="12" md="3" class="pa-2">
					<v-card>
						<v-card-title>Categories</v-card-title>
						<v-card-text>
							<advanced-tree ref="advanced_tree" :filter_url="FILTER_URL" key_title="name"
								:activatable="true" @node:activated="onSelectCategory">
							</advanced-tree>
						</v-card-text>
						<v-divider></v-divider>
						<v-card-actions>
							<v-btn @click="newCategory">New Category</v-btn>
						</v-card-actions>
					</v-card>
				</v-col>
				<v-spacer></v-spacer>
				<v-col cols="12" md="9" class="pa-2">
					<page-card v-show="last_selected_id" ref="category_card" :go_back="false" 
						page_class="App\AdminPage\Faq\FaqCategoryCard" :caption_fields="['name']"
						@field:changed="onFieldUpdated" @record:created="onCardUpdated" @record:deleted="onCardDeleted"
						@field:tree:display="onDislayAdvTreeDialog">
					</page-card>
				</v-col>
			</v-row>
		</v-container>
	</v-sheet>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// Constants
const FILTER_URL = "/admin/faq/category/filter";

// Template Ref
const category_card = useTemplateRef("category_card");
const advanced_tree = useTemplateRef("advanced_tree");
const route = useRoute();

// Refs
const last_selected_id = ref();

function onSelectCategory(node) {
	try {
		if (!node.is_activated) {
			// If not selected
			last_selected_id.value = null;
			return;
		}

		last_selected_id.value = node.id;
		if (last_selected_id.value) {
			category_card.value.loadById(last_selected_id.value);
		}
	} catch (error) {
		console.log(error);
	}
}

function onFieldUpdated(field, current_value) {
	if (field.code == "parent_id"
		|| field.code == "name"
	) {
		advanced_tree.value.getNodes();
	}
}

function onCardUpdated() {
	advanced_tree.value.getNodes();
}

function onCardDeleted() {
	last_selected_id.value = null;
	advanced_tree.value.getNodes();
}

function onDislayAdvTreeDialog(field, adv_tree, record_value) {
	const id_value = record_value["id"];
	adv_tree.getNodes([
		{
			field: {
				code: "id"
			},
			expression: "<> " + id_value
		}
	]);
}

function newCategory() {
	category_card.value.resetForm();
	last_selected_id.value = -1;
}

onMounted(() => {
	if (route.query.id) {
		last_selected_id.value = route.query.id;
	}
});

</script>