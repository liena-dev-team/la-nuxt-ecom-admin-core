<template>
	<v-row class="fields align-center" no-gutters v-if="(
		action instanceof PromotionActionCartDiscountAmount
		|| action instanceof PromotionActionCartInvoiceDiscountAmount
		|| action instanceof PromotionActionCatalogDiscountAmount
	)">
		<!-- Discount Amount -->
		<v-col cols="2" class="col-label pa-2 discount-amount">
			<div class="caption">
				<span class="label">Discount Amount</span>
				<span class="dots"></span>
			</div>
		</v-col>
		<v-col cols="4" class="col-field pa-2 discount-amount">
			<div class="control">
				<div class="int">
					<v-text-field v-model="action.discount_amount" type="number" density="compact"
						hide-details="auto" @update:model-value="emitUpdate"/>
				</div>
			</div>
		</v-col>
	</v-row>
</template>

<script setup>

// Emits
const emit = defineEmits(["update"]);

// Model
const action = defineModel('action', { type: PromotionAction, default: null });

function emitUpdate() {
	emit("update");
}

onMounted(() => {
	if (!action) {
		return;
	}
	
	if (isNaN(action.value.discount_amount)) {
		action.value.discount_amount = 0;
	}
})
</script>
