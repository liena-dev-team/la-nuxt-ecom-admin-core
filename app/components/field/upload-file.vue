<template>
	<div class="la-field-upload-file" v-if="field && field_upload_file">
		<!-- File List -->
		<draggable class="files" item-key="id" :list="uploaded_files" @change="onDragDropFiles">
			<template #item="{ element }">
				<div v-if="element.media_file" class="file">
					<div v-if="!element.media_file.enabled" class="disabled-background">Disabled</div>

					<div class="actions" v-if="mode == FORM_MODE.EDIT">
						<v-btn @click="onDeleteFile(element)" class="delete-file-btn" icon="mdi-delete" size="small"
							density="comfortable"></v-btn>
						<v-btn @click="onEditFile(element)" class="edit-file-btn" icon="mdi-pencil" size="small"
							density="comfortable"></v-btn>
					</div>

					<img :src="element.path" style="max-width: 100%;" v-bind:data-src="element.path"
						data-fancybox="file-gallery" />
					
					<div class="media-file">
						<div class="name"> {{ element.media_file.name }}.{{ element.media_file.extension }}</div>
						<div class="desc"> {{ element.media_file.description }}</div>
						<div class="desc"> {{ element.media_file.link }}</div>
					</div>
				</div>
			</template>
		</draggable>

		<!-- Upload Button -->
		<div class="upload-btn" v-if="mode == FORM_MODE.EDIT">
			<label :for="'file-upload-' + field_upload_file.usage_type" class="custom-file-upload">
				<v-icon icon="mdi-plus" size="x-small"></v-icon> Upload
			</label>
			<input :accept="field_upload_file.accept_types" type="file"
				:id="'file-upload-' + field_upload_file.usage_type" ref="myFiles" @change="onFileInputChange">
		</div>

		<!-- Dialog -->
		<v-dialog v-model="dialog_media_file">
			<v-card v-if="selected_media_file">
				<v-card-text>
					<v-toolbar density="compact">
						<v-toolbar-title>Media File</v-toolbar-title>
						<v-spacer></v-spacer>
						<div class="d-flex ga-2 pa-2">
							<v-chip v-if="is_saving" variant="flat" color="blue"> Saving... </v-chip>
							<v-chip v-else variant="flat" color="green" prepend-icon="mdi-check-bold"> Saved </v-chip>
							<slot name="actions"></slot>
						</div>
					</v-toolbar>
					<v-container>
						<v-row>
							<v-col>
								<v-checkbox v-model="selected_media_file.enabled" label="Enabled"
									@change="onValueFocused(false)"></v-checkbox>
								<v-text-field placeholder="Media Description" v-model="selected_media_file.description"
									density="compact" :variant="calculateFieldVariant(field)" hide-details="auto"
									:disabled="!field.editable" @update:focused="onValueFocused($event)">
								</v-text-field>
								<v-text-field placeholder="Media Link" v-model="selected_media_file.link"
									density="compact" :variant="calculateFieldVariant(field)" hide-details="auto"
									:disabled="!field.editable" @update:focused="onValueFocused($event)">
								</v-text-field>
							</v-col>
						</v-row>
					</v-container>
				</v-card-text>
			</v-card>

		</v-dialog>
	</div>

</template>

<script setup>

// Import
import { Fancybox } from '@fancyapps/ui/dist/index.esm.js';

// Emits
const emit = defineEmits(["uploaded"]);

// Props
const { mode, field, record, media_api_path } = defineProps({
	mode: {
		type: String,
		default: ""
	},
	field: {
		type: Object,
		default: null
	},
	record: {
		type: Object,
		default: null
	},
	media_api_path: {
		type: Object,
		default: null
	}
});

// Refs
const uploaded_files = ref([]);
const field_upload_file = field.field_upload_file;
const dialog_media_file = ref(false);
const is_saving = ref(false);
const selected_media_file = ref();

// Watch
watch(() => record[field.code], (newValue) => {
	getMediaFiles();
});

// Functions
async function getMediaFiles() {
	if (field_upload_file.multiple) {
		// Multiple Files
		const media_ids = record[field.code];
		uploaded_files.value = [];
		if (media_ids && media_ids.length > 0) {
			for (let i = 0; i < media_ids.length; i++) {
				const media_id = media_ids[i];
				const media_file = await getMediaFile(media_id);
				if (!media_file) {
					continue;
				}

				const file_path = '/api/media' + media_file.path;
				const file_data = await getFileFromUrl(file_path);
				uploaded_files.value.push({
					id: media_file.id,
					path: file_path,
					data: file_data,
					media_file: media_file
				});
			}
		}

		// Sort media files
		uploaded_files.value.sort(function (a, b) {
			return a.media_file.position - b.media_file.position;
		});
	} else {
		// Single File
		const media_id = record[field.code];
		if (media_id) {
			const media_file = await getMediaFile(media_id);
			if (!media_file) {
				return;
			}

			const file_path = '/api/media' + media_file.path;
			const file_data = await getFileFromUrl(file_path);
			uploaded_files.value = [{
				path: file_path,
				data: file_data,
				media_file: media_file
			}];

			selected_media_file.value = media_file;
		} else {
			uploaded_files.value = [];
		}
	}
}

