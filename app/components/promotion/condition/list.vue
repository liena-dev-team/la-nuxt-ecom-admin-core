<template>
	<div class="la-promotion-condition-list" :class="form_mode">
		<div class="list">
			<div class="item-condition" v-for="(condition, i) in conditions" :key="condition.id">
				<div class="id">
					{{ condition.id }}
				</div>
				<promotion-condition-combination v-model:condition="conditions[i]" :rule="rule" :rule_type="rule_type"
					:child_index="i" @remove="removeTriggerCondition" @update="emitUpdate" />
			</div>
		</div>
		<div>
			<v-btn prepend-icon="mdi-plus" size="small" variant="elevated" @click="addTriggerCondition">
				<span>Add Trigger</span>
			</v-btn>
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
const conditions = defineModel('conditions', { type: Array, default: [] });

// Function
function addTriggerCondition() {
	const combination = $promotion.instantiateConditionByCode(PromotionCombination.CODE);
	const list_length = conditions.value.length;
	if (list_length <= 0) {
		combination.id = 1;
	} else {
		const last_condition = conditions.value[list_length - 1];
		combination.id = last_condition.id + 1;
	}

	conditions.value.push(combination);

	emitUpdate();
}

function removeTriggerCondition(index) {
	for (let i in conditions.value) {
		if (i == index) {
			conditions.value.splice(i, 1);
			break;
		}
	}

	emitUpdate();
}

function emitUpdate() {
	emit("update");
}

</script>

<style lang="less">
.la-promotion-condition-list {
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
		
		>.item-condition {
			display: flex;
			align-items: flex-start;
			padding-bottom: 24px;
			gap: 12px;
			
			&:not(:last-child) {
				border-bottom: 1px dashed #ccc;
				padding-bottom: 16px;
			}

			.id {
				border-radius: 4px;
				padding: 4px 12px;
				background-color: var(--la_primary_color);
				color: #fff;
				font-weight: bold;
				font-size: 16px;
			}
		}
	}

}
</style>
