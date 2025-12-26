<template>
	<div class="la-promotion-condition-product-subselection" v-if="condition">
		<div class="statement">
			<span> If </span>
			<span>
				<!-- Total type -->
				<v-select v-model="condition.total_type" :items="total_type_options" variant="underlined"
					hide-details="auto" density="compact" @update:model-value="onActionSelected">
				</v-select>
			</span>
			<span>
				<!-- Operator -->
				<v-select v-model="condition.operator" :items="operator_options" variant="underlined"
					hide-details="auto" density="compact" @update:model-value="onActionSelected">
				</v-select>
			</span>
			<span style="min-width: 140px">
				<!-- Total value -->
				<v-text-field v-model="condition.total_value" variant="underlined" density="compact" 
					hide-details="auto" clearable @blur="emitUpdate"/>
			</span>
			<span> for a subselection of items in cart matching </span>
			<span>
				<!-- Aggregator -->
				<v-select v-model="condition.aggregator" :items="aggregator_options" variant="underlined"
					hide-details="auto" density="compact" @update:model-value="onAggregatorSelected">
				</v-select>
			</span>
			<span> of these conditions: </span>
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
const condition = defineModel('condition', { type: PromotionConditionProductSubselection, default: null });

// Refs
const all_total_types = ref({});
const all_operators = ref([]);
const all_aggregators = ref({});
const total_type_options = ref([]);
const operator_options = ref([]);
const aggregator_options = ref([]);

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

	total_type_options.value = [];
	operator_options.value = [];
	aggregator_options.value = [];

	// Get condition data
	const condition_data = $promotion.all_conditions.get(condition.value.code);
	if (condition_data) {
		all_total_types.value = condition_data.total_types || {};
		all_operators.value = condition_data.operators || [];
		all_aggregators.value = condition_data.aggregators || {};
	}

	// Assign 'total types' options and default value
	for (let key in all_total_types.value) {
		const value = all_total_types.value[key];
		total_type_options.value.push({
			title: value,
			value: key
		});
	}

	if (!condition.value.total_type) {
		condition.value.total_type = total_type_options.value?.[0]?.value;
	}

	// Assign 'operators' options and default value
	for (let key in all_operators.value) {
		const value = all_operators.value[key];
		operator_options.value.push({
			title: value,
			value: value
		});
	}
	
	if (!condition.value.operator) {
		condition.value.operator = operator_options.value?.[0]?.value;
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

})

</script>

<style lang="less">
.la-promotion-condition-product-subselection {
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