async function getMediaFile(id) {
	const res_data = await useApiFetch(
		"/admin/media/file/read/" + id, {
		method: "GET"
	});

	if (res_data.result) {
		return res_data.record;
	}
}

async function uploadFile(file = null, media_id = null) {
	const form_data = new FormData();
	form_data.append('uploaded_file', file);
	form_data.append('media_id', media_id);
	form_data.append('field', JSON.stringify(field));
	form_data.append('record', JSON.stringify(record));

	const upload_res = await useApiFetch(
		field.field_upload_file.upload_api_path, {
		method: "POST",
		body: form_data
	});

	if (upload_res.result) {
		emit("uploaded", file);

		// Case: file is removed
		if (!file && media_id) {
			// Remove deleted media id
			uploaded_files.value = uploaded_files.value.filter((file) => {
				return file.media_file.id != media_id
			});
		}
	}

}

async function onValueFocused(is_focused) {
	if (!selected_media_file.value) {
		return;
	}

	if (!is_focused || !selected_media_file.value) {
		is_saving.value = true;
		const res_data = await useApiFetch(
			"/admin/media/file/update/" + selected_media_file.value.id, {
			method: "PUT",
			body: selected_media_file.value
		});

		if (res_data.result) {
			is_saving.value = false;

			const new_media_file = await getMediaFile(selected_media_file.value.id);
			for (let i in uploaded_files.value) {
				const uploaded_file = uploaded_files.value[i];
				if (uploaded_file.media_file.id == selected_media_file.value.id) {
					uploaded_file.media_file = new_media_file;
					break;
				}
			}
			return res_data.record;
		}

		is_saving.value = false;
	}
}

function calculateFieldVariant(f) {
	if (!f.editable) {
		return "plain";
	}

	switch (mode) {
		case FORM_MODE.EDIT:
			return "outlined";
		default:
			return "plain";
	}
}

function onFileInputChange(e) {
	let files = e.target.files || e.dataTransfer.files;
	if (!files.length) return;

	if (field_upload_file.multiple) {
		for (var i = 0; i < files.length; i++) {
			const file = files[i];
			uploadFile(file);
		}
	} else {
		const file = files[0];
		if (selected_media_file.value) {
			uploadFile(file, selected_media_file.value.id);
		} else {
			uploadFile(file);
		}
	}
}

function onDeleteFile(uploaded_file) {
	uploadFile(null, uploaded_file.media_file.id);
}

function onEditFile(uploaded_file) {
	dialog_media_file.value = !dialog_media_file.value;
	if (dialog_media_file.value) {
		selected_media_file.value = uploaded_file.media_file
	}
}

function onDragDropFiles(e) {
	updateFilesOrder();
}

async function updateFilesOrder() {
	let order = [];
	for (let i in uploaded_files.value) {
		const uploaded_file = uploaded_files.value[i];
		order.push(uploaded_file.media_file.id);
	}

	const res_data = await useApiFetch(
		"/admin/media/file/positions", {
		method: "PUT",
		body: {
			order: order
		}
	});

	return res_data.result;
}

onMounted(() => {
	Fancybox.bind('[data-fancybox="file-gallery"]', {});
	getMediaFiles();
})

</script>

<style lang="less">
.la-field-upload-file {
	display: flex;
	flex-wrap: wrap;
	flex-direction: column;
	justify-content: center;
	min-height: 160px;

	input[type="file"] {
		display: none;
	}

	.files {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;

		.file {
			display: grid;
			position: relative;
			max-width: 200px;
			border-radius: 8px;
			overflow: hidden;
			align-content: stretch;
			align-items: stretch;

			.media-file {
				display: grid;
				gap: 4px;
				padding: 4px;

				.name {
					border-bottom: 1px solid #ccc;
				}
			}

			.actions {
				display: grid;
				gap: 8px;
				position: absolute;
				top: 0px;
				right: 0px;
				margin: 4px 4px;
				display: none;

				.delete-file-btn {}

				.edit-file-btn {}
			}

			&:hover {
				.actions {
					display: grid;
				}
			}

			.disabled-background {
				height: 100%;
				width: 100%;
				position: absolute;
				background-color: #2b2b2b8a;
				display: grid;
				align-items: center;
				justify-content: center;
				font-size: 30px;
				font-weight: 600;
				color: #ffffff;
				user-select: none;
			}
		}
	}

	.upload-btn {
		.custom-file-upload {
			border: 1px solid #ccc;
			display: inline-block;
			padding: 6px 12px;
			cursor: pointer;
			border-radius: 4px;
		}
	}

}
</style>
