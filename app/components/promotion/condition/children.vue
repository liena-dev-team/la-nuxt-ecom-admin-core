<template>
	<div class="la-promotion-condition-children">
		<ol class="children">
			<template v-for="(child_condition, i) in condition.children" :key="child_condition">
				<li v-if="(child_condition instanceof PromotionCombination)">
					<promotion-condition-combination v-model:condition="condition.children[i]" :rule="rule" 
						:is_apply_condition="is_apply_condition"
						:rule_type="rule_type" :child_index="i" @remove="removeCondition" @update="emitUpdate" />
				</li>
				<li v-if="(child_condition instanceof PromotionAttribute)">
					<promotion-condition-attribute v-model:condition="condition.children[i]" :rule="rule"
						:rule_type="rule_type" :child_index="i" @remove="removeCondition" @update="emitUpdate" />
				</li>
				<li v-if="(child_condition instanceof PromotionConditionProductAttribute)">
					<promotion-condition-product-attribute v-model:condition="condition.children[i]" :rule="rule"
						:rule_type="rule_type" :child_index="i" @remove="removeCondition" @update="emitUpdate" />
				</li>
				<li v-if="(child_condition instanceof PromotionConditionProductSubselection)">
					<promotion-condition-product-subselection v-model:condition="condition.children[i]" :rule="rule"
						:rule_type="rule_type" :child_index="i" @remove="removeCondition" @update="emitUpdate" />
				</li>
			</template>
		</ol>
		<div class="actions" v-if="children_options.length">
			<v-btn v-if="!show_add_options" class="btn-add" icon="mdi-plus-circle" size="small" variant="flat" density="comfortable"
				@click="openAddCondition" />
			<v-select v-if="show_add_options" v-model="selected_child_code" :items="children_options" variant="outlined"
				hide-details="auto" density="compact" @update:model-value="onChildSelected"
				v-click-outside="closeAddCondition">
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
const { rule, rule_type, is_apply_condition } = defineProps({
	rule: {
		type: Object,
		default: null
	},
	rule_type: {
		type: String,
		default: PROMOTION_RULE_TYPE.CATALOG
	},
	is_apply_condition: {
		type: Boolean,
		default: false
	}
});

// Model
const condition = defineModel('condition', { type: PromotionCondition, default: null });

// Refs
const show_add_options = ref(false);
const selected_child_code = ref("");
const children_options = ref([]);
const cart_rule_trigger_conditions = ref([]);
const cart_rule_apply_conditions = ref([]);
const catalog_rule_conditions = ref([]);

// Functions
function openAddCondition() {
	selected_child_code.value = "";
	show_add_options.value = true;
}

function closeAddCondition() {
	show_add_options.value = false;
}

function onChildSelected() {
	let selected_child;
	for (let i in children_options.value) {
		const option = children_options.value[i];
		if (option.value == selected_child_code.value) {
			const class_type = option.class_type;
			const data = option.data;

			selected_child = new class_type(data);
			break;
		}
	}

	if (!condition.value.children) {
		condition.value.children = [];
	}

	condition.value.children.push(selected_child);
	emitUpdate();
}

function removeCondition(index) {
	for (let i in condition.value.children) {
		if (i == index) {
			condition.value.children.splice(i, 1);
			emitUpdate();
			break;
		}
	}
}

function emitUpdate() {
	emit("update");
}

onMounted(() => {
	children_options.value = [{
		title: "Please select a condition...",
		value: ""
	}];

	const condition_data = $promotion.all_conditions.get(condition.value.code);
	if (condition_data) {
		cart_rule_trigger_conditions.value = condition_data.cart_rule_trigger_conditions || [];
		cart_rule_apply_conditions.value = condition_data.cart_rule_apply_conditions || [];
		catalog_rule_conditions.value = condition_data.catalog_rule_conditions || [];
	}

	let condition_codes = [];
	switch (rule_type) {
		case PROMOTION_RULE_TYPE.CART:
			if (is_apply_condition) {
				condition_codes = cart_rule_apply_conditions.value;
			} else {
				condition_codes = cart_rule_trigger_conditions.value;
			}
			break;
		case PROMOTION_RULE_TYPE.CATALOG:
			condition_codes = catalog_rule_conditions.value;
			break;
	}
	
	for (let i in condition_codes) {
		const condition_code = condition_codes[i];
		const condition_data = $promotion.all_conditions.get(condition_code);
		if (condition_data) {
			children_options.value.push({
				title: condition_data.name,
				value: condition_data.code,
				class_type: condition_data.class_type,
				data: condition_data
			});
		}
	}

})

</script>

<style lang="less">
.la-promotion-condition-children {
	>.children {
		display: grid;
		gap: 8px;
		list-style: disc;
		padding-left: 28px;
	}

	>.actions {
		margin-top: 2px;
	}
}
</style>
