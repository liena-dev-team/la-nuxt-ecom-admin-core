<template>
	<th class="header-field" :class="{
		'sticky-header': header?.is_sticky,
		'is-dropdown': header?.is_dropdown,
		'is-checkbox': header?.is_checkbox,
		'show-selectbox': show_selectbox
	}" :style="header_style">

		<div v-if="!header?.is_dropdown && !header?.is_checkbox" style="margin-right: 4px">
			<v-menu activator="parent" @update:model-value="onClickActivate">
				<template v-slot:activator="">
					<div class="field-body">
						<div class="name">
							<div class="label">{{ header?.field.caption }}</div>
							<div v-if="filter" class="filter">
								<v-icon icon="mdi-filter" size="x-small"></v-icon>
							</div>
							<div v-if="header?.sort" class="sort">
								<v-icon icon="mdi-arrow-up" size="x-small"
									v-if="header.sort == FIELD_SORT.ASCENDING"></v-icon>
								<v-icon icon="mdi-arrow-down" size="x-small"
									v-if="header.sort == FIELD_SORT.DESCENDING"></v-icon>
							</div>
						</div>
						<div class="actions">
							<v-icon icon="mdi-chevron-down" size="x-small"></v-icon>
						</div>
					</div>
				</template>

				<v-list class="sub-menu-list" @click:select="selectMenuItem">
					<v-list-item v-for="(item, index) in items" :key="index" :value="index">
						<template v-slot:prepend>
							<v-icon :icon="item.icon" size="x-small"></v-icon>
						</template>
						<v-list-item-title>{{ item.title }}</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
		</div>

		<!-- Checkbox: Select All -->
		<div v-if="header?.is_checkbox && show_selectbox && select_multiple" class="field-checkbox">
			<input type="checkbox" v-model="is_selected_all" @change="onSelectAll" />
		</div>
		
		<div class="resizer" @mousedown="onResizeMouseDown"></div>
	</th>
</template>

<script setup>

// Constants
const MENU_ITEM_CLEAR_SORT = { title: 'Clear Sort', icon: 'mdi-sort-variant-remove' };
const MENU_ITEM_CLEAR_ALL_SORTS = { title: 'Clear All Sorts', icon: 'mdi-sort-variant-off' };
const MENU_ITEM_FILTER = { title: 'Filter...', icon: 'mdi-filter' };
const MENU_ITEM_CLEAR_FILTER = { title: 'Clear Filter', icon: 'mdi-filter-off' };

// Props
const { header, show_selectbox, filter } = defineProps({
	header: Object,
	show_selectbox: {
		type: Boolean,
		default: false
	},
	select_multiple: {
		type: Boolean,
		default: false
	},
	filter: {
		type: Object,
		default: null
	},
});

// Refs
const items = ref({
	"asc": { title: 'Ascending', icon: 'mdi-sort-alphabetical-ascending' },
	"desc": { title: 'Descending', icon: 'mdi-sort-alphabetical-descending' },
});

const is_selected_all = ref(false);
const initial_header_width = ref(header?.width || 0);
const is_resizing = ref(false);
const resized_x = ref(0);

// Computed
const header_style = computed(() => {
	return {
		'width': header?.width ? (header?.width + 'px') : '0',
		'left': header?.left ? (header?.left + 'px') : '0'
	}
})

// Emits
const emit = defineEmits(['menu-item-selected', 'selected-all']);

// Functions
function selectMenuItem(e) {
	switch (e.id) {
		case PAGE_LIST_HEADER_MENU_ITEM_TYPE.ASC: // Sort Ascending
			header.sort = FIELD_SORT.ASCENDING;
			break;
		case PAGE_LIST_HEADER_MENU_ITEM_TYPE.DESC: // Sort Descending
			header.sort = FIELD_SORT.DESCENDING;
			break;
		case PAGE_LIST_HEADER_MENU_ITEM_TYPE.CLEAR_SORT:
			header.sort = "";
			break;
		case PAGE_LIST_HEADER_MENU_ITEM_TYPE.FILTER: // Filter
			break;
	}

	emit('menu-item-selected', header, e);
}

