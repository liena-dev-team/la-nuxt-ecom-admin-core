<template>
	<v-treeview v-model:selected="internal_selected_ids" :items="items" :item-title="item_title"
		:item-value="item_value" :select-strategy="select_strategy" :open-all="open_all" :selectable="selectable" />
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'

const {
	items,
	itemTitle: item_title,
	itemValue: item_value,
	selectStrategy: select_strategy,
	openAll: open_all,
	selectable,
} = defineProps({
	items: { type: Array, default: () => [] },
	itemTitle: { type: String, default: 'label' },
	itemValue: { type: String, default: 'id' },
	selectStrategy: { type: String, default: 'classic' },
	openAll: { type: Boolean, default: true },
	selectable: { type: Boolean, default: true }
});

// External model: object map { id: { id } }
const selected_nodes = defineModel('selected_nodes', { default: {} });
// const emit = defineEmits(['loaded']);
const internal_selected_ids = ref([]);
const syncing_from_internal = ref(false);
const syncing_from_external = ref(false);

function normalize_id(k) {
	return (typeof k === 'string' && /^\d+$/.test(k)) ? Number(k) : k;
}

// Sync external -> internal
function maps_equal(a, b) {
	if (a === b) return true;
	if (!a || !b) return false;
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	if (aKeys.length !== bKeys.length) return false;
	for (const k of aKeys) if (!b[k]) return false;
	return true;
}

watch(selected_nodes, (map) => {
	if (syncing_from_internal.value) return;
	syncing_from_external.value = true;
	if (!map || typeof map !== 'object') {
		if (internal_selected_ids.value.length) internal_selected_ids.value = [];
		syncing_from_external.value = false;
		return;
	}
	const new_ids = Object.keys(map).map(normalize_id);
	const current_ids = internal_selected_ids.value;
	if (new_ids.length !== current_ids.length || new_ids.some((id, i) => id !== current_ids[i])) {
		internal_selected_ids.value = new_ids;
	}
	syncing_from_external.value = false;
}, { immediate: true, deep: true });

// Sync internal -> external (user interaction)
watch(internal_selected_ids, (ids) => {
	if (syncing_from_external.value) return; // prevent loop
	syncing_from_internal.value = true;
	const out = {};
	ids.forEach(id => { out[String(id)] = { id }; });
	if (!maps_equal(selected_nodes.value, out)) {
		selected_nodes.value = out;
	}
	syncing_from_internal.value = false;
});

function getNodes() { return items; }
defineExpose({ getNodes });


</script>