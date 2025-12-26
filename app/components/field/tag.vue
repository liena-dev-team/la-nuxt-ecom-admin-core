<template>
	<v-combobox v-model="model_value" hide-selected multiple chips closable-chips clearable
		outlined prepend-inner-icon="mdi-tag-multiple-outline" :disabled="mode == FORM_MODE.VIEW" 
		@update:model-value="onValueChange" @blur="saveFieldValue">
	</v-combobox>
</template>

<script setup>

// Props
const { mode, keywords } = defineProps({
	mode: {
		type: String,
		default: ""
	},
	keywords: {
		type: Array,
		default: []
	},
});

// watch
watch(() => keywords, function(new_val) {
	model_value.value = new_val;
})

// Emits
const emit = defineEmits([
	"update:model-value", "blur",
]);

// Model
const model_value = defineModel();

// Function
async function onValueChange() {
	emit("update:model-value", model_value.value);
}

async function saveFieldValue() {
	emit("blur", model_value.value);
}

</script>

<style lang="less"></style>
