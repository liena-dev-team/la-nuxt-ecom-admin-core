<template>
	<page-list page_class="App\AdminPage\Sales\SalesQuoteList" :editable="false" :insertable="false" :deletable="false">
		<template #["field:grand_total"]="{ field }">
			<span v-html="formatPrice(field.value, true)"></span>
		</template>
	</page-list>
</template>
