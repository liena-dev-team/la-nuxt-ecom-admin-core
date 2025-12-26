<template>
	<div>
		<page-card page_class="App\AdminPage\Sales\SalesOrderCard" :insertable="false" :deletable="false"
			:go_back="true" v-model:record="record" v-model:form_messages="form_messages">
			<!-- Field override: shipping_address_city -->
			<template
				v-slot:[`field:shipping_address_city`]="{ field, calculateFieldVariant, field_errors, saveFieldValue, getFieldByCode }">
				<v-autocomplete v-model="record[field.code]" :items="city_options" item-title="title" item-value="value"
					density="compact" :variant="calculateFieldVariant ? calculateFieldVariant(field) : 'outlined'"
					hide-details="auto" :disabled="!field.editable"
					@update:model-value="(val) => onCityModelUpdate(field, getFieldByCode, saveFieldValue)"
					:error="!!(field_errors && field_errors[field.code])"
					:error-messages="field_errors ? field_errors[field.code] : undefined" />
			</template>
			<!-- Field override: shipping_address_ward -->
			<template
				v-slot:[`field:shipping_address_ward`]="{ field, calculateFieldVariant, field_errors, saveFieldValue }">
				<v-autocomplete :key="record.shipping_address_city || 'none'" v-model="record[field.code]"
					:items="ward_options" item-title="title" item-value="value" density="compact"
					:variant="calculateFieldVariant ? calculateFieldVariant(field) : 'outlined'" hide-details="auto"
					:disabled="!field.editable" @update:model-value="() => saveFieldValue(field)"
					:error="!!(field_errors && field_errors[field.code])"
					:error-messages="field_errors ? field_errors[field.code] : undefined" />
			</template>
			<!-- Actions -->
			<template #["action:send_email"]>
				<v-btn size="small" variant="elevated" @click="sendEmail">Send Email</v-btn>
			</template>
			<template #["action:cancel"]>
				<v-btn v-if="showCancel" size="small" variant="elevated" color="red"
					@click="dialog_cancel = true">Cancel</v-btn>
			</template>
			<template #["action:process"]>
				<v-btn v-if="showProcess" size="small" variant="elevated" color="primary"
					@click="dialog_process = true">Process</v-btn>
			</template>
			<template #["action:sync"]>
				<v-btn v-if="showSync" size="small" variant="elevated" color="primary"
					@click="dialog_sync = true">Sync</v-btn>
			</template>
			<!-- Lines -->
			<template #["part:lines"]>
				<v-table density="compact" v-if="record">
					<thead>
						<tr>
							<th class="text-left"><strong>Configurable Name</strong></th>
							<th class="text-left"><strong>Variant Name</strong></th>
							<th class="text-left"><strong>Item No.</strong></th>
							<th class="text-left"><strong>Variant Code</strong></th>
							<th class="text-left"><strong>Original Price</strong></th>
							<th class="text-left"><strong>Discount Amount</strong></th>
							<th class="text-left"><strong>Final Price</strong></th>
							<th class="text-left"><strong>Qty</strong></th>
							<th class="text-left"><strong>Row Discount Amount</strong></th>
							<th class="text-left"><strong>Row Total</strong></th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="line in record.lines" :key="line.id">
							<td>
								<nuxt-link target="blank" :to="getConfigurableViewPath(line.configurable_id)">
									{{ line.configurable_name }}
								</nuxt-link>
							</td>
							<td>
								<nuxt-link target="blank" :to="getVariantViewPath(line.variant_id)">
									{{ line.variant_name }}
								</nuxt-link>
							</td>
							<td>{{ line.item_no }}</td>
							<td>{{ line.variant_code }}</td>
							<td>{{ line.original_price }}</td>
							<td>{{ line.discount_amount }}</td>
							<td>{{ line.final_price }}</td>
							<td>{{ line.qty }}</td>
							<td>{{ line.row_discount_amount }}</td>
							<td>{{ line.row_total }}</td>
						</tr>
					</tbody>
				</v-table>
			</template>
			<!-- Shipping Address -->
			<template #["part:shipping_address"]>
				<v-table density="compact" v-if="record && record.shipping_address">
					<thead>
						<tr>
							<th class="text-left"></th>
							<th class="text-left"><strong>Customer ID</strong></th>
							<th class="text-left"><strong>Name</strong></th>
							<th class="text-left"><strong>Phone</strong></th>
							<th class="text-left"><strong>Street</strong></th>
							<th class="text-left"><strong>Ward</strong></th>
							<th class="text-left"><strong>City</strong></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>{{ record.shipping_address.customer_address_id }}</td>
							<td>{{ record.shipping_address.customer_id }}</td>
							<td>{{ record.shipping_address.name }}</td>
							<td>{{ record.shipping_address.phone }}</td>
							<td>{{ record.shipping_address.street }}</td>
							<td>{{ record.shipping_address.ward_name }}</td>
							<td>{{ record.shipping_address.city_name }}</td>
						</tr>
					</tbody>
				</v-table>
			</template>
		</page-card>

		<!-- Dialog - Cancel -->
		<v-dialog v-model="dialog_cancel" transition="dialog-top-transition" max-width="600">
			<v-card title="Cancel Reasons">
				<v-card-text>
					<v-form @submit.prevent="">
						<v-row>
							<v-col>
								<v-select v-model="cancel_type" :items="all_cancel_types" variant="outlined"
									hide-details="auto" density="compact" @update:modelValue="onChangeCancelType"
									return-object>
								</v-select>
							</v-col>
						</v-row>
						<v-row>
							<v-col>
								<v-textarea v-model="cancel_note" label="Note" hide-details="auto" density="compact">
								</v-textarea>
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-btn @click="cancelSalesOrder" color="red" :loading="is_loading">Submit</v-btn>
					<v-btn @click="dialog_cancel = false">Close</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog - Process -->
		<v-dialog v-model="dialog_process" transition="dialog-top-transition" max-width="600">
			<v-card title="Ask">
				<v-card-text>
					<p>Do you want to <strong>process</strong> the Sales Order ?</p>
				</v-card-text>
				<v-card-actions>
					<v-btn @click="processSalesOrder" color="primary" :loading="is_loading">Yes</v-btn>
					<v-btn @click="dialog_process = false">No</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog - Sync -->
		<v-dialog v-model="dialog_sync" transition="dialog-top-transition" max-width="600">
			<v-card title="Ask">
				<v-card-text>
					<p>Do you want to <strong>sync</strong> the Sales Order ?</p>
				</v-card-text>
				<v-card-actions>
					<v-btn @click="syncSalesOrder" color="primary" :loading="is_loading">Yes</v-btn>
					<v-btn @click="dialog_sync = false">No</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup>
