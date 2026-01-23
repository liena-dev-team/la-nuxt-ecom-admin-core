<template>
	<div class="la-field-tree" v-if="field_tree" :class="[mode]">
		<div class="tree-value">
			<div class="selected-nodes">
				<div class="node" v-for="node in selected_nodes">
					<span class="title"> {{ node.title }}</span>
					<v-btn v-if="mode == FORM_MODE.EDIT" @click="onClickRemoveSelected(node)" icon="mdi-close" size="small" density="compact"
						variant="tonal"></v-btn>
				</div>
			</div>
			<div class="actions" v-if="mode == FORM_MODE.EDIT">
				<v-btn :icon="'mdi-file-tree'" variant="tonal" density="comfortable" size="small"
					@click="onDislayAdvTreeDialog(field)">
				</v-btn>
			</div>
		</div>

		<v-dialog v-model="dialog_tree" max-width="500" eager>
			<v-card title="Select value" v-if="field_tree">
				<v-card-text>
					<advanced-tree ref="adv_trees" :ref_id="field.code" :nodes="field_tree.nodes"
						:filter_url="field_tree.filter_url" :key_id="field_tree.key_id"
						:key_title="field_tree.key_title" :key_parent_id="field_tree.key_parent_id"
						:parse_records="field_tree.parse_records" :is_draggable="field_tree.is_draggable"
						:filters="field_tree.filters" :select_type="field_tree.select_type" 
						v-model:selected_nodes="selected_nodes" :activatable="false" :node_selectable="true"
						@loaded="onTreeNodeLoaded($event, field)"
						@update:selected_nodes="onSelectedNodesChange">
					</advanced-tree>
				</v-card-text>
				<v-card-actions>
					<v-btn @click="dialog_tree = false">Close</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup>

// Model
const selected_nodes = defineModel('selected_nodes', { default: {} });
const selected_ids_str = defineModel('selected_ids_str', { default: "" });

// Emits
const emit = defineEmits(["tree:open", "update:selected_nodes"]);

// Props
const { mode, field, record } = defineProps({
	mode: {
		type: String,
		default: ""
	},
	field: {
		type: Object,
		default: null
	},
	record: {
		type: Object,
		default: null
	}
});

const field_tree = field.field_tree;

// Ref
const adv_trees_ref = useTemplateRef("adv_trees");
const dialog_tree = ref(false);

// Watch
watch(selected_ids_str, (new_value) => {
	setSelectedNodesByIds(new_value);
});

// Functions
function onClickRemoveSelected(node) {
	delete selected_nodes.value[node.id];

	const found_ref = adv_trees_ref.value;
	if (found_ref) {
		return found_ref.setSelectedNodes(selected_nodes.value);
	}
}

function onTreeNodeLoaded(all_nodes, field) {
	setSelectedNodesByIds(selected_ids_str.value);
}

function onSelectedNodesChange(new_selected_nodes) {
	let new_value = null;
	if (Object.entries(selected_nodes.value).length > 0) {
		switch (field_tree.select_type) {
			case FIELD_TREE.SELECT_TYPE_SINGLE_LEAF:
			case FIELD_TREE.SELECT_TYPE_SINGLE_INDEPENDENT:
				const first_key = Object.keys(selected_nodes.value)[0];
				const first_node = selected_nodes.value[first_key];
				new_value = first_node.id;
				break;
			case FIELD_TREE.SELECT_TYPE_LEAF:
			case FIELD_TREE.SELECT_TYPE_INDEPENDENT:
			case FIELD_TREE.SELECT_TYPE_CLASSIC:
				let ids = [];
				for (let id in selected_nodes.value) {
					const n = selected_nodes.value[id];
					ids.push(n.id);
				}

				new_value = ids.join(",");
				break;
		}
	}

	emit("update:selected_nodes", selected_nodes.value, field, new_value);
}

function onDislayAdvTreeDialog(field) {
	dialog_tree.value = true;
	const found_ref = adv_trees_ref.value;
	if (found_ref) {
		emit("tree:open", field, found_ref, record);
	}
}

function setSelectedNodesByIds(ids) {
	switch (field_tree.select_type) {
		case FIELD_TREE.SELECT_TYPE_SINGLE_LEAF:
		case FIELD_TREE.SELECT_TYPE_SINGLE_INDEPENDENT:
			ids = [Number(ids)];
			break;
		case FIELD_TREE.SELECT_TYPE_LEAF:
		case FIELD_TREE.SELECT_TYPE_INDEPENDENT:
		case FIELD_TREE.SELECT_TYPE_CLASSIC:
			ids = String(ids);
			ids = ids.split(",");
			break;
	}

	if (!(ids instanceof Array)) {
		return;
	}
	
	selected_nodes.value = {};
	for (let i in ids) {
		const node_id = ids[i];
		const found_node = searchNodeById(node_id);
		if (found_node) {
			selected_nodes.value[found_node.id] = found_node;
		}
	}
}

function searchNodeById(node_id) {
	const found_ref = adv_trees_ref.value;
	if (found_ref) {
		return found_ref.searchNodeById(node_id);
	}
}

</script>

<style lang="less">
.la-field-tree {
	border: 1px solid rgba(0, 0, 0, 0.3);
	border-radius: 8px;
	padding: 4px 4px;
	min-height: 40px;

	.tree-value {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
		justify-content: space-between;

		.selected-nodes {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;

			.node {
				display: flex;
				gap: 8px;
				padding: 4px 0px;
				align-content: center;
				align-items: center;
				border-bottom: 1px solid rgba(0, 0, 0, 0.12);
				background-color: #d3d3d382;
				padding: 4px;
				border-radius: 6px;

				.title {
					padding: 0px 4px;
				}
			}
		}

		.actions {
			display: flex;
			gap: 8px;
			align-items: center;
		}
	}

	&.view {
		pointer-events: none;
	}
}
</style>
