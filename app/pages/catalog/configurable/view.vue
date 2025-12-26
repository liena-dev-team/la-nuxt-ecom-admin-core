<template>
	<div>
		<page-card ref="ref_page" class="la-page-catalog-configurable-view"
			page_class="App\AdminPage\Catalog\ConfigurableCard" :go_back="true" @record:changed="onRecordChange"
			v-model:form_mode="form_mode" v-model:record="record" v-model:form_messages="form_messages">
			<!-- Actions -->
			<template #["action:google_merchant_one"]>
				<v-btn color="primary" size="small" variant="elevated" @click="dialog_apply_google = true">
					<span>Sync to Google Merchant</span>
				</v-btn>
			</template>

			<template #["part:variants"]>
				<v-toolbar class="mb-8" density="compact">
					<v-spacer></v-spacer>
					<v-btn :disabled="form_mode == FORM_MODE.VIEW" density="compact" text="Select Attributes"
						@click="openSelectAttrs"></v-btn>
					<v-btn density="compact" text="Add Variant" @click="dialog_add_variants = true"
						:disabled="(form_mode == FORM_MODE.VIEW) || (Object.entries(selected_attributes).length <= 0)"></v-btn>
				</v-toolbar>
				<v-sheet v-if="selected_attributes.length > 0" class="selected-attributes mb-4">
					<div> Attributes </div>
					<v-table density="compact">
						<thead>
							<tr>
								<th class="text-left">
									<strong>Label</strong>
								</th>
								<th class="text-left">
									<strong>Code</strong>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="attr in selected_attributes" :key="attr.id">
								<td>{{ attr.label }}</td>
								<td>{{ attr.code }}</td>
							</tr>
						</tbody>
					</v-table>
				</v-sheet>
				<v-sheet v-if="selected_variants.length > 0" class="selected-variants">
					<div> Variants </div>
					<v-table density="compact" hover>
						<thead>
							<tr>
								<th class="text-left" width="80">
								</th>
								<th class="text-left">
									<strong>Name</strong>
								</th>
								<th class="text-left">
									<strong>Price</strong>
								</th>
								<th class="text-left">
									<strong>Item No</strong>
								</th>
								<th class="text-left">
									<strong>Variant Code</strong>
								</th>
								<th class="text-left" v-for="attr in selected_attributes">
									<strong> {{ attr.label }}</strong>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr class="variant" v-for="(variant, variant_key) in selected_variants" :key="variant.id">
								<td width="80">
									<v-btn :disabled="form_mode == FORM_MODE.VIEW"
										@click="onClickRemoveVariant(variant_key)" class="actions" icon="mdi-close"
										size="small" variant="flat" density="compact"></v-btn>
								</td>
								<td>
									<nuxt-link target="blank" :to="getVariantViewPath(variant.id)">
										{{ variant.name }}
									</nuxt-link>
								</td>
								<td>{{ variant.price }}</td>
								<td>{{ variant.item_no }}</td>
								<td>{{ variant.variant_code }}</td>
								<td v-for="attr in selected_attributes">
									{{ variant[attr.code] }}
								</td>
							</tr>
						</tbody>
					</v-table>
				</v-sheet>
			</template>

		</page-card>
		<!-- Dialog - Apply -->
		<v-dialog v-model="dialog_apply_google" max-width="600">
			<v-card title="Ask">
				<v-card-text>
					<p>
						Do you want to Sync to Google Merchant ?
					</p>
				</v-card-text>
				<v-card-actions>
					<v-btn @click="pushConfigurableToGoogleMerchant" color="primary" :loading="is_loading">Yes</v-btn>
					<v-btn @click="dialog_apply_google = false">No</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<!-- Dialog Attributes -->
		<v-dialog v-model="dialog_select_attrs">
			<v-card>
				<v-card-text style="height: 100%;">
					<page-list select_mode select_multiple page_class="App\AdminPage\Catalog\SelectAttributeList"
						:editable="false" :insertable="false" page_path="/" selected_record_label="label"
						:filter_request="filter_request_attrs" v-model:selected_records="selected_attributes"
						@update:selected_records="onSelectedAttrsChange">
					</page-list>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" text="Done" variant="tonal" @click="onClickSelectAttributes"></v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog Variants  -->
		<v-dialog v-model="dialog_add_variants">
			<v-card>
				<v-card-text style="height: 100%;">
					<v-toolbar title="Select Variants" density="compact">
						<v-spacer></v-spacer>
						<v-btn color="primary" text="Done" variant="tonal" @click="onClickSelectVariants"></v-btn>
					</v-toolbar>
					<page-list select_mode select_multiple :show_toolbar="false"
						page_class="App\AdminPage\Catalog\SelectVariantList" :editable="false" :insertable="false"
						page_path="/" selected_record_label="name" :filter_request="filter_request_variants"
						v-model:selected_records="selected_variants"
						@update:selected_records="onSelectedVariantsChange">
					</page-list>
				</v-card-text>
			</v-card>
		</v-dialog>

		<!-- Snakbar - Success -->
		<v-snackbar v-model="snackbar_apply_success" multi-line timeout="3000" color="success">
			<p>Google merchant is applied successfully !</p>
			<template v-slot:actions>
				<v-btn variant="text" @click="snackbar_apply_success = false">
					Close
				</v-btn>
			</template>
		</v-snackbar>

		<!-- Snakbar - Failed -->
		<v-snackbar v-model="snackbar_apply_failure" multi-line timeout="3000" color="error">
			<p>Failed to apply Google merchant !</p>
			<template v-slot:actions>
				<v-btn variant="text" @click="snackbar_apply_failure = false">
					Close
				</v-btn>
			</template>
		</v-snackbar>
	</div>
