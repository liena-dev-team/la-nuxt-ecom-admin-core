<template>
	<div class="la-file-browser-grid" v-if="current_folder_node">
		<!-- Toolbar -->
		<div class="toolbar">
			<v-toolbar density="compact">
				<div class="actions">
					<v-btn prepend-icon="mdi-folder" size="small" variant="elevated" @click="openDialogNewFolder">
						<span>New Folder</span>
					</v-btn>
					<v-btn prepend-icon="mdi-upload" size="small" variant="elevated" @click="openDialogUpload">
						<span>Upload Files</span>
					</v-btn>
				</div>
				<v-spacer></v-spacer>
				<div class="actions">
					<v-btn color="error" prepend-icon="mdi-delete" size="small" variant="elevated"
						@click="openDialogDeleteFolder">
						<span>Delete Folder</span>
					</v-btn>
				</div>
				<template v-slot:extension>
					<div v-if="current_folder_node" class="current-folder-path">
						<div>Path: {{ current_folder_node.data?.relative_path }}</div>
					</div>
				</template>
			</v-toolbar>
		</div>
		<!-- Form Messages -->
		<form-message :messages="form_messages"></form-message>
		<!-- Loading -->
		<div v-if="is_loading" class="grid-loading">
			<v-progress-circular indeterminate :size="60" :width="8" color="blue-lighten-1"></v-progress-circular>
		</div>
		<!-- Grid -->
		<div v-else class="grid">
			<div class="item" v-for="(item, i) in file_items" :key="i" @click="onClickItem(item)"
				:class="{ 'selected': Array.isArray(current_selected) ? current_selected.some(f => f.id == item.id) : current_selected?.id == item.id }">
				<div class="type-image">
					<div class="image-container">
						<img v-if="item.is_image" :src="item.path" />
					</div>
					<div class="name">{{ item.name }}</div>
					<div class="info">{{ item.extension }} - {{ item.width }}x{{ item.height }}</div>
					<div class="actions">
						<v-menu>
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" icon="mdi-dots-horizontal" density="compact" variant="tonal">
								</v-btn>
							</template>
							<v-list density="compact" @click:select="onSelectMenuItem($event, item)">
								<v-list-item value="view">
									<v-list-item-title>View</v-list-item-title>
								</v-list-item>
								<v-list-item value="edit">
									<v-list-item-title>Edit</v-list-item-title>
								</v-list-item>
								<v-list-item value="delete">
									<v-list-item-title>Delete</v-list-item-title>
								</v-list-item>
							</v-list>
						</v-menu>
					</div>
				</div>
			</div>
		</div>
		<!-- New Folder -->
		<v-dialog v-model="dialog_new_folder" transition="dialog-bottom-transition" max-width="480">
			<v-card>
				<v-card-text>
					<v-form>
						<v-container>
							<v-row>
								<v-col cols="12" md="12">
									<v-text-field v-model="new_folder_name" label="Name" required />
								</v-col>
							</v-row>
						</v-container>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-btn color="primary" variant="tonal" text="Confirm" @click="newFolder()"></v-btn>
					<v-spacer></v-spacer>
					<v-btn variant="tonal" text="No" @click="dialog_new_folder = false"></v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<!-- Detail -->
		<v-dialog v-model="dialog_detail" transition="dialog-bottom-transition" fullscreen>
			<v-card v-if="current_selected">
				<v-toolbar>
					<v-btn icon="mdi-close" @click="dialog_detail = false"></v-btn>
					<v-toolbar-title>Details</v-toolbar-title>
					<v-toolbar-items>
						<v-btn text="Cancel" variant="text" @click="dialog_detail = false"></v-btn>
						<v-btn text="Edit" variant="text"
							@click="dialog_detail = false; dialog_edit_file = true"></v-btn>
					</v-toolbar-items>
				</v-toolbar>
				<v-card-text>
					<v-container fluid>
						<v-row>
							<v-col cols="12" md="8" class="pa-2">
								<img :src="current_selected.path" style="max-width: 100%;" />
							</v-col>
							<v-spacer></v-spacer>
							<v-col cols="12" md="4" class="pa-2">
								<v-table style="word-break: break-word;">
									<tbody>
										<tr>
											<td> Name </td>
											<td>{{ current_selected.name }}</td>
										</tr>
										<tr>
											<td> Extension </td>
											<td>{{ current_selected.extension }}</td>
										</tr>
										<tr>
											<td> Path </td>
											<td>{{ current_selected.path }}</td>
										</tr>
										<tr>
											<td> URL </td>
											<td>
												<a :href="(BASE_URL.origin + current_selected.path)" target="_blank">
													{{ BASE_URL.origin + current_selected.path }}
												</a>
											</td>
										</tr>
										<tr>
											<td> Size </td>
											<td>{{ current_selected.size }}</td>
										</tr>
										<tr>
											<td> Mine Type </td>
											<td>{{ current_selected.mine_type }}</td>
										</tr>
										<tr>
											<td> Width </td>
											<td>{{ current_selected.width }}px</td>
										</tr>
										<tr>
											<td> Height </td>
											<td>{{ current_selected.height }}px</td>
										</tr>
										<tr>
											<td> Description </td>
											<td>{{ current_selected.description }}</td>
										</tr>
									</tbody>
								</v-table>
							</v-col>
						</v-row>
					</v-container>
				</v-card-text>
			</v-card>
		</v-dialog>
		<!-- Edit File -->
		<v-dialog v-model="dialog_edit_file" transition="dialog-bottom-transition" fullscreen>
			<v-card v-if="current_selected">
				<v-toolbar>
					<v-btn icon="mdi-close" @click="dialog_edit_file = false"></v-btn>
					<v-toolbar-title>Edit</v-toolbar-title>
					<v-toolbar-items>
						<v-btn text="Cancel" variant="text" @click="dialog_edit_file = false"></v-btn>
						<v-btn text="Save" variant="text" @click="saveFile"></v-btn>
					</v-toolbar-items>
				</v-toolbar>
				<v-card-text>
					<v-form>
						<v-container>
							<v-row>
								<v-col cols="12" md="12">
									<v-text-field v-model="edit_data.name" label="Name" required />
								</v-col>
								<v-col cols="12" md="12">
									<v-textarea v-model="edit_data.description" label="Description" />
								</v-col>
							</v-row>
						</v-container>
					</v-form>
				</v-card-text>
			</v-card>
		</v-dialog>
		<!-- Delete File -->
		<v-dialog v-model="dialog_delete_file" transition="dialog-bottom-transition" max-width="400">
			<v-card v-if="current_selected" title="Delete">
				<v-card-text>
					Do you want to delete '{{ current_selected.name }}.{{ current_selected.extension }}' ?
				</v-card-text>
				<v-card-actions>
					<v-btn variant="tonal" text="Yes" @click="requestDeleteFile()"></v-btn>
					<v-spacer></v-spacer>
					<v-btn color="primary" variant="tonal" text="No" @click="dialog_delete_file = false"></v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<!-- Delete Folder -->
		<v-dialog v-model="dialog_delete_folder" transition="dialog-bottom-transition" max-width="400">
			<v-card v-if="current_folder_node" title="Delete">
				<v-card-text>
					Do you want to delete '{{ current_folder_node.data.name }}' ?
				</v-card-text>
				<v-card-actions>
					<v-btn variant="tonal" text="Yes" @click="requestDeleteFolder()"></v-btn>
					<v-spacer></v-spacer>
					<v-btn color="primary" variant="tonal" text="No" @click="dialog_delete_folder = false"></v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<!-- Upload Files -->
		<v-dialog v-model="dialog_upload" class="la-file-browser-grid-upload" transition="dialog-bottom-transition"
			max-width="600">
			<v-card v-if="current_folder_node" title="Upload">
				<v-card-text>
					<form>
						<div class="field images">
							<div class="control">
								<input id="file-images" name="files[]" accept="image/*" multiple type="file"
									title="Đăng tải hình ảnh" @change="onUploadFilesChange">
								<label for="file-images" class="custom-file-upload">
									<div class="hint">Gửi hình chụp thực tế (tối đa 5 hình)</div>
								</label>
							</div>
						</div>
						<div class="field images-preview">
							<ol>
								<li v-for="image in upload_preview_images" :key="image.full_name" class="image">
									<v-btn class="btn-remove" icon="mdi-close" size="small" density="compact"
										@click.stop="removeUploadImage(image)">
									</v-btn>
									<img :src="image.src" />
									<div class="name">{{ image.full_name }}</div>
									<div class="size">
										{{ image.width }}x{{ image.height }} , {{ image.size_formatted }}
									</div>
								</li>
							</ol>
						</div>
					</form>
				</v-card-text>
				<v-card-actions>
					<v-btn variant="tonal" text="Upload" @click="requestUploadFiles()"></v-btn>
					<v-spacer></v-spacer>
					<v-btn color="primary" variant="tonal" text="No" @click="dialog_upload = false"></v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup>

