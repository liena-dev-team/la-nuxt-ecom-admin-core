<template>
	<div class="la-rating-star">
		<v-rating v-model="internalValue" :length="max" :readonly="mode === 'view'" color="yellow"
			background-color="grey lighten-1" density="compact" @update:model-value="onUpdate" />
	</div>
</template>

<script setup>
const emit = defineEmits(['update:modelValue'])

const { mode, max, modelValue, field } = defineProps({
	mode: {
		type: String,
		default: "view"
	},
	max: {
		type: Number,
		default: 5
	},
	modelValue: {
		type: Object,
		default: () => ({})
	},
	field: {
		type: Object,
		default: () => ({})
	}
})

const internalValue = ref(
	modelValue[field.code] != null && modelValue[field.code] !== ''
		? Number(modelValue[field.code])
		: Number(field.value) || 0
);

watch(
	() => [modelValue[field.code], field.value],
	([newModelValue, newFieldValue]) => {
		if (newModelValue != null && newModelValue !== '') {
			internalValue.value = Number(newModelValue);
		} else {
			internalValue.value = Number(newFieldValue) || 0;
		}
	}
);

function onUpdate(val) {
	emit('update:model-value', { ...modelValue, [field.code]: val });
	const el = document.activeElement;
	if (el) el.blur();
}
</script>

<style lang="less">
.la-rating-star {
	display: flex;
	align-items: center;
}
</style>