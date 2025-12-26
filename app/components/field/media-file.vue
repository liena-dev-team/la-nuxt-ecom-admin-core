<template>
	<div class="la-field-media-file">
		<div class="file-list" :class="[mode]">
			<v-btn class="btn-select" @click="openMediaGallery" density="comfortable" variant="tonal" size="small">
				<v-icon icon="mdi-plus"></v-icon>
				<span>Select...</span>
			</v-btn>
			<div v-if="is_loading">
				<v-progress-linear color="deep-purple-accent-4" height="6" indeterminate rounded></v-progress-linear>
			</div>
			<div v-else class="file-container" v-if="files && files.length > 0">
				<draggable :list="files" item-key="id" :animation="200" handle=".drag-handle" @end="onDragEnd">
					<template #item="{ element: file, index: i }">
						<div class="file" :key="file.id">
							<v-icon class="drag-handle" small
								style="cursor:move;position:absolute;left:4px;top:4px;">mdi-drag</v-icon>
							<div class="img">
								<img :src="file.path" v-bind:data-src="file.path" data-fancybox="file-gallery" />
							</div>
							<div class="name"> {{ file.name }} </div>
							<div class="info">{{ file.extension }} - {{ file.width }}x{{ file.height }}</div>
							<div class="actions">
								<v-menu>
									<template v-slot:activator="{ props }">
										<v-btn v-bind="props" icon="mdi-dots-horizontal" density="compact"
											variant="text">
										</v-btn>
									</template>
									<v-list density="compact" @click:select="onSelectMenuItem($event, file)">
										<v-list-item value="edit" v-if="field_media_file.edit_api_path">
											<v-list-item-title>Edit</v-list-item-title>
										</v-list-item>
										<v-list-item value="delete">
											<v-list-item-title>Delete</v-list-item-title>
										</v-list-item>
									</v-list>
								</v-menu>
							</div>
						</div>
					</template>
				</draggable>
			</div>
		</div>

		<!-- Dialog -->
		<v-dialog v-model="dialog_media_gallery" fullscreen>
			<v-card>
				<v-toolbar>
					<v-btn icon="mdi-close" @click="dialog_media_gallery = false"></v-btn>
					<v-toolbar-title> Media Gallery </v-toolbar-title>
					<v-spacer></v-spacer>
					<v-toolbar-items>
						<v-btn text="Cancel" variant="text" @click="dialog_media_gallery = false"></v-btn>
						<v-btn v-if="browsed_file" color="primary" text="Select" variant="tonal"
							@click="selectFile"></v-btn>
					</v-toolbar-items>
				</v-toolbar>
				<v-card-text>
					<file-browser v-model:selected_item="browsed_file" :field_media_file="field_media_file">
					</file-browser>
				</v-card-text>
			</v-card>
		</v-dialog>

		<!-- Edit File -->
		<v-dialog v-model="dialog_edit_file" transition="dialog-bottom-transition" fullscreen>
			<v-card v-if="current_file">
				<v-toolbar>
					<v-btn icon="mdi-close" @click="dialog_edit_file = false"></v-btn>
					<v-toolbar-title>Edit</v-toolbar-title>
					<v-toolbar-items>
						<v-btn text="Cancel" variant="text" @click="dialog_edit_file = false"></v-btn>
						<v-btn text="Save" variant="text" @click="submitEditFile(current_file)"></v-btn>
					</v-toolbar-items>
				</v-toolbar>
				<v-card-text>
					<v-form>
						<v-container>
							<v-row v-for="field in field_media_file.custom_fields">
								<!-- Label -->
								<v-col cols="4">
									<div class="caption">
										<span class="label"> {{ field.caption }}</span>
										<span class="dots"></span>
									</div>
								</v-col>
								<!-- Control -->
								<v-col cols="8">
									<!-- String -->
									<v-text-field v-model="current_file[field.code]"
										v-if="field.input_type == FIELD_INPUT_TYPE.STRING" density="compact" clearable
										variant="outlined" hide-details="auto">
									</v-text-field>
									<!-- Int -->
									<v-text-field v-model="current_file[field.code]"
										v-if="field.input_type == FIELD_INPUT_TYPE.INT" type="number" density="compact"
										clearable variant="outlined" hide-details="auto">
									</v-text-field>
									<!-- Decimal -->
									<v-text-field v-model="current_file[field.code]"
										v-if="field.input_type == FIELD_INPUT_TYPE.DECIMAL" type="number"
										density="compact" clearable variant="outlined" hide-details="auto">
									</v-text-field>
								</v-col>
							</v-row>
						</v-container>
					</v-form>
				</v-card-text>
			</v-card>
		</v-dialog>


	</div>