// Use
const { $media_manager } = useNuxtApp();
const BASE_URL = useRequestURL();

// Emits
const emit = defineEmits([
	"folder:new", "folder:delete", "items:selected"
]);

const { field_media_file } = defineProps({
	field_media_file: {
		type: Object,
		default: {},
	},
});

// Ref
const current_folder_node = ref();
const is_loading = ref(false);
const dialog_new_folder = ref(false);
const dialog_detail = ref(false);
const dialog_edit_file = ref(false);
const dialog_delete_file = ref(false);
const dialog_delete_folder = ref(false);
const dialog_upload = ref(false);
const form_messages = ref([]);

const new_folder_name = ref("");
const upload_preview_images = ref([]);
const upload_files = ref([]);

// Model
const file_items = defineModel('items', { default: [] });
const current_selected = defineModel('selected_item', { default: [] });
const edit_data = ref({});

// Expose
defineExpose({
	setCurrentFolder
});

// Functions
function setCurrentFolder(selected_node) {
	if (selected_node.is_activated) {
		current_folder_node.value = selected_node;
		loadCurrentFolder();
	} else {
		current_folder_node.value = null;
		file_items.value = [];
	}
}

async function loadCurrentFolder() {
	if (!current_folder_node.value) {
		file_items.value = [];
		return;
	}

	is_loading.value = true;
	const node_data = current_folder_node.value.data;
	const result_data = await $media_manager.list(node_data.relative_path);
	is_loading.value = false;
	form_messages.value = result_data.messages;

	if (result_data.result) {
		file_items.value = result_data.items;
	} else {
		file_items.value = [];
	}
}

