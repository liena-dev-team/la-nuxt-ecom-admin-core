<template>
	<div class="la-promotion-condition-product-attribute" v-if="condition">
		<div class="statement">
			<span> If an item is </span>
			<span>
				<v-select v-model="condition.action" :items="action_options" variant="underlined" hide-details="auto"
					density="compact" @update:model-value="onActionSelected">
				</v-select>
			</span>
			<span> in the cart with </span>
			<span>
				<v-select v-model="condition.aggregator" :items="aggregator_options" variant="underlined"
					hide-details="auto" density="compact" @update:model-value="onAggregatorSelected">
				</v-select>
			</span>
			<span> of these conditions true: </span>
			<v-btn class="btn-remove" icon="mdi-close-circle" size="x-small" color="red" variant="text"
				@click="removeCondition" />
		</div>
		<promotion-condition-children v-model:condition="condition" :rule="rule" :rule_type="rule_type"
			@update="emitUpdate" />
	</div>
</template>

<script setup>

// Plugins
const { $promotion } = useNuxtApp();

// Emits
const emit = defineEmits(["update", "remove"]);

// Props
const { rule, rule_type, child_index } = defineProps({
	rule: {
		type: Object,
		default: null
	},
	rule_type: {
		type: String,
		default: PROMOTION_RULE_TYPE.CATALOG
	},
	child_index: {
		type: Number,
		default: -1
	}
});

// Model
const condition = defineModel('condition', { type: PromotionConditionProductAttribute, default: null });

// Refs
const all_aggregators = ref({});
const all_actions = ref({});
const aggregator_options = ref([]);
const action_options = ref([]);

// Functions
function onActionSelected() {
	emitUpdate();
}

function onAggregatorSelected() {
	emitUpdate();
}

function removeCondition() {
	emit("remove", child_index);
}

function emitUpdate() {
	emit("update");
}

onMounted(() => {
	if (!condition.value) {
		return;
	}

	// Get condition data
	const condition_data = $promotion.all_conditions.get(condition.value.code);
	if (condition_data) {
		all_aggregators.value = condition_data.aggregators || {};
		all_actions.value = condition_data.actions || {};
	}

	// Assign 'aggregator' options and default value
	for (let key in all_aggregators.value) {
		const value = all_aggregators.value[key];
		aggregator_options.value.push({
			title: value,
			value: key
		});
	}

	if (!condition.value.aggregator) {
		condition.value.aggregator = aggregator_options.value?.[0]?.value;
	}

	// Assign 'action' options and default value
	for (let key in all_actions.value) {
		const value = all_actions.value[key];
		action_options.value.push({
			title: value,
			value: key
		});
	}
	
	if (!condition.value.action) {
		condition.value.action = action_options.value?.[0]?.value;
	}
})

</script>

<style lang="less">
.la-promotion-condition-product-attribute {
	display: grid;
	gap: 2px;
	padding: 0px;

	>.statement {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		width: 100%;
		flex-direction: row;
		align-items: flex-end;
	}
}
</style>
