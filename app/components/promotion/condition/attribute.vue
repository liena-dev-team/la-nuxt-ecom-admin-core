<template>
	<div class="la-promotion-condition-attribute" v-if="condition">
		<div class="statement">
			<span> {{ condition.name }}'s </span>
			<span class="field-attribute">
				<v-select v-model="condition.attribute_code" :items="attribute_options" variant="underlined"
					hide-details="auto" density="compact" @update:model-value="onAttributeSelected">
				</v-select>
			</span>
			<span class="field-operator" v-if="selected_attribute">
				<v-select v-model="condition.operator" :items="operator_options" variant="underlined"
					hide-details="auto" density="compact" @update:model-value="onOperatorSelected">
				</v-select>
			</span>
			<span class="field-value" v-if="selected_attribute">
				<div class="string" v-if="selected_attribute.type == FIELD_INPUT_TYPE.STRING">
					<!-- String -->
					<v-text-field v-model="condition.input_value" variant="underlined" density="compact"
						hide-details="auto" clearable @blur="emitUpdate" />
				</div>
				<div class="int" v-if="selected_attribute.type == FIELD_INPUT_TYPE.INT">
					<!-- Int -->
					<v-text-field v-model="condition.input_value" variant="underlined" density="compact"
						hide-details="auto" clearable @blur="emitUpdate" />
				</div>
				<div class="decimal" v-if="selected_attribute.type == FIELD_INPUT_TYPE.DECIMAL">
					<!-- Decimal -->
					<v-text-field v-model="condition.input_value" variant="underlined" density="compact"
						hide-details="auto" clearable @blur="emitUpdate" />
				</div>
				<div class="boolean" v-if="selected_attribute.type == FIELD_INPUT_TYPE.BOOL">
					<!-- Boolean -->
					<v-checkbox v-model="condition.input_value" type="number" density="compact" hide-details="auto"
						@update:model-value="emitUpdate" />
				</div>
				<div class="date" v-if="selected_attribute.type == FIELD_INPUT_TYPE.DATE">
					<!-- Date: Format: yyyy-MM-dd -->
					<v-text-field v-model="condition.input_value" type="date" density="compact" hide-details="auto"
						clearable @blur="emitUpdate" />
				</div>
				<div class="date-time" v-if="selected_attribute.type == FIELD_INPUT_TYPE.DATE_TIME">
					<!-- Date Time: Format: yyyy-MM-ddThh:mm -->
					<v-text-field v-model="condition.input_value" type="datetime-local" density="compact" clearable
						hide-details="auto" @blur="emitUpdate" />
				</div>
				<div class="select" v-if="selected_attribute.type == FIELD_INPUT_TYPE.SELECT">
					<!-- Select -->
					<v-autocomplete v-model="condition.input_raw" :items="field_select_options" variant="underlined"
						density="compact" hide-details="auto" clearable chips closable-chips item-props
						@update:model-value="onValueSelected" @blur="emitUpdate" />
				</div>
				<div class="multi-select" v-if="selected_attribute.type == FIELD_INPUT_TYPE.MULTI_SELECT">
					<!-- Multi Select -->
					<v-autocomplete v-model="condition.input_raw" multiple :items="field_select_options"
						variant="underlined" density="comfortable" hide-details="auto" clearable chips closable-chips
						item-props @update:model-value="onValueSelected" @blur="emitUpdate" />
				</div>
				<div class="tree" v-if="selected_attribute.type == FIELD_INPUT_TYPE.TREE">
					<!-- Tree -->
					<!-- <field-tree :ref_id="field.code" ref="field_adv_tree" :field="field" :record="record"
						:mode="form_mode" @tree:open="onDislayAdvTreeDialog"
						@update:selected_nodes="onSelectedNodesChange">
					</field-tree> -->
				</div>
				<div class="lookup" v-if="selected_attribute.type == FIELD_INPUT_TYPE.LOOKUP">
					<!-- Lookup -->
					<field-lookup v-if="field_lookup" :mode="FORM_MODE.EDIT" show_result show_mode="input-text"
						v-model:selected_ids_str="condition.input_value"
						:field="field_lookup" :selected_records="condition.selected_records" @done="onFieldLookupDone">
					</field-lookup>
				</div>
			</span>
			<v-btn class="btn-remove" icon="mdi-close-circle" size="x-small" color="red" variant="text"
				@click="removeCondition" />
		</div>
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
const condition = defineModel('condition', { type: PromotionAttribute, default: null });

// Refs
const all_attributes = ref({});
const attribute_options = ref([]);
const operator_options = ref([]);
const selected_attribute = ref();