function onClickItem(item) {
	if (!Array.isArray(current_selected.value)) {
		current_selected.value = [];
	}
	if (field_media_file && !field_media_file.multiple) {
		current_selected.value.forEach(f => { f.is_selected = false; });
		current_selected.value = [item];
		item.is_selected = true;
	} else if (field_media_file && field_media_file.multiple) {
		const idx = current_selected.value.findIndex(f => f.id === item.id);
		if (idx === -1) {
			current_selected.value.push(item);
			item.is_selected = true;
		} else {
			current_selected.value.splice(idx, 1);
			item.is_selected = false;
		}
	}
	emit("items:selected", current_selected.value);
}

function onEditFile(item) {
	edit_data.value = { ...item };
	dialog_edit_file.value = true;
}

function onSelectMenuItem($event, item) {
	current_selected.value = item;
	switch ($event.id) {
		case "view":
			dialog_detail.value = true;
			break;
		case "edit":
			onEditFile(item);
			break;
		case "delete":
			dialog_delete_file.value = true;
			break;
	}
}

function openDialogNewFolder() {
	dialog_new_folder.value = true;
	new_folder_name.value = "";
}

function openDialogUpload() {
	if (current_folder_node.value) {
		dialog_upload.value = true;
	}
}

function openDialogDeleteFolder() {
	if (current_folder_node.value) {
		dialog_delete_folder.value = true;
	}
}

async function newFolder() {
	if (!new_folder_name.value) {
		return;
	}

	dialog_new_folder.value = false;
	is_loading.value = true;
	const result_data = await $media_manager.newFolder(
		current_folder_node.value.data.relative_path, new_folder_name.value
	);
	is_loading.value = false;
	form_messages.value = result_data.messages;

	if (result_data.result) {
		emit("folder:new");
	}
}