// Nuxt app
const { $location } = useNuxtApp();

// Ref
const record = ref({});
const form_messages = ref([]);
const is_loading = ref(false);
const dialog_cancel = ref(false);
const dialog_process = ref(false);
const dialog_sync = ref(false);
const all_cancel_types = ref([]);
const cancel_type = ref();
const cancel_note = ref("");
const ward_options = ref([]);
const city_options = ref([]);

// Computed
const showCancel = computed(() => {
	if (!record.value) {
		return false;
	}

	if (record.value.status == 'pending'
		|| record.value.status == 'payoo_pending'
	) {
		return true;
	}
	return false;
})

const showProcess = computed(() => {
	if (!record.value) {
		return false;
	}

	if (record.value.status == 'pending'
		|| record.value.status == 'payoo_pending'
	) {
		return true;
	}

	return false;
})

const showSync = computed(() => {
	if (!record.value) {
		return false;
	}

	if (record.value.status == 'processing' && !record.value["pos_order_no"]) {
		return true;
	}

	return false;
})

// Function
async function init() {
	const filter_request = new FilterRequest();
	filter_request.pagination.size = -1;
	const res_data = await useApiFetch(
		'/admin/sales/cancel-type/filter', {
		method: HTTP_METHOD.POST,
		body: filter_request.toArray()
	});

	if (!res_data.result) {
		return;
	}

	all_cancel_types.value = res_data.records.map(function (r) {
		return {
			title: r.description,
			value: r.code
		}
	});

	// Load cities for shipping address city selector
	try {
		const city_filter_request = new FilterRequest();
		city_filter_request.pagination.size = -1;
		const city_data = await $location.filterCities(city_filter_request);
		const rawCityItems = city_data?.records || [];
		city_options.value = rawCityItems.map((c) => ({
			title: c?.name ?? "",
			value: c?.city_code
		}));
	} catch (e) {
		console.error('Failed to load cities', e);
	}

}