// Attr Data
const field_select_options = ref([]);
const field_lookup = ref();

// Functions
async function onAttributeSelected() {
	// Get attr by code
	selected_attribute.value = await getAttribute();

	// Set input type
	condition.value.input_type = selected_attribute.value.type;

	// Set default input value
	switch (selected_attribute.value.type) {
		case FIELD_INPUT_TYPE.STRING:
			condition.value.input_value = "";
			break;
		case FIELD_INPUT_TYPE.INT:
		case FIELD_INPUT_TYPE.DECIMAL:
			condition.value.input_value = 0;
			break;
		case FIELD_INPUT_TYPE.BOOL:
			condition.value.input_value = false;
			break;
		case FIELD_INPUT_TYPE.SELECT:
		case FIELD_INPUT_TYPE.MULTI_SELECT:
			condition.value.input_value = null;
			condition.value.input_raw = [];
			break;
		case FIELD_INPUT_TYPE.LOOKUP:
			condition.value.input_value = null;
			condition.value.input_raw = [];
			break;
	}

	// Get available operators
	getAvailableOperators();
	getAttrData();

	emitUpdate();
}

async function getAvailableOperators() {
	// Get available operators
	const available_operators = await $promotion.getOperatorsByType(selected_attribute.value.type);
	operator_options.value = [];
	for (let code in available_operators) {
		const label = available_operators[code];
		operator_options.value.push({
			title: label,
			value: code
		});
	}

	if (condition.value.operator == null) {
		condition.value.operator = operator_options.value[0].value;
	}
}

async function getAttrData() {
	let result_data = null;
	switch (selected_attribute.value.type) {
		case FIELD_INPUT_TYPE.SELECT:
		case FIELD_INPUT_TYPE.MULTI_SELECT:
		case FIELD_INPUT_TYPE.LOOKUP:
			result_data = await $promotion.getAttrData(
				condition.value.code,
				selected_attribute.value.code
			);
			break;
	}

	if (!result_data || !result_data.result) {
		return;
	}

	// Get field data
	switch (selected_attribute.value.type) {
		case FIELD_INPUT_TYPE.SELECT:
		case FIELD_INPUT_TYPE.MULTI_SELECT:
			field_select_options.value = result_data.data.options;
			break;
		case FIELD_INPUT_TYPE.LOOKUP:
			field_lookup.value = result_data.data;
			break;
	}
}

function onOperatorSelected() {
	emitUpdate();
}

function onValueSelected() {
	// Get field data
	switch (selected_attribute.value.type) {
		case FIELD_INPUT_TYPE.SELECT:
		case FIELD_INPUT_TYPE.MULTI_SELECT:
			if (condition.value.input_raw && condition.value.input_raw instanceof Array) {
				condition.value.input_value = condition.value.input_raw.join(STRING_VALUES_SEPERATOR);
			}
			break;
	}

	emitUpdate();
}

function removeCondition() {
	emit("remove", child_index);
}

function emitUpdate() {
	emit("update");
}

function onFieldLookupDone(field, selected_records) {
	condition.value.selected_records = selected_records;
}

async function getAttribute() {
	if (!condition.value) {
		return null;
	}

	for (let attr_code in all_attributes.value) {
		const attr = all_attributes.value[attr_code];
		if (attr.code == condition.value.attribute_code) {
			return attr;
		}
	}
}

onMounted(async () => {
	if (!condition.value) {
		return;
	}

	const condition_data = $promotion.all_conditions.get(condition.value.code);
	if (condition_data) {
		all_attributes.value = condition_data.attributes || {};
	}

	for (let attr_code in all_attributes.value) {
		const attr = all_attributes.value[attr_code];
		attribute_options.value.push({
			title: attr.label,
			value: attr.code,
			attr: attr
		});
	}

	attribute_options.value.sort((a, b) => {
		return a.title.localeCompare(b.title);
	});

	// If no attribute is selected, select the first
	if (!condition.value.attribute_code) {
		condition.value.attribute_code = attribute_options.value[0].value;
	}

	// Get attr by code
	selected_attribute.value = await getAttribute();

	await getAvailableOperators();
	await getAttrData();
})

</script>

<style lang="less">
.la-promotion-condition-attribute {
	padding: 0px;

	>.statement {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		width: 100%;
		flex-direction: row;
		align-items: flex-end;

		>.field-value {

			>.string,
			>.int,
			>.decimal,
			>.select,
			>.multi-select,
			>.lookup {
				min-width: 240px;
			}
		}
	}

}
</style>