async function saveFile() {
	if (!current_selected.value) {
		return;
	}

	is_loading.value = true;
	const result_data = await $media_manager.editFilesInFo(
		current_selected.value.id, edit_data.value
	);
	is_loading.value = false;
	form_messages.value = result_data.messages;

	if (result_data.result) {
		loadCurrentFolder();
	}
	dialog_edit_file.value = false;
}

async function requestDeleteFile() {
	dialog_delete_file.value = false;
	if (!current_selected.value) {
		return;
	}

	is_loading.value = true;
	const result_data = await $media_manager.deleteFile(
		current_selected.value.id
	);
	is_loading.value = false;
	form_messages.value = result_data.messages;

	if (result_data.result) {
		loadCurrentFolder();
	}
}

async function requestDeleteFolder() {
	if (!current_folder_node.value) {
		return;
	}

	dialog_delete_folder.value = false;
	is_loading.value = true;
	const result_data = await $media_manager.deleteFolder(
		current_folder_node.value.data.relative_path
	);
	is_loading.value = false;
	form_messages.value = result_data.messages;

	if (result_data.result) {
		current_folder_node.value = null;
		emit("folder:delete");
	}
}

function onUploadFilesChange(event) {
	const files = event.target.files;
	if (!files) return;

	if (upload_preview_images.value.length + files.length > 5) {
		alert("Chỉ được chọn tối đa 5 hình!");
		return;
	}

	upload_files.value = files;

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new window.Image();
			img.onload = () => {
				upload_preview_images.value.push({
					src: e.target.result,
					file: file,
					full_name: file.name,
					width: img.width,
					height: img.height,
					size_formatted: (file.size / 1024).toFixed(1) + " KB"
				});
			};
			img.src = e.target.result;
		};

		reader.readAsDataURL(file);
	}
}

function removeUploadImage(image) {
	const index = upload_preview_images.value.indexOf(image);
	if (index >= 0) {
		upload_preview_images.value.splice(index, 1);
	}
}

async function requestUploadFiles() {
	dialog_upload.value = false;
	is_loading.value = true;
	const result_data = await $media_manager.uploadFiles(
		upload_files.value,
		current_folder_node.value.data.relative_path
	);
	is_loading.value = false;
	form_messages.value = result_data.messages;

	if (result_data.result) {
		loadCurrentFolder();
	}
}

</script>

<style lang="less">
.la-file-browser-grid {
	>.toolbar {
		.actions {
			display: flex;
			gap: 8px;
			padding: 0px 8px;
		}

		.current-folder-path {
			padding: 8px 12px;
			border-top: 1px solid #ccc;
			width: 100%;
			margin-top: 4px;
		}
	}

	>.grid-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 300px;
	}

	>.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		user-select: none;
		padding: 8px 0px;

		.item {
			border: 1px solid rgba(255, 255, 255, 0);
			border-radius: 8px;
			cursor: pointer;
			margin: 4px;
			padding: 4px;
			overflow: hidden;
			position: relative;

			&:hover {
				border-color: #2da7ff;

				.actions {
					display: block;
				}
			}

			&.selected {
				background-color: #c1e5ff;
			}

			.actions {
				font-size: 20px;
				position: absolute;
				top: 4px;
				right: 4px;
			}

			.type-image {
				width: 200px;

				.image-container {
					display: grid;
					align-items: center;
					align-content: center;
					height: 200px;
					border-radius: 8px;
					margin-bottom: 4px;
					overflow: hidden;

					img {
						width: 100%;
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
			}

		}
	}
}

.la-file-browser-grid-upload {
	.field.images-preview {
		margin-top: 12px;

		ol {
			display: flex;
			gap: 8px;
			flex-wrap: wrap;
			list-style: none;
			overflow-y: scroll;
			max-height: 400px;
		}

		.image {
			width: 200px;
			position: relative;

			img {
				width: 100%;
			}

			.btn-remove {
				position: absolute;
			}
		}
	}
}
</style>
