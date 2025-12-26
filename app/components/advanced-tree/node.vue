<template>
	<draggable class="draggable-tree-node" :list="children" v-bind="dragOptions" group="draggable-tree" item-key="id">
		<template #item="{ element }">
			<div class="node" :style="{ 'padding-left': level == 0 ? '0px' : '0px' }"
				:class="['select-type-' + select_type, { 'selected': element.is_selected, 'open': node ? node.is_open : true, 'leaf': isLeaf(element) }]">
				<div class="title" :class="{ 'selectable': element.selectable }">
					<div class="slot-prepend" @click="clickToOpen(element)">
						<div v-if="$slots['prepend']">
							<slot name="prepend" :element="element">
							</slot>
						</div>
						<span v-else>
							<div class="btn-open" v-if="element.children && element.children.length > 0">
								<v-btn v-if="!element.is_open" :icon="element.open_icon" variant="tonal" size="small"
									density="compact">
								</v-btn>
								<v-btn v-if="element.is_open" :icon="element.close_icon" variant="tonal" size="small"
									density="compact">
								</v-btn>
							</div>
						</span>
					</div>
					<div class="checkbox">
						<v-checkbox v-model:model-value="element.is_selected" density="compact" hide-details
							@click="onSelectCheckbox(element)"></v-checkbox>
					</div>
					<div class="slot-label" @click="onNodeActivated(element)"
						:class="{ 'activatable': activatable, 'is_activated': element.is_activated }">
						<div v-if="$slots['label']">
							<slot name="label" :element="element">
							</slot>
						</div>
						<span v-else>
							{{ element.title }}
						</span>
					</div>
				</div>
				<div class="dashed-border" v-if="level != 0"></div>
				<div class="children" :class="{ 'has-children': (element.children && element.children.length > 0) }">
					<advanced-tree-node :node="element" :children="element.children" :level="level + 1"
						:select_type="select_type" @node:activated="onNodeActivated" @node:selected="onSelectCheckbox">
						<template v-if="$slots['prepend']" #["prepend"]="slot_data">
							<slot name="prepend" v-bind="slot_data || {}">
							</slot>
						</template>
						<template v-if="$slots['label']" #["label"]="slot_data">
							<slot name="label" v-bind="slot_data || {}">
							</slot>
						</template>
					</advanced-tree-node>
				</div>
			</div>
		</template>
	</draggable>
</template>

<script setup>

// Emits
const emit = defineEmits(["node:activated", "node:selected"]);

// Props
const { node, children, is_draggable, select_type, activatable,
	open_on_select
} = defineProps({
	node: {
		type: Object,
		default: null
	},
	children: {
		type: Array,
		default: []
	},
	level: {
		type: Number,
		default: 0
	},
	is_draggable: {
		type: Boolean,
		default: false
	},
	select_type: {
		type: String,
		default: FIELD_TREE.SELECT_TYPE_NONE
	},
	activatable: {
		type: Boolean,
		default: true
	},
	open_on_select: {
		type: Boolean,
		default: false
	}
});

// Refs
const dragOptions = ref({
	animation: 200,
	disabled: !is_draggable,
	ghostClass: "node-ghost"
});

// Functions
function clickToOpen(element) {
	element.is_open = !element.is_open;
}

function onNodeActivated(element) {
	if (!activatable) {
		return;
	}

	if (open_on_select) {
		element.is_open = false;
		clickToOpen(element);
	}

	emit("node:activated", element);
}

function onSelectCheckbox(element) {
	emit("node:selected", element);
}

function isLeaf(element) {
	// If this node doesn't have children, it's a leaf
	return element.children.length <= 0;
}

</script>

<style lang="less">
.draggable-tree-node {
	display: grid;
	gap: 0px;
	background-color: #fff;

	.node {
		position: relative;

		>.title {
			display: grid;
			grid-template-columns: auto auto 1fr;
			align-items: center;
			align-content: center;
			gap: 3px;
			min-height: 40px;
			z-index: 1;
			position: relative;
			background-color: #fff;
			font-size: 16px;

			.btn-open {
				display: flex;
				justify-content: center;
				width: 36px;
				background-color: #fff;
				cursor: pointer;
			}

			.checkbox {
				display: none;
				width: 36px;
				justify-content: center;
				pointer-events: none;
			}

			>.slot-label {
				display: flex;
				align-items: center;
				padding: 8px 8px;
				background-color: #fff;
				width: 100%;
				border-radius: 4px;

				&.activatable:hover {
					cursor: pointer;
					background-color: var(--la_primary_color_silver_1);
				}

				&.is_activated {
					background-color: var(--la-secondary-color);
				}
			}
		}

		>.dashed-border {
			border-bottom: 1px dashed #666;
			position: absolute;
			left: -20px;
			right: 0px;
			top: 20px;
		}

		>.children {
			margin-top: -40px;
			padding-top: 40px;
			padding-left: 20px;
			margin-left: 18px;
		}

		// Open
		&.open {
			>.children.has-children {
				border-left: 1px dashed #666;
			}
		}

		&:not(.open) {
			display: none;
		}

	}

	// Select Type None
	.node.select-type-none {}

	// Select Type Leaf
	.node.select-type-leaf,
	.node.select-type-single-leaf {

		// Only show leaf node
		&.leaf {
			>.title {
				.checkbox {
					display: flex;
					pointer-events: auto;
				}
			}
		}
	}

	// Select Type Independent
	.node.select-type-independent,
	.node.select-type-single-independent,
	.node.select-type-classic {
		>.title {
			.checkbox {
				display: flex;
				pointer-events: auto;
			}
		}
	}

	// Select Type Children-Only: show checkbox for non-root nodes only
	.node.select-type-children-only {
		>.title {
			.checkbox {
				display: flex;
				pointer-events: auto;
			}
		}

		&.is-root {
			>.title {
				.checkbox {
					display: none;
					pointer-events: none;
				}
			}
		}
	}
}

.node-ghost {
	opacity: 0.5;
	color: rgb(255, 88, 88);
}
</style>
