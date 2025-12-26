<template>
	<page-list page_class="App\AdminPage\Sales\SalesOrderList" :editable="false" :insertable="false" :deletable="false">
		<template #["field:status"]="{ field }">
			<div>
				<v-chip v-if="field.value == SALES_ORDER_STATUS.PENDING" density="compact">
					<span>Pending</span>
				</v-chip>
				<v-chip v-if="field.value == SALES_ORDER_STATUS.PENDING_PAYOO" density="compact">
					<span>Pending Payoo</span>
				</v-chip>
				<v-chip v-if="field.value == SALES_ORDER_STATUS.PROCESSING" density="compact" color="yellow"
					variant="flat">
					<span>Processing</span>
				</v-chip>
				<v-chip v-if="field.value == SALES_ORDER_STATUS.SHIPPING" density="compact" color="blue"
					variant="flat">
					<span>Shipping</span>
				</v-chip>
				<v-chip v-if="field.value == SALES_ORDER_STATUS.COMPLETE" density="compact" color="green"
					variant="flat">
					<span>Complete</span>
				</v-chip>
				<v-chip v-if="field.value == SALES_ORDER_STATUS.CANCELED" density="compact" color="red"
					variant="flat">
					<span>Canceled</span>
				</v-chip>
			</div>
		</template>
		<template #["field:grand_total"]="{ field }">
			<span v-html="formatPrice(field.value, true)"></span>
		</template>
	</page-list>
</template>

<script setup>

</script>