async function cancelSalesOrder() {
	if (!cancel_type.value || !record.value || !record.value.id) {
		return;
	}
	is_loading.value = true;
	const res_data = await useApiFetch(
		'/admin/sales/order/cancel', {
		method: HTTP_METHOD.POST,
		body: {
			order_id: record.value.id,
			cancel_code: cancel_type.value.value,
			cancel_note: cancel_note.value
		}
	});
	form_messages.value = res_data.messages;
	if (!res_data.result) {
		is_loading.value = false;
		return;
	}
	reloadNuxtApp();
}

async function processSalesOrder() {
	if (!record.value || !record.value.id) {
		return;
	}

	is_loading.value = true;
	const res_data = await useApiFetch(
		'/admin/sales/order/process/' + record.value.id, {
		method: HTTP_METHOD.POST
	});

	form_messages.value = res_data.messages;
	if (!res_data.result) {
		is_loading.value = false;
		return;
	}
	reloadNuxtApp();
}

async function syncSalesOrder() {
	if (!record.value || !record.value.id) {
		return;
	}
	is_loading.value = true;
	const res_data = await useApiFetch(
		'/admin/sales/order/sync/' + record.value.id, {
		method: HTTP_METHOD.POST
	});

	dialog_sync.value = false;
	form_messages.value = res_data.messages;
	if (!res_data.result) {
		is_loading.value = false;
		return;
	}
	reloadNuxtApp();
}

function sendEmail() {

}

function onChangeCancelType() {
	console.log("onChangeCancelType");
	console.log(cancel_type.value);
}

function getConfigurableViewPath(configurable_id) {
	return "/catalog/configurable/view?id=" + configurable_id + "&mode=view";
}

function getVariantViewPath(variant_id) {
	return "/catalog/variant/view?id=" + variant_id + "&mode=view";
}

async function onCityModelUpdate(cityField, getFieldByCode, saveFieldValue) {
	await (saveFieldValue && saveFieldValue(cityField));

	if (record.value) {
		record.value.shipping_address_ward = "";
	}

	const ward_field = getFieldByCode('shipping_address_ward');
	if (ward_field && saveFieldValue) {
		await saveFieldValue(ward_field);
	}
}

// Watch city change to refresh ward list
watch(() => record.value?.shipping_address_city,
	async (new_city, old_city) => {
		if (!new_city) {
			ward_options.value = [];
			return;
		}

		try {
			const pagination = new Pagination();
			pagination.size = -1;
			const filters = [{
				field: { code: 'city_code' },
				expression: new_city,
			}];

			const filter_ward_request = new FilterRequest(pagination, filters);
			const ward_data = await $location.filterWards(filter_ward_request);
			const rawItems = ward_data?.records || [];
			ward_options.value = rawItems.map((r) => ({
				title: r?.name ?? "",
				value: r?.ward_code
			}));
		} catch (e) {
			console.error('Failed to load wards for city', new_city, e);
		}
	}
);

onMounted(async () => {
	init();
})

</script>
