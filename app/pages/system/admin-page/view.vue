<template>
	<page-card page_class="App\AdminPage\System\AdminPageCard" :go_back="true" :editable="false" :insertable="false"
		:deletable="false" v-model:record="record">
		<template #["part:fields"]>
			<ol class="pa-4" v-if="record">
				<li v-for="field in record.fields">
					<span>{{ field.caption }}</span>
				</li>
			</ol>
		</template>
		<template #["part:actions"]>
			<ol class="pa-4" v-if="record">
				<li v-for="action in record.actions">
					<span>{{ action.label }}</span>
				</li>
			</ol>
		</template>
	</page-card>
</template>

<script setup>

// Refs
const record = ref();

</script>