</template>

<script setup>
// Plugins
const { $product_configurable } = useNuxtApp();

// Refs
const is_loading = ref(false);
const record = ref({});
const form_messages = ref([]);
const form_mode = ref(FORM_MODE.VIEW);
const dialog_select_attrs = ref(false);
const dialog_add_variants = ref(false);
const filter_request_attrs = ref(new FilterRequest());
const dialog_apply_google = ref(false);
const snackbar_apply_success = ref(false);
const snackbar_apply_failure = ref(false);
filter_request_attrs.value.filters = [{
	field: {
		"code": "is_configurable"
	},
	expression: "0"
}];
// Template Ref
const ref_page = useTemplateRef("ref_page");

const filter_request_variants = ref(new FilterRequest());

const selected_attributes = ref([]);
const selected_variants = ref([]);
const configurable_id = ref();

// Functions
function openSelectAttrs() {
	dialog_select_attrs.value = true;
}

function onClickSelectAttributes() {
	dialog_select_attrs.value = false;
}

function onClickSelectVariants() {
	dialog_add_variants.value = false;
}

function onClickRemoveVariant(variant_key) {
	if (form_mode != FORM_MODE.VIEW) {
		return;
	}

	selected_variants.value.splice(variant_key, 1);
	requestUpdateVariants();
}

async function getConfigAttrs() {
	if (!configurable_id.value) {
		return;
	}

	const res_data = await useApiFetch(
		"/admin/catalog/configurable/attrs/" + configurable_id.value, {
		method: HTTP_METHOD.GET
	});

	if (res_data.result) {
		selected_attributes.value = res_data.attrs || [];
	} else {
		selected_attributes.value = [];
	}
}

async function requestUpdateAttributes() {
	const res_data = await useApiFetch(
		"/admin/catalog/configurable/attrs", {
		method: HTTP_METHOD.PUT,
		body: {
			configurable_id: configurable_id.value,
			attrs: selected_attributes.value,
		}
	});

	return res_data.result;
}

async function getConfigVariants() {
	if (!configurable_id.value) {
		return;
	}

	const res_data = await useApiFetch(
		"/admin/catalog/configurable/variants/" + configurable_id.value, {
		method: HTTP_METHOD.GET
	});

	if (res_data.result) {
		selected_variants.value = res_data.variants || [];
	} else {
		selected_variants.value = [];
	}
}

async function requestUpdateVariants() {
	const res_data = await useApiFetch(
		"/admin/catalog/configurable/variants", {
		method: HTTP_METHOD.PUT,
		body: {
			configurable_id: configurable_id.value,
			variants: selected_variants.value,
		}
	});

	return res_data.result;
}

async function pushConfigurableToGoogleMerchant() {
	if (!record.value || !record.value.id) {
		return;
	}

	is_loading.value = true;
	const response_data = await $product_configurable.pushConfigurableToGoogleMerchant(record.value.id);
	form_messages.value = response_data.messages;
	if (response_data.result) {
		snackbar_apply_success.value = true;
	} else {
		snackbar_apply_failure.value = true;
	}
	is_loading.value = false;
	dialog_apply_google.value = false;
	ref_page.value.requestRead();
}

function onSelectedAttrsChange() {
	requestUpdateAttributes();
}

function onSelectedVariantsChange() {
	requestUpdateVariants();
}

async function onRecordChange(new_value, old_value) {
	configurable_id.value = new_value.id;
	getConfigAttrs();
	getConfigVariants();
}

function getVariantViewPath(variant_id) {
	return "/catalog/variant/view?id=" + variant_id + "&mode=view";
}

</script>

<style lang="less">
.la-page-catalog-configurable-view {

	.selected-variants {
		.variant {
			.actions {
				display: none;
			}

			&:hover {
				.actions {
					display: block;
				}
			}
		}
	}
}
</style>
