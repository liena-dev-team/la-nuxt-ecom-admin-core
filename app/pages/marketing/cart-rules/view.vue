<template>
	<div>
		<page-card ref="ref_page" v-model:record="record" v-model:form_mode="form_mode" v-model:page_path="page_path"
			v-model:is_saved="is_saved" :go_back="true" :auto_save="false" page_class="App\AdminPage\Promotion\CartRuleCard"
			@record:changed="onRecordChanged" @update:before="saveConditionsAndActions" 
			@field:changed="onFieldChange" @create:before="saveConditionsAndActions">
			<!-- Actions -->
			<template #["action:duplicate"]>
				<v-btn v-if="record" size="small" variant="elevated"
					@click="dialog_duplicate_rule = true">
					<span>Duplicate</span>
				</v-btn>
			</template>
			<!-- Parts -->
			<template #["part:trigger_conditions"]>
				<promotion-condition-list v-if="Object.keys(record).length" :rule="record"
					:rule_type="PROMOTION_RULE_TYPE.CART" :form_mode="form_mode" :conditions="trigger_conditions" 
					@update="onTriggerConditionsUpdate"/>
			</template>
			<template #["part:actions"]>
				<promotion-action-list v-if="Object.keys(record).length" :rule="record"
					:rule_type="PROMOTION_RULE_TYPE.CART" :form_mode="form_mode" :actions="actions" 
					@update="onActionsUpdate"/>
			</template>
			<template #["part:generated_coupons"]>
				<promotion-coupon-list :rule="record" :form_mode="form_mode" />
			</template>
			<!-- Fields -->
			<template #["field:end_at"]="{ field }">
				<vue-date-picker v-model="record[field.code]" :text-input="{
						format: 'd/M/yyyy HH:mm'
					}" :teleport="true" format="d/M/yyyy HH:mm" :disabled="!field.editable"
					:start-time="{ hours: 23, minutes: 59 }" time-picker-inline
					@update:model-value="ref_page.saveFieldValue(field)"  />
			</template>
		</page-card>

		<!-- Dialog - Duplicate Record  -->
		<v-dialog v-model="dialog_duplicate_rule" max-width="500">
			<v-card title="Delete" v-if="record">
				<v-card-text>
					Do you want to duplicate rule: {{ record.name }} ?
				</v-card-text>
				<v-card-actions>
					<v-btn variant="tonal" text="Yes" @click="duplicatePromotion()"></v-btn>
					<v-spacer></v-spacer>
					<v-btn color="primary" variant="tonal" text="No" @click="dialog_duplicate_rule = false"></v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup>

// Plugins
const { $promotion } = useNuxtApp();

// Refs
const record = ref({});
const form_mode = ref(FORM_MODE.VIEW);
const trigger_conditions = ref([]);
const actions = ref([]);
const page_path = ref("");
const dialog_duplicate_rule = ref(false);
const is_saved = ref(true);

// Template Ref
const ref_page = useTemplateRef("ref_page");

async function onRecordChanged(new_value, old_value) {
	// Convert trigger conditions
	const trigger_conditions_json = JSON.parse(new_value.trigger_conditions_json) || [];
	let new_conditions = [];
	for (let i in trigger_conditions_json) {
		const condition_json = trigger_conditions_json[i];
		const condition = PromotionCondition.newConditionByCode(condition_json.code, condition_json);
		new_conditions.push(condition);
	}

	trigger_conditions.value = new_conditions;

	// Convert actions
	const actions_json = JSON.parse(new_value.actions_json) || [];
	let new_actions = [];
	for (let i in actions_json) {
		const action_json = actions_json[i];
		const action = PromotionAction.newActionByCode(action_json.code, action_json, $promotion);
		new_actions.push(action);
	}

	actions.value = new_actions;
}

function saveConditionsAndActions() {
	// Update Conditions
	const conditions_json = convertConditionsToJson(trigger_conditions.value);
	record.value.trigger_conditions_json = JSON.stringify(conditions_json);

	// Update Actions
	const actions_json = convertActionsToJson(actions.value);
	record.value.actions_json = JSON.stringify(actions_json);
}

function convertConditionsToJson(conditions) {
	let return_json = [];
	for (let i in conditions) {
		const condition = conditions[i];
		if (condition instanceof PromotionCondition) {
			const data_json = condition.toJson();
			return_json.push(data_json);
		}
	}

	return return_json;
}

function convertActionsToJson(actions) {
	let return_json = [];
	for (let i in actions) {
		const action = actions[i];
		if (action instanceof PromotionAction) {
			const data_json = action.toJson();
			return_json.push(data_json);
		}
	}

	return return_json;
}

function onFieldChange(field, current_value) {
	// Get field "primary_coupon"
	const field_primary_coupon = ref_page.value.getFieldByCode("primary_coupon");
	const field_uses_per_coupon = ref_page.value.getFieldByCode("uses_per_coupon");
	const section_generated_coupons = ref_page.value.getSectionByCode("generated_coupons");
	switch (field.code) {
		case "coupon_type":
			switch (current_value) {
				case "none":
					field_primary_coupon.is_visible = false;
					field_uses_per_coupon.is_visible = false;
					section_generated_coupons.is_visible = false;
					break;
				case "primary":
					field_primary_coupon.is_visible = true;
					field_uses_per_coupon.is_visible = true;
					section_generated_coupons.is_visible = false;
					break;
				case "generated":
					field_primary_coupon.is_visible = false;
					field_uses_per_coupon.is_visible = true;
					section_generated_coupons.is_visible = true;
					break;
			}
			break;
	}

}

async function duplicatePromotion() {
	// Only duplicate first selected record
	if (!record.value) {
		return;
	}

	const duplicate_reponse = await $promotion.duplicatePromotion(record.value.id);
	if (duplicate_reponse.result) {
		const new_rule_id = duplicate_reponse.new_rule_id;
		window.location = page_path.value + "/view?id=" + new_rule_id;
	}
}

function onTriggerConditionsUpdate() {
	is_saved.value = false;
}

function onActionsUpdate() {
	is_saved.value = false;
}

onMounted(() => {
	$promotion.load();
})

</script>

<style lang="less"></style>
