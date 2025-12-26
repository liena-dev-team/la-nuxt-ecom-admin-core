<template>
	<div class="la-promotion-condition-combination" v-if="combination">
		<div class="statement">
			<span> If </span>
			<span>
				<v-select v-model="combination.aggregator" :items="aggregator_options" variant="underlined"
					hide-details="auto" density="compact" @update:model-value="onAggregatorSelected">
				</v-select>
			</span>
			<span> of these conditions are </span>
			<span>
				<v-select v-model="combination.value" :items="value_options" variant="underlined" hide-details="auto"
					density="compact" @update:model-value="onValueSelected">
				</v-select>
			</span>
			<span>
				<span>:</span>
				<v-btn v-if="child_index >= 0" class="btn-remove" icon="mdi-close-circle" size="x-small" color="red"
					variant="text" @click="removeCondition" />
			</span>
		</div>
		<promotion-condition-children v-model:condition="combination" :rule="rule" :rule_type="rule_type"
			:is_apply_condition="is_apply_condition" @update="emitUpdate" />
	</div>
</template>

<script setup>

// Plugins
const { $promotion } = useNuxtApp();

// Emits
const emit = defineEmits(["update", "remove"]);

// Props
const { rule, rule_type, child_index, is_apply_condition } = defineProps({
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
	},
	is_apply_condition: {
		type: Boolean,
		default: false
	}
});

// Model
const combination = defineModel('condition', { type: PromotionCombination, default: null });

// Refs
const all_aggregators = ref({});
const all_values = ref({});
const aggregator_options = ref([]);
const value_options = ref([]);

// Functions
function onAggregatorSelected() {
	emitUpdate();
}

function onValueSelected() {
	emitUpdate();
}

function removeCondition() {
	emit("remove", child_index);
}

function emitUpdate() {
	emit("update");
}

onMounted(() => {
	if (!combination.value) {
		return;
	}

	const condition_data = $promotion.all_conditions.get(combination.value.code);
	if (condition_data) {
		all_aggregators.value = condition_data.aggregators || {};
		all_values.value = condition_data.values || {};
	}

	for (let key in all_aggregators.value) {
		const value = all_aggregators.value[key];
		aggregator_options.value.push({
			title: value,
			value: key
		});
	}

	if (combination.value.aggregator == null) {
		combination.value.aggregator = aggregator_options?.value?.[0]?.value;
	}

	for (let key in all_values.value) {
		const value = all_values.value[key];
		value_options.value.push({
			title: value,
			value: key
		});
	}

	if (combination.value.value == null) {
		combination.value.value = value_options?.value?.[0]?.value;
	}
})

</script>

<style lang="less">
.la-promotion-condition-combination {
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

	// Vuetify Modification
	.v-input__control {
		.v-field__append-inner {
			display: none !important;
		}
	}

	.v-btn.v-btn--icon {
		background-color: #ffffff00;
	}
}
</style>
