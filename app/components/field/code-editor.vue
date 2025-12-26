<template>
	<div class="la-field-code-editor" v-if="code_editor">
		<codemirror v-model="modelValue" placeholder="Code goes here..." :style="{ height: code_editor.height + 'px' }"
			:autofocus="true" :indent-with-tab="true" :tab-size="4" :extensions="extensions" @ready="handleReady"
			:disabled="form_mode == FORM_MODE.VIEW" @change="onChange" @focus="onFocus" @blur="onBlur" />
	</div>
</template>

<script setup>

/**
 * REFERENCE:
 * https://github.surmon.me/vue-codemirror
 */

// Import
// import { Codemirror } from 'vue-codemirror';
// import { javascript } from '@codemirror/lang-javascript';
// import { css } from '@codemirror/lang-css';
// import { json } from '@codemirror/lang-json';

const { Codemirror } = await import('vue-codemirror');
const { javascript } = await import('@codemirror/lang-javascript');
const { css } = await import('@codemirror/lang-css');
const { json } = await import('@codemirror/lang-json');

// Emits
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);

// Props
const { field } = defineProps({
	field: {
		type: Object,
		default: null
	},
	form_mode: {
		type: String,
		default: FORM_MODE.VIEW
	}
});

// Variables
const code_editor = field?.field_code_editor;

let extensions = [];
switch (code_editor?.language) {
	case FIELD_CODE_EDITOR.LANGUAGE_JS:
		extensions = [javascript()];
		break;
	case FIELD_CODE_EDITOR.LANGUAGE_JSON:
		extensions = [json()];
		break;
	case FIELD_CODE_EDITOR.LANGUAGE_CSS:
		extensions = [css()];
		break;
}

// Model
const modelValue = defineModel();

// Functions
const handleReady = (payload) => {
}

function onChange(e) {
	emit("update:modelValue", modelValue.value);
}

function onFocus(e) {
	emit("focus", modelValue.value);
}

function onBlur(e) {
	emit("blur", modelValue.value);
}

</script>

<style lang="less">
</style>
