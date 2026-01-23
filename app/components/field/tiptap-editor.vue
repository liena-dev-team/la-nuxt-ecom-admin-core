<template>
	<editor-content :editor="editor"/>
</template>

<script setup>

// Import
// import { Editor, EditorContent } from '@tiptap/vue-3'
// import StarterKit from '@tiptap/starter-kit'

const { Editor, EditorContent } = await import('@tiptap/vue-3');
const StarterKit = await import('@tiptap/starter-kit');

// Emits
const emit = defineEmits(['update:modelValue', 'blur']);

// Model
const modelValue = defineModel()

// Watch
watch(modelValue, (new_value, old_value) => {
	// HTML
	const isSame = editor.getHTML() === new_value
	// console.log("Watch");
	// console.log(editor.getHTML());
	// console.log(new_value);
	// JSON
	// const isSame = JSON.stringify(editor.getJSON()) === JSON.stringify(value)
	if (isSame) {
		// console.log("SAME");
		return
	}

	// console.log("New value");
	// console.log(new_value);
	editor.commands.setContent(new_value)
});

// Editor
const editor = new Editor({
	extensions: [StarterKit],
	content: modelValue.value,
	onUpdate: () => {
		// HTML
		emit('update:modelValue', editor.getHTML())
		// JSON
		// this.$emit('update:modelValue', editor.getJSON())
	},
	onBlur({ editor, event }) {
		// The editor isn’t focused anymore.
		console.log("BLUR !!");
		emit('blur', { editor, event });
	},
})

// Functions
onBeforeUnmount(() => {
	editor.destroy();
})

</script>

<style lang="less">
/* Basic editor styles */
.tiptap {
	:first-child {
		margin-top: 0;
	}

	/* List styles */
	ul,
	ol {
		padding: 0 1rem;
		margin: 1.25rem 1rem 1.25rem 0.4rem;

		li p {
			margin-top: 0.25em;
			margin-bottom: 0.25em;
		}
	}

	/* Heading styles */
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		line-height: 1.1;
		margin-top: 2.5rem;
		text-wrap: pretty;
	}

	h1,
	h2 {
		margin-top: 3.5rem;
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: 1.4rem;
	}

	h2 {
		font-size: 1.2rem;
	}

	h3 {
		font-size: 1.1rem;
	}

	h4,
	h5,
	h6 {
		font-size: 1rem;
	}

	/* Code and preformatted text styles */
	code {
		background-color: var(--purple-light);
		border-radius: 0.4rem;
		color: var(--black);
		font-size: 0.85rem;
		padding: 0.25em 0.3em;
	}

	pre {
		background: var(--black);
		border-radius: 0.5rem;
		color: var(--white);
		font-family: 'JetBrainsMono', monospace;
		margin: 1.5rem 0;
		padding: 0.75rem 1rem;

		code {
			background: none;
			color: inherit;
			font-size: 0.8rem;
			padding: 0;
		}
	}

	blockquote {
		border-left: 3px solid var(--gray-3);
		margin: 1.5rem 0;
		padding-left: 1rem;
	}

	hr {
		border: none;
		border-top: 1px solid var(--gray-2);
		margin: 2rem 0;
	}
}
</style>