</template>

<script setup>
import draggable from 'vuedraggable';

// Import
import { Fancybox } from '@fancyapps/ui/dist/index.esm.js';

// Emits
const emit = defineEmits(["items:change"]);

// Props
const { mode, field, record } = defineProps({
	mode: {
		type: String,
		default: FORM_MODE.VIEW
	},
	field: {
		type: Object,
		default: null
	},
	record: {
		type: Object,
		default: null
	},
})

// Models
const files = defineModel('files', { default: [] });
// Refs
const is_loading = ref(false);
const field_media_file = field.field_media_file;
const dialog_media_gallery = ref(false);
const dialog_edit_file = ref(false);
const browsed_file = ref([]);
const current_file = ref();

// Function
function openMediaGallery() {
	dialog_media_gallery.value = true;
}

async function selectFile() {
	if (!browsed_file.value || browsed_file.value.length === 0) {
		return;
	}
	let new_files = [];
	if (field_media_file.multiple) {
		new_files = files.value ? [...files.value] : [];
		browsed_file.value.forEach(file => {
			if (!new_files.some(f => f.id == file.id)) {
				new_files.push(file);
			}
		});
	} else {
		new_files = [browsed_file.value[0]];
	}
	await addMediaFiles(new_files);
	dialog_media_gallery.value = false;
}

function onSelectMenuItem($event, file) {
	switch ($event.id) {
		case "edit":
			current_file.value = file;
			dialog_edit_file.value = true;
			break;
		case "delete":
			removeFile(file);
			break;
	}
}

async function removeFile(removed_file) {
	// Delete from files
	const new_files = files.value.filter(file => file.id != removed_file.id);
	addMediaFiles(new_files);
}

async function onDragEnd() {
	addMediaFiles(files.value);
}

async function addMediaFiles(new_files) {
	is_loading.value = true;
	const result_upload = await useApiFetch(
		field_media_file.add_api_path, {
		method: "POST",
		body: {
			record: record,
			field: field,
			files: new_files,
		}
	});

	// Emit event
	if (result_upload && result_upload.result) {
		emit("items:change", field, new_files);

		// Make fancybox for new files
		Fancybox.bind('[data-fancybox="file-gallery"]', {});
	}

	is_loading.value = false;
}

async function submitEditFile(file) {
	dialog_edit_file.value = false;
	is_loading.value = true;
	const edit_response = await useApiFetch(
		field_media_file.edit_api_path, {
		method: "POST",
		body: {
			record: record,
			field: field,
			file: file,
		}
	});

	is_loading.value = false;
}

onMounted(() => {
	Fancybox.bind('[data-fancybox="file-gallery"]', {});
})

</script>

<style lang="less">
.la-field-media-file {
	min-height: 120px;
	border: 1px solid #ccc;
	border-radius: 8px;
	padding: 8px;

	.file-list {
		&.view {
			.btn-select {
				pointer-events: none;
			}

			.file {
				.actions {
					display: none;
				}
			}
		}

		.file-container {
			display: flex;
			flex-wrap: wrap;
			flex-direction: row;
			gap: 8px;
			-webkit-user-select: none;
			-moz-user-select: none;
			user-select: none;
			padding: 8px 0px;
			overflow-x: scroll;

			>div {
				display: flex;
				column-gap: 8px;
			}

			.file {
				display: grid;
				gap: 4px;
				position: relative;
				width: 200px;

				.img {
					display: flex;
					align-items: center;
					border: 1px dashed #ccc;
					border-radius: 8px;
					height: 200px;

					img {
						width: 100%;
						height: auto;
						cursor: pointer;
					}
				}

				.name {
					max-height: 50px;
					-webkit-box-orient: vertical;
					box-orient: vertical;
					-webkit-line-clamp: 2;
					line-clamp: 2;
					display: -webkit-box;
					font-size: 16px;
					font-weight: bold;
					line-height: 20px;
					overflow: hidden;
					padding-bottom: 2px;
					text-overflow: ellipsis;
					white-space: pre-line;
					word-wrap: break-word;
				}

				.info {}

				.actions {
					position: absolute;
					font-size: 20px;
					top: 4px;
					right: 4px;
				}
			}
		}
	}

}
</style>
