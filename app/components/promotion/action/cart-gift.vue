<template>
	<div class="la-promotion-action-cart-gift" v-if="(action instanceof PromotionActionCartGift)">
		<v-container class="pa-0" fluid>
			<v-row class="fields align-center" no-gutters>
				<!-- Action Cart Gift -->
				<v-col cols="12" class="col-label pa-2 action-cart-gift">
					<div class="caption">
						<span class="label">Promotional Items</span>
						<span class="dots"></span>
					</div>
				</v-col>
				<v-col cols="12" class="col-field pa-2 action-cart-gift">
					<div class="control">
						<div ref="combo_panel_ref" class="combo-list" v-if="action.combo_list.length > 0">
							<promotion-action-item-combo v-for="(combo, i) in action.combo_list" :key="i"
								:child_index="i" :id="(i + 1)" :action="action" v-model:combo="action.combo_list[i]"
								@remove="removeCombo(i)" @update="emitUpdate"/>
						</div>
						<div class="actions">
							<v-btn prepend-icon="mdi-plus" size="small" variant="elevated" @click="addCombo">
								<span>Add Combo</span>
							</v-btn>
						</div>
					</div>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>

<script setup>

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
const action = defineModel('action', { type: PromotionActionCartGift, default: null });

// Refs

// Template Ref
const combo_panel_ref = useTemplateRef("combo_panel_ref");

// Functions
function addCombo() {
	const item_combo = new PromotionalItemCombo({
		action_id: action.value.id,
		items: []
	});

	action.value.combo_list.push(item_combo);
	
	// Default combo id to first combo if there is not one
	console.log(action.value.default_combo_id);
	if (action.value.default_combo_id == -1 || action.value.default_combo_id == null) {
		action.value.default_combo_id = 1;
	}

	// Scroll to bottom
	if (combo_panel_ref.value) {
		combo_panel_ref.value.scrollTop = combo_panel_ref.value.scrollHeight;
	}

	emitUpdate();
}

function removeCombo(index) {
	for (let i in action.value.combo_list) {
		if (i == index) {
			action.value.combo_list.splice(i, 1);
			break;
		}
	}

	emitUpdate();
}

function emitUpdate() {
	emit("update");
}

onMounted(() => {
	if (!action.value.combo_list) {
		action.value.combo_list = [];
	}
})

</script>

<style lang="less">
.la-promotion-action-cart-gift {
	.combo-list {
		display: grid;
		gap: 12px;
		margin-bottom: 16px;
		max-height: 400px;
		overflow-x: auto;
		overflow-y: auto;
		border: 1px solid #cccc;
		padding: 12px;
		border-radius: 4px;
	}

}
</style>
