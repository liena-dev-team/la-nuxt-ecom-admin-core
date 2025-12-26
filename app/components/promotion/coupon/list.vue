<template>
	<div class="la-promotion-coupon-list" :class="form_mode">
		<div class="generator">
			<v-container class="pa-0" fluid>
				<v-row class="fields align-center" no-gutters>
					<!-- Coupon Qty -->
					<v-col cols="2" class="col-label pa-2 coupon-qty">
						<div class="caption">
							<span class="label">Coupon Qty</span>
							<span class="dots"></span>
						</div>
					</v-col>
					<v-col cols="4" class="col-field pa-2 coupon-qty">
						<div class="control">
							<v-text-field v-model="rule.coupon_qty" type="number" density="compact" hide-details="auto" />
						</div>
					</v-col>
					<!-- Coupon Length -->
					<v-col cols="2" class="col-label pa-2 coupon-length">
						<div class="caption">
							<span class="label">Coupon Length</span>
							<span class="dots"></span>
						</div>
					</v-col>
					<v-col cols="4" class="col-field pa-2 coupon-length">
						<div class="control">
							<v-text-field v-model="rule.coupon_length" type="number" density="compact" hide-details="auto" />
						</div>
					</v-col>
				</v-row>
				<v-row class="fields align-center" no-gutters>
					<!-- Code Prefix -->
					<v-col cols="2" class="col-label pa-2 code-prefix">
						<div class="caption">
							<span class="label">Code Prefix</span>
							<span class="dots"></span>
						</div>
					</v-col>
					<v-col cols="4" class="col-field pa-2 code-prefix">
						<div class="control">
							<v-text-field v-model="rule.code_prefix" density="compact" hide-details="auto" />
						</div>
					</v-col>
					<!-- Code Suffix -->
					<v-col cols="2" class="col-label pa-2 code-suffix">
						<div class="caption">
							<span class="label">Code Suffix</span>
							<span class="dots"></span>
						</div>
					</v-col>
					<v-col cols="4" class="col-field pa-2 code-suffix">
						<div class="control">
							<v-text-field v-model="rule.code_suffix" density="compact" hide-details="auto" />
						</div>
					</v-col>
				</v-row>
				<v-row class="fields align-center" no-gutters>
					<!-- Code Format -->
					<v-col cols="2" class="col-label pa-2 code-format">
						<div class="caption">
							<span class="label">Code Format</span>
							<span class="dots"></span>
						</div>
					</v-col>
					<v-col cols="4" class="col-field pa-2 code-format">
						<div class="control">
							<v-select v-model="rule.code_format" max-width="400" density="compact" :items="CODE_FORMATS"
								:hide-details="true">
							</v-select>
						</div>
					</v-col>
				</v-row>
				<v-row class="fields align-center">
					<v-col cols="12">
						<div class="d-flex ga-4 mb-6">
							<v-btn :disabled="rule.coupon_qty <= 0" color="primary" @click="dialog_generate = true"
								size="small">Generate</v-btn>
						</div>
					</v-col>
				</v-row>
			</v-container>
		</div>
		<div class="coupons">
			<page-list ref="ref_page_list" select_mode select_multiple
				page_class="App\AdminPage\Promotion\CouponSubList" :editable="false" :insertable="false"
				:deletable="true" :show_selected_records="false" v-model:selected_records="selected_records"
				:filter_request="filter_request_coupons" @update:selected_records="onUpdateSelectedCoupons">
				<!-- Actions -->
				<template #["action:delete_all"]>
					<v-btn size="small" color="error" @click="dialog_delete_all = true">
						<span>Delete All</span>
					</v-btn>
				</template>
			</page-list>
		</div>

		<!-- Dialog - Ask to generate -->
		<v-dialog v-model="dialog_generate" style="max-width: 400px;">
			<v-card>
				<v-card-text>
					<p>Do you want to <strong>GENERATE</strong> coupon codes ?</p>
				</v-card-text>
				<v-card-actions>
					<v-btn text="Cancel" variant="tonal" @click="dialog_generate = false"></v-btn>
					<v-spacer></v-spacer>
					<v-btn color="primary" text="Done" variant="tonal" @click="generateCoupons"></v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog - Ask to delete all -->
		<v-dialog v-model="dialog_delete_all" style="max-width: 440px;">
			<v-card>
				<v-card-text>
					<p>Do you want to <strong>DELETE ALL</strong> coupons ?</p>
				</v-card-text>
				<v-card-actions>
					<v-btn text="Cancel" variant="tonal" @click="dialog_delete_all = false"></v-btn>
					<v-spacer></v-spacer>
					<v-btn color="primary" text="Delete All" variant="tonal" @click="deleteAll"></v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

	</div>
</template>

<script setup>

// Constants
const CODE_FORMAT_ALPHANUMERIC = "alphanumeric";
const CODE_FORMAT_ALPHABETICAL = "alphabetical";
const CODE_FORMAT_NUMERIC = "numeric";

const CODE_FORMATS = [
	{
		title: "Alphanumeric",
		value: CODE_FORMAT_ALPHANUMERIC,
	}, {
		title: "Alphabetical",
		value: CODE_FORMAT_ALPHABETICAL,
	}, {
		title: "Numeric",
		value: CODE_FORMAT_NUMERIC,
	},
];

// Plugins
const { $promotion } = useNuxtApp();

// Props
const { form_mode } = defineProps({
	form_mode: {
		type: String,
		default: FORM_MODE.VIEW
	}
});

// Model
const rule = defineModel('rule', { default: {} });

// Template Ref
const ref_page_list = useTemplateRef("ref_page_list");

// Refs
const dialog_generate = ref(false);
const dialog_delete_all = ref(false);
const filter_request_coupons = ref(new FilterRequest());
filter_request_coupons.value.filters = [{
	field: {
		"code": "rule_id"
	},
	expression: (rule.value.id + "" || "")
}];

const selected_records = ref([]);

// Functions
async function generateCoupons() {
	if (!rule.value) {
		return;
	}

	const generate_reponse = await $promotion.generateCoupons(
		rule.value.id,
		rule.value.coupon_qty,
		rule.value.coupon_length,
		rule.value.code_prefix,
		rule.value.code_suffix,
		rule.value.code_format
	);

	if (generate_reponse.result) {
		ref_page_list.value.onDoFilter();
	}

	dialog_generate.value = false;
}

async function deleteAll() {
	if (!rule.value) {
		return;
	}

	const delete_reponse = await $promotion.deleteAllCoupons(rule.value.id);
	if (delete_reponse.result) {
		ref_page_list.value.onDoFilter();
	}

	dialog_delete_all.value = false;
}

function onUpdateSelectedCoupons(a) {

}

onMounted(() => {
	
});

</script>

<style lang="less">
.la-promotion-coupon-list {
	padding: 8px;
	
	&.view {
		background-color: #eee;
		filter: grayscale(1);
		border-radius: 4px;
		pointer-events: none;
	}
}
</style>
