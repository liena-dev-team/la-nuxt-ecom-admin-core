<template>
	<div class="la-promotion-action-common" v-if="action">
		<div class="id-container">
			<span class="id">{{ action.id }}</span>
			<span class="name">{{ action.name }}</span>
			<v-btn class="btn-remove" icon="mdi-close-circle" size="x-small" color="red" variant="text"
				@click="removeAction" />
		</div>
		<!-- Common Fields -->
		<v-container class="pa-0" fluid>
			<v-row class="fields cart-rule align-center" no-gutters>
				<!-- Trigger ID -->
				<v-col cols="2" class="col-label pa-2 trigger-id">
					<div class="caption">
						<span class="label">Trigger ID</span>
						<span class="dots"></span>
					</div>
				</v-col>
				<v-col cols="4" class="col-field pa-2 trigger-id">
					<div class="control">
						<div class="int">
							<v-text-field v-model="action.trigger_id" type="number" density="compact"
								hide-details="auto" @update:model-value="emitUpdate"/>
						</div>
					</div>
				</v-col>
			</v-row>
			<promotion-action-discount-amount :rule="rule" :rule_type="rule_type" v-model:action="action"
				@update="emitUpdate"/>
			<promotion-action-discount-percent :rule="rule" :rule_type="rule_type" v-model:action="action"
				@update="emitUpdate"/>
			<promotion-action-cart-action v-if="rule_type == PROMOTION_RULE_TYPE.CART" :rule="rule" 
				:rule_type="rule_type" v-model:action="action" @update="emitUpdate"/>
		</v-container>
		<!-- Cart Gift -->
		<promotion-action-cart-gift v-if="(action instanceof PromotionActionCartGift)" 
			:rule="rule" :rule_type="rule_type" v-model:action="action" @update="emitUpdate"/>
	</div>
</template>

<script setup>

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
const action = defineModel('action', { type: PromotionAction, default: null });

// Refs

// Functions
function removeAction() {
	emit("remove");
}

function emitUpdate() {
	emit("update");
}

onMounted(() => {
	if (!action) {
		return;
	}
	
	if (!action.value.trigger_id) {
		action.value.trigger_id = 1;
	}
})
</script>

<style lang="less">
.la-promotion-action-common {
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