function onClickActivate() {
	if (header.sort) {
		// add 'clear sort'
		items.value[PAGE_LIST_HEADER_MENU_ITEM_TYPE.CLEAR_SORT] = MENU_ITEM_CLEAR_SORT;
		items.value[PAGE_LIST_HEADER_MENU_ITEM_TYPE.CLEAR_ALL_SORTS] = MENU_ITEM_CLEAR_ALL_SORTS;
	} else {
		// remove 'clear sort'
		delete items.value[PAGE_LIST_HEADER_MENU_ITEM_TYPE.CLEAR_SORT];
		delete items.value[PAGE_LIST_HEADER_MENU_ITEM_TYPE.CLEAR_ALL_SORTS];
	}

	if (filter) {
		items.value[PAGE_LIST_HEADER_MENU_ITEM_TYPE.CLEAR_FILTER] = MENU_ITEM_CLEAR_FILTER;
		delete items.value[PAGE_LIST_HEADER_MENU_ITEM_TYPE.FILTER];
	} else {
		items.value[PAGE_LIST_HEADER_MENU_ITEM_TYPE.FILTER] = MENU_ITEM_FILTER;
		delete items.value[PAGE_LIST_HEADER_MENU_ITEM_TYPE.CLEAR_FILTER];
	}
}

function onSelectAll() {
	emit('selected-all', is_selected_all.value);
}

function onResizeMouseDown(e) {
	resized_x.value = e.pageX;

	is_resizing.value = true;
	document.removeEventListener("mouseup", onResizeMouseUp);
	document.addEventListener("mouseup", onResizeMouseUp);

	document.removeEventListener("mousemove", onResizeMouseMove);
	document.addEventListener("mousemove", onResizeMouseMove);
}

function onResizeMouseMove(e) {
	if (!resized_x.value) {
		return;
	}

	var diffX = e.pageX - resized_x.value;
	header.width = initial_header_width.value + diffX;
}

function onResizeMouseUp(e) {
	is_resizing.value = false;
	resized_x.value = null;
	initial_header_width.value = header.width;
	document.removeEventListener("mouseup", onResizeMouseUp);
	document.removeEventListener("mousemove", onResizeMouseMove);
}

</script>

<style scoped lang="less">
.header-field {
	min-width: 20px;
	top: 0px;
	position: sticky;
	background-color: #ffffff;
	user-select: none;
	overflow: hidden;

	// Is Sticky
	&.sticky-header {
		z-index: 100;
		background-color: var(--la_primary_color_silver_1);
	}

	// Check box
	&.is-checkbox {
		display: none;
	}

	&.show-selectbox {
		display: table-cell;
	}

	.field-body {
		display: flex;
		min-width: 40px;
		gap: 0px;
		cursor: pointer;
		justify-content: space-between;
		padding: 4px 8px;

		&:last-child {
			border-right: none;
		}

		.name {
			display: flex;
			flex-wrap: nowrap;
			min-height: 30px;
			align-items: flex-end;
			justify-content: flex-start;
			gap: 4px;
		}

		.actions {
			display: none;
			position: relative;

			.mdi-chevron-down {
				margin-bottom: 5px;
			}
		}

	}

	/// On hover
	&:hover:not(.is-dropdown, .is-checkbox) {
		background-color: var(--la_primary_color_silver_2);

		.actions {
			display: flex;
			align-items: flex-end;
		}
	}

	.resizer {
		position: absolute;
		height: 100%;
		top: 0px;
		right: 0px;
		width: 4px;
		cursor: col-resize;
		user-select: none;
		border-right: 1px solid var(--la_primary_color_silver_1);

		&:hover {
			border-right-color: var(--la_neutral_color_3);
			border-width: 3px;
		}
	}
}

.field-checkbox {
	margin-top: 12px;
	text-align: left;
    padding-left: 10px;

	input {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}
}

.sub-menu-list {
	max-width: 200px;
	user-select: none;
}
</style>
