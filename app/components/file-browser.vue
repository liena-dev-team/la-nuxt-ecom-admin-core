<template>
	<v-sheet class="la-file-browser">
		<v-container fluid class="pa-0">
			<v-row>
				<v-col cols="12" md="4" class="pa-2">
					<file-browser-tree ref="ref_tree" @selected="onNodeSelected" />
				</v-col>
				<v-spacer></v-spacer>
				<v-col cols="12" md="8" class="pa-2">
					<file-browser-grid ref="ref_grid" v-model:selected_item="selected_item"
						:field_media_file="field_media_file" @folder:new="onNewFolder" @folder:delete="onDeleteFolder"
						@items:selected="onSelectItems" />
				</v-col>
			</v-row>
		</v-container>
	</v-sheet>
</template>

<script setup>

// Emits
const emit = defineEmits(["items:selected"]);

// Template Ref
const ref_tree = useTemplateRef("ref_tree");
const ref_grid = useTemplateRef("ref_grid");

// Props
const { title, field_media_file } = defineProps({
	title: {
		type: String,
		default: 'File Browser',
	},
	field_media_file: {
		type: Object,
		default: null,
	},
});

const selected_item = defineModel('selected_item', { default: [] });

// Functions
function onNodeSelected(node) {
	console.log("node",node);
	ref_grid.value.setCurrentFolder(node);
}

function onNewFolder() {
	ref_tree.value.openSelectedFolder();
}

function onDeleteFolder() {
	ref_tree.value.onDeleteFolder();
}

function onSelectItems(item) {
	emit("items:selected", item);
}

</script>

<style lang="less">
.la-file-browser {}
</style>
