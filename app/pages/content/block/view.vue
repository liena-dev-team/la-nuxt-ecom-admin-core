<template>
	<div>
		<page-card ref="rule_card" v-model:record="record" v-model:form_mode="form_mode" v-model:page_path="page_path"
			v-model:form_messages="form_messages" v-model:is_saved="is_saved" :auto_save="false" :go_back="true"
			page_class="App\AdminPage\CMS\CmsBlockCard" @record:changed="onRecordChanged"
			@update:before="saveConditions" @create:before="saveConditions">
			<!-- Actions -->
			<template #["action:apply"]>
				<v-btn v-if="record && !record?.is_active" color="red" size="small" variant="elevated"
					@click="dialog_apply = true">Apply</v-btn>
			</template>
			<template #["action:unapply"]>
				<v-btn v-if="record && record?.is_active" color="primary" size="small" variant="elevated"
					@click="dialog_unapply = true">Unapply</v-btn>
			</template>
			<template #["action:duplicate"]>
				<v-btn v-if="record" size="small" variant="elevated"
					@click="dialog_duplicate_rule = true">
					<span>Duplicate</span>
				</v-btn>
			</template>
			<!-- Parts -->
			<template #["part:trigger_conditions"]>
				<promotion-condition-list v-if="Object.keys(record).length" :rule="record"
					:rule_type="PROMOTION_RULE_TYPE.CATALOG" :form_mode="form_mode" :conditions="trigger_conditions"
					@update="onTriggerConditionsUpdate" />
			</template>
		
		</page-card>

		<!-- Dialog - Apply -->
		<v-dialog v-model="dialog_apply" transition="dialog-top-transition" max-width="600">
			<v-card title="Ask">
				<v-card-text>
					<p>
						Do you want to <strong>APPLY</strong> the the rule ?
					</p>
				</v-card-text>
				<v-card-actions>
					<v-btn @click="applyCatalogRule" color="primary" :loading="is_loading">Yes</v-btn>
					<v-btn @click="dialog_apply = false">No</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog - Unapply -->
		<v-dialog v-model="dialog_unapply" transition="dialog-top-transition" max-width="600">
			<v-card title="Ask">
				<v-card-text>
					<p>
						Do you want to <strong>UN-APPLY</strong> the the rule ?
					</p>
				</v-card-text>
				<v-card-actions>
					<v-btn @click="unApplyCatalogRule" color="primary" :loading="is_loading">Yes</v-btn>
					<v-btn @click="dialog_unapply = false">No</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Snakbar - Success -->
		<v-snackbar v-model="snackbar_apply_success" multi-line timeout="3000" color="success">
			<p>Rule is applied successfully !</p>
			<template v-slot:actions>
				<v-btn variant="text" @click="snackbar_apply_success = false">
					Close
				</v-btn>
			</template>
		</v-snackbar>

		<!-- Snakbar - Failed -->
		<v-snackbar v-model="snackbar_apply_failure" multi-line timeout="3000" color="error">
			<p>Failed to apply !</p>
			<template v-slot:actions>
				<v-btn variant="text" @click="snackbar_apply_failure = false">
					Close
				</v-btn>
			</template>
		</v-snackbar>

		<!-- Dialog - Duplicate Record  -->
		<v-dialog v-model="dialog_duplicate_rule" max-width="500">
			<v-card title="Delete" v-if="record">
				<v-card-text>
					Do you want to duplicate rule: {{ record.name }} ?
				</v-card-text>
				<v-card-actions>
					<v-btn variant="tonal" text="Yes" @click="duplicateCmsBlock()"></v-btn>
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
const form_messages = ref([]);
const page_path = ref("");
const trigger_conditions = ref([]);
const actions = ref([]);
const is_saved = ref(true);

// Apply/Unapply
const dialog_apply = ref(false);
const is_loading = ref(false);
const snackbar_apply_success = ref(false);
const snackbar_apply_failure = ref(false);
const dialog_unapply = ref(false);
const dialog_duplicate_rule = ref(false);

// Template Ref
const rule_card = useTemplateRef("rule_card");

// Functions
async function onRecordChanged(new_value, old_value) {
	// Convert trigger conditions
	const target_condition_json = JSON.parse(new_value.target_condition_json);
	let new_conditions = [];
	for (let i in target_condition_json) {
		const condition_json = target_condition_json[i];
		const condition = PromotionCondition.newConditionByCode(condition_json.code, condition_json);
		new_conditions.push(condition);
	}

	trigger_conditions.value = new_conditions;

	// Convert actions
	// const actions_json = JSON.parse(new_value.actions_json);
	// let new_actions = [];
	// for (let i in actions_json) {
	// 	const action_json = actions_json[i];
	// 	const action = PromotionAction.newActionByCode(action_json.code, action_json, $promotion);
	// 	new_actions.push(action);
	// }

	// actions.value = new_actions;
}

function saveConditions() {
	// Update Conditions
	const conditions_json = convertConditionsToJson(trigger_conditions.value);
	record.value.target_condition_json = JSON.stringify(conditions_json);

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

async function applyCatalogRule() {
	const rule_id = record.value.id;
	if (!rule_id) {
		return;
	}

	is_loading.value = true;
	const result_save = await rule_card.value.requestUpdate();
	if (!result_save) {
		return;
	}

	const result_data = await $promotion.applyOneCmsBlock(rule_id);
	form_messages.value = result_data.messages;
	is_loading.value = false;
	dialog_apply.value = false;

	if (result_data.result) {
		snackbar_apply_success.value = true;
	} else {
		snackbar_apply_failure.value = true;
	}

	rule_card.value.requestRead();
}

async function unApplyCatalogRule() {
	const rule_id = record.value.id;
	if (!rule_id) {
		return;
	}

	is_loading.value = true;
	const result_data = await $promotion.unApplyCmsBlock(rule_id);
	form_messages.value = result_data.messages;
	is_loading.value = false;
	dialog_unapply.value = false;

	if (result_data.result) {
		snackbar_apply_success.value = true;
	} else {
		snackbar_apply_failure.value = true;
	}

	rule_card.value.requestRead();
}

async function duplicateCmsBlock() {
	// Only duplicate first selected record
	if (!record.value) {
		return;
	}

	const duplicate_reponse = await $promotion.duplicateCmsBlock(record.value.id);
	if (duplicate_reponse.result) {
		const new_block_id = duplicate_reponse.new_block_id;
		window.location = page_path.value + "/view?id=" + new_block_id;
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

<style lang="less">
.la-page-card {

	.part-trigger-condition.view,
	.part-action.view {
		background-color: #eee;
		filter: grayscale(1);
		border-radius: 4px;
		pointer-events: none;
	}

	.part-trigger-condition {
		display: flex;
		align-items: flex-start;
		padding-bottom: 24px;
		gap: 12px;

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
</style>
