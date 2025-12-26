<template>
	<v-row class="fields align-center" no-gutters v-if="(
		action instanceof PromotionActionCartDiscountPercent
		|| action instanceof PromotionActionCartInvoiceDiscountPercent
		|| action instanceof PromotionActionCatalogDiscountPercent
	)">
		<!-- Discount Percent -->
		<v-col cols="2" class="col-label pa-2 discount-percent">
			<div class="caption">
				<span class="label">Discount Percent</span>
				<span class="dots"></span>
			</div>
		</v-col>
		<v-col cols="4" class="col-field pa-2 discount-percent">
			<div class="control">
				<div class="int">
					<v-text-field v-model="action.discount_percent" type="number" density="compact"
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
	
	if (action.value.discount_percent == null) {
		action.value.discount_percent = 0;
	}
})
</script>

<style lang="less">
</style>
