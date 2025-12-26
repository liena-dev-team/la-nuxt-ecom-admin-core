<template>
	<page-card page_class="App\AdminPage\Sales\SalesQuoteCard" :editable="false" :insertable="false" :deletable="false"
		:go_back="true" :auto_save="false" v-model:record="record">
		<template #["part:items"]>
			<v-table density="compact" v-if="record">
				<thead>
					<tr>
						<th class="text-left"><strong>Variant ID</strong></th>
						<th class="text-left"><strong>Configurable ID</strong></th>
						<th class="text-left"><strong>Name</strong></th>
						<th class="text-left"><strong>Original Price</strong></th>
						<th class="text-left"><strong>Discount Amount</strong></th>
						<th class="text-left"><strong>Final Price</strong></th>
						<th class="text-left"><strong>Qty</strong></th>
						<th class="text-left"><strong>Row Total</strong></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in record.items" :key="item.id">
						<td>{{ item.variant_id }}</td>
						<td>{{ item.configurable_id }}</td>
						<td>{{ item.name }}</td>
						<td>{{ item.original_price }}</td>
						<td>{{ item.discount_amount }}</td>
						<td>{{ item.final_price }}</td>
						<td>{{ item.qty }}</td>
						<td>{{ item.row_total }}</td>
					</tr>
				</tbody>
			</v-table>
		</template>
		<template #["part:shipping_address"]>
			<v-table density="compact" v-if="record && record.shipping_address">
				<thead>
					<tr>
						<th class="text-left"><strong>Customer Address ID</strong></th>
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
</template>

<script setup>

const record = ref();

</script>

<style></style>
