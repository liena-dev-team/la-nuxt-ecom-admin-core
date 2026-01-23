<template>
	<div v-if="rich_editor" :style="{ 'pointer-events': (form_mode == FORM_MODE.VIEW) ? 'none' : 'auto' }">
		<textarea :id="rich_editor.html_id" v-model="modelValue"></textarea>
	</div>
</template>

<script setup>

// Emits
const emit = defineEmits(["blur"]);

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

const rich_editor = field?.field_rich_editor;

// Variables
let tiny_editor = null;

// Model
const modelValue = defineModel();

// Expose
defineExpose({
	setContent
});

// Functions
function setContent(new_content) {
	if (tiny_editor) {
		tiny_editor.setContent(new_content);
	}
}

async function initEditor() {
	const plugins = "advlist autolink lists link image charmap preview anchor \
	emoticons searchreplace visualblocks code fullscreen insertdatetime media table quickbars";

	let result = await tinymce.init({
		license_key: 'gpl',
		selector: "#" + rich_editor.html_id,
		plugins: plugins,
		toolbar: "bold italic underline strikethrough | fontsizeselect \
			| forecolor backcolor | alignleft aligncenter alignright alignjustify| bullist numlist \
			| outdent indent blockquote | undo redo | axupimgs | removeformat | table | emoticons \
			| styleselect link image",
		height: rich_editor.height,
		// menubar: false,
		// content_css: false,
		// skin: false,
		// quickbars_insert_toolbar: false,
		branding: false,
		base_url: "/library/tinymce",
		suffix: '.min',
		// skin_url: '/css/tinymce/skins/ui/tinymce-5',
		// content_css: '/css/tinymce/skins/ui/tinymce-5/content.css',
		init_instance_callback: function (editor) {
			editor.on('keyup', function (e) {
				// console.log('Editor contents have changed:', editor.getContent());
				emit("update:model-value", editor.getContent());
			});

			editor.on('change', function (e) {
				// console.log('Editor contents have changed:', editor.getContent());
				emit("update:model-value", editor.getContent());
			});

			editor.on("blur", function (e) {
				// console.log('Editor contents have blured:', editor.getContent());
				emit("blur", editor.getContent());
			});
		}
	});

	if (result && result.length > 0) {
		tiny_editor = tinymce.get(rich_editor.html_id);
	}
}

onMounted(() => {
	initEditor();
})

onUnmounted(() => {
	if (rich_editor && tinymce?.get(rich_editor.html_id)) {
		tinymce.get(rich_editor.html_id).remove();
	}
})

</script>
