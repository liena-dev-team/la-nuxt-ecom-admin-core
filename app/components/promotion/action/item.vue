<template>
	<div class="la-promotion-action-item" v-if="item">
		<div class="name">
			<span class="index">Item {{ (child_index + 1) }}</span>
			<v-btn class="btn-remove" icon="mdi-close-circle" size="x-small" color="red" variant="text"
				@click="removeItem" />
			<div class="item-no">
				<v-autocomplete label="Item No." item-props v-model="item.item_no" :items="item_no_options"
					variant="underlined" density="compact" hide-details="auto" :loading="is_loading"
					@update:focused="getAllItemNos" @update:model-value="onItemNoSelected" />
			</div>
			<div class="variant-code">
				<v-autocomplete label="Variant Code" item-props v-model="item.variant_code"
					:items="variant_code_options" variant="underlined" density="compact" hide-details="auto"
					:loading="is_loading" @update:focused="getVariants" @update:model-value="getConfigurableVariant" />
			</div>
			<div class="discount-percent">
				<v-text-field label="Discount Percent" v-model="item.discount_percent" variant="underlined"
					type="number" density="compact" hide-details="auto" @update:model-value="emitUpdate" />
			</div>
			<div class="qty">
				<v-text-field label="Qty" v-model="item.qty" type="number" variant="underlined" density="compact"
					hide-details="auto" @update:model-value="emitUpdate" />
			</div>
		</div>
		<div class="detail-info">
			<div class="configurable-name" v-if="item.configurable_id">
				<label>Configurable Name</label>
				<span>{{ item.configurable_name }}</span>
			</div>
			<div class="variant-name" v-if="item.variant_id">
				<label>Variant Name</label>
				<span>{{ item.variant_name }}</span>
			</div>
			<div class="original-price" v-if="item.original_price >= 0">
				<label>Original Price</label>
				<span>{{ item.original_price }}</span>
			</div>
			<div class="final-price" v-if="item.final_price >= 0">
				<label>Final Price</label>
				<span>{{ item.final_price }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>

// Plugins
const { $bc_service, $product_variant, $cache } = useNuxtApp();

// Emits
const emit = defineEmits(["update", "remove"]);

// Props
const { action } = defineProps({
	action: {
		type: PromotionActionCartGift,
		default: null
	},
	child_index: {
		type: Number,
		default: -1
	}
});

// Model
const item = defineModel('item', { type: PromotionalItem, default: null });

// Refs
const item_no_options = ref([]);
const variant_code_options = ref([]);
const found_configurable = ref();
const found_variant = ref();
const is_loading = ref(false);

// Functions
function removeItem() {
	emit("remove");
}

async function getAllItemNos() {
	if (item_no_options.value.length > 0) {
		return;
	}

	let items = $cache.get(CACHE_TYPE.STATIC, "bc_items");
	if (!items) {
		let filter_request = new FilterRequest();
		filter_request.pagination.size = -1;
		// Get Items
		const items_res_data = await $bc_service.filterItems(filter_request);
		if (items_res_data.result) {
			items = items_res_data.records;
			$cache.set(CACHE_TYPE.STATIC, "bc_items", items);
		} else {
			items = [];
		}
	}

	for (let i in items) {
		const item = items[i];
		item_no_options.value.push({
			title: item.item_no,
			subtitle: item.item_description,
			value: item.item_no
		})
	}
}

async function getVariants() {
	if (!item.value.item_no) {
		return;
	}

	let filter_request = new FilterRequest();
	filter_request.pagination.size = -1;
	filter_request.filters = [{
		field: {
			code: "item_no"
		},
		expression: item.value.item_no + ""
	}];

	// Get Item Variants
	variant_code_options.value = [];
	const variants_data = await $bc_service.filterItemVariant(filter_request);
	if (variants_data.result) {
		const variants = variants_data.records;
		for (let i in variants) {
			const variant = variants[i];
			variant_code_options.value.push({
				title: variant.variant_description,
				subtitle: variant.variant_code,
				value: variant.variant_code
			})
		}
	}
}

async function getConfigurableVariant() {
	if (!item.value.item_no || !item.value.variant_code) {
		return;
	}

	// Find product variant by Item No, Variant Code
	let filter_request = new FilterRequest();
	filter_request.pagination.size = 1;
	filter_request.filters = [{
		field: {
			code: "item_no"
		},
		expression: item.value.item_no + ""
	}, {
		field: {
			code: "variant_code"
		},
		expression: item.value.variant_code + ""
	}];

	// Get Item Variants
	const variants_data = await $product_variant.filter(filter_request);
	found_variant.value = null;
	if (variants_data.result) {
		const records = variants_data.records;
		if (records.length > 0) {
			found_variant.value = records[0];
			item.value.variant_id = found_variant.value.id;
			item.value.variant_name = found_variant.value.name;
			item.value.original_price = found_variant.value.price;
			item.value.final_price = 0;
			if (item.value.original_price && item.value.discount_percent) {
				item.value.final_price = item.value.original_price * (100 - parseFloat(item.value.discount_percent)) / 100;
			}
		}
	}

	if (!found_variant.value) {
		item.value.variant_id = -1;
		item.value.variant_name = "";
		item.value.original_price = 0;
	}

	// Get Configurable
	if (item.value.variant_id) {
		const configurable_data = await $product_variant.getConfigurableFromVariantId(item.value.variant_id);
		if (configurable_data.result) {
			found_configurable.value = configurable_data.configurable;
			if (found_configurable.value) {
				item.value.configurable_id = found_configurable.value.id;
				item.value.configurable_name = found_configurable.value.name;
			}
		}
	}

	emitUpdate();
}

function onItemNoSelected() {
	item.value.variant_code = "";
	emitUpdate();
}

function emitUpdate() {
	emit("update");
}

onMounted(() => {
	if (!item.value) {
		return;
	}

	if (item.value.discount_percent == null) {
		item.value.discount_percent = 100;
	}

	if (item.value.qty == null) {
		item.value.qty = 1;
	}
});
</script>

<style lang="less">
.la-promotion-action-item {
	display: grid;
	gap: 2px;
	border-bottom: 1px dashed #ccc;
	padding-bottom: 8px;

	>.name {
		display: flex;
		align-items: center;
		gap: 12px;

		>.index {
			display: inline-block;
			border-radius: 4px;
			padding: 2px 8px;
			background-color: var(--la_accent_color_5);
			color: #fff;
			font-weight: bold;
			font-size: 14px;
			margin-bottom: 8px;
		}

		>.item-no {
			min-width: 200px;
		}

		>.variant-code {
			min-width: 300px;
		}

		>.discount-percent {
			max-width: 110px;
		}

		>.qty {
			max-width: 60px;
		}
	}

	>.detail-info {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-left: 110px;
		padding: 0px 4px;

		label {
			font-size: 13px;
			opacity: 0.6;
		}

		>div {
			display: grid;
			height: 100%;
		}

		>.configurable-name {
			min-width: 200px;
		}

		>.variant-name {
			min-width: 200px;
		}

	}

}
</style>
