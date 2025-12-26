<template>
	<v-row class="fields cart-rule align-center" no-gutters v-if="action">
		<!-- NOTE: not for Action Gift -->
		<template v-if="!(action instanceof PromotionActionCartGift)">
			<!-- Max Discount Amount -->
			<v-col cols="2" class="col-label pa-2 max-discount-amount">
				<div class="caption">
					<span class="label">Max Discount Amount</span>
					<span class="dots"></span>
				</div>
			</v-col>
			<v-col cols="4" class="col-field pa-2 max-discount-amount">
				<div class="control">
					<div class="int">
						<v-text-field v-model="action.max_discount_amount" type="number" density="compact"
							hide-details="auto" @update:model-value="emitUpdate" />
					</div>
				</div>
			</v-col>
			<!-- Max Qty -->
			<template v-if="!action.apply_to_quote">
				<v-col cols="2" class="col-label pa-2 max-qty">
					<div class="caption">
						<span class="label">Max Qty</span>
						<span class="dots"></span>
					</div>
				</v-col>
				<v-col cols="4" class="col-field pa-2 max-qty">
					<div class="control">
						<div class="int">
							<v-text-field v-model="action.max_qty" type="number" density="compact" hide-details="auto"
								@update:model-value="emitUpdate" />
						</div>
					</div>
				</v-col>
			</template>
			<!-- Calculation Discount Type -->
			<template v-if="!action.apply_to_quote">
				<v-col cols="2" class="col-label pa-2 calculation-discount-type">
					<div class="caption">
						<span class="label">Calculation Discount Type</span>
						<span class="dots"></span>
					</div>
				</v-col>
				<v-col cols="4" class="col-field pa-2 calculation-discount-type">
					<div class="control">
						<div class="select">
							<v-select v-model="action.calculation_discount_type"
								:items="calculation_discount_type_options" variant="underlined" hide-details="auto"
								density="compact" @update:model-value="emitUpdate">
							</v-select>
						</div>
					</div>
				</v-col>
			</template>
			<!-- Calculation Sort Type -->
			<template v-if="!action.apply_to_quote">
				<v-col cols="2" class="col-label pa-2 calculation-sort-type">
					<div class="caption">
						<span class="label">Calculation Sort Type</span>
						<span class="dots"></span>
					</div>
				</v-col>
				<v-col cols="4" class="col-field pa-2 calculation-sort-type">
					<div class="control">
						<div class="select">
							<v-select v-model="action.calculation_sort_type" :items="calculation_sort_type_options"
								variant="underlined" hide-details="auto" density="compact"
								@update:model-value="emitUpdate">
							</v-select>
						</div>
					</div>
				</v-col>
			</template>
		</template>
		<!-- Apply Condition -->
		<template v-if="!action.apply_to_quote">
			<v-col cols="12" class="col-label pa-2 apply-condition">
				<div class="caption">
					<span class="label">Only apply to lines satifisfy the following condition:</span>
					<span class="dots"></span>
				</div>
			</v-col>
			<v-col cols="12" class="col-field pa-2 apply-condition">
				<div class="control">
					<promotion-condition-combination v-model:condition="action.apply_condition" :rule="rule"
						:rule_type="rule_type" :is_apply_condition="true" @update="emitUpdate" />
				</div>
			</v-col>
		</template>
	</v-row>
</template>

<script setup>

// Plugins
const { $promotion } = useNuxtApp();

// Emits
const emit = defineEmits(["update"]);

// Props
const { rule, rule_type } = defineProps({
	rule: {
		type: Object,
		default: null
	},
	rule_type: {
		type: String,
		default: PROMOTION_RULE_TYPE.CATALOG
	}
});

// Model
const action = defineModel('action', { type: PromotionAction, default: null });

// Refs
const calculation_discount_types = ref({});
const calculation_sort_types = ref({});
const calculation_discount_type_options = ref([]);
const calculation_sort_type_options = ref([]);

// Functions

function emitUpdate() {
	emit("update");
}

onMounted(() => {
	if (!action.value) {
		return;
	}

	calculation_discount_type_options.value = [];
	calculation_sort_type_options.value = [];

	const action_data = $promotion.all_actions.get(action.value.code);
	if (action_data) {
		calculation_discount_types.value = action_data.calculation_discount_types || {};
		calculation_sort_types.value = action_data.calculation_sort_types || {};
	}

	for (let key in calculation_discount_types.value) {
		const label = calculation_discount_types.value[key];
		calculation_discount_type_options.value.push({
			title: label,
			value: key
		});
	}

	if (!action.value.calculation_discount_type) {
		action.value.calculation_discount_type = calculation_discount_type_options.value[0].value;
	}

	for (let key in calculation_sort_types.value) {
		const label = calculation_sort_types.value[key];
		calculation_sort_type_options.value.push({
			title: label,
			value: key
		});
	}

	if (!action.value.calculation_sort_type) {
		action.value.calculation_sort_type = calculation_sort_type_options.value[0].value;
	}

	if (action.value.max_discount_amount == null) {
		action.value.max_discount_amount = 0;
	}

	if (action.value.max_qty == null) {
		action.value.max_qty = 0;
	}
})

</script>

<style lang="less">
.la-promotion-action-cart {
	>.id-container {
		display: flex;
		gap: 12px;
		align-items: center;
		height: 40px;

		>.id {
			border-radius: 4px;
			padding: 4px 12px;
			background-color: var(--la_accent_color_1);
			color: #fff;
			font-weight: bold;
			font-size: 16px;
		}

		>.name {
			font-weight: bold;
			font-size: 16px;
		}
	}

}
</style>
