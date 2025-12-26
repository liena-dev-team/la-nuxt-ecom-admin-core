<template>
	<page-list page_class="App\AdminPage\Catalog\VariantWebList">
		<template #["field:price"]="{ field }">
			<span v-html="formatPrice(field.value, true)"></span>
		</template>
	</page-list>
</template>
