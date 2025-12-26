<template>
	<div class="la-promotion-action-list" :class="form_mode">
		<div class="list">
			<div class="item-action" v-for="(action, i) in actions" :key="action.id">
				<promotion-action-common :rule="rule" :rule_type="rule_type" :child_index="i"
					v-model:action="actions[i]" @remove="removeAction(i)" @update="emitUpdate"/>
			</div>
		</div>
		<div class="actions">
			<v-btn v-if="!show_add_options" class="btn-add" prepend-icon="mdi-plus" size="small" variant="elevated"
				@click="openAddAction">
				<span>Add Action</span>
			</v-btn>
			<v-select v-if="show_add_options" v-model="selected_action_code" :items="action_options" variant="outlined"
				hide-details="auto" density="compact" @update:model-value="addAction" v-click-outside="closeAddAction">
			</v-select>
		</div>
	</div>
</template>

<script setup>

// Plugins
const { $promotion } = useNuxtApp();

// Emits
const emit = defineEmits(["update"]);

// Props
const { rule, rule_type, form_mode } = defineProps({
	rule: {
		type: Object,
		default: null
	},
	rule_type: {
		type: String,
		default: PROMOTION_RULE_TYPE.CATALOG
	},
	form_mode: {
		type: String,
		default: FORM_MODE.VIEW
	}
});

// Model
const actions = defineModel('actions', { type: Array, default: [] });

// Refs
const show_add_options = ref(false);
const selected_action_code = ref("");
const action_options = ref([]);

// Functions
function openAddAction() {
	selected_action_code.value = "";
	show_add_options.value = true;
}

function closeAddAction() {
	show_add_options.value = false;
}

function addAction() {
	const new_action = $promotion.instantiateActionByCode(selected_action_code.value);
	if (!new_action) {
		return;
	}

	const list_length = actions.value.length;
	if (list_length <= 0) {
		new_action.id = 1;
	} else {
		const last_action = actions.value[list_length - 1];
		new_action.id = last_action.id + 1;
	}

	actions.value.push(new_action);

	emitUpdate();
}

function removeAction(index) {
	for (let i in actions.value) {
		if (i == index) {
			actions.value.splice(i, 1);
			break;
		}
	}

	emitUpdate();
}

function emitUpdate() {
	emit("update");
}

onMounted(() => {
	action_options.value = $promotion.getActionOptions(rule_type);
})

</script>

<style lang="less">
.la-promotion-action-list {
	display: grid;
	gap: 28px;
	padding: 20px 8px;

	&.view {
		background-color: #eee;
		filter: grayscale(1);
		border-radius: 4px;
		pointer-events: none;
	}

	>.list {
		display: grid;
		gap: 16px;

		>.item-action {
			display: grid;

			&:not(:last-child) {
				border-bottom: 1px dashed #ccc;
				padding-bottom: 16px;
			}

		}
	}

}
</style>
