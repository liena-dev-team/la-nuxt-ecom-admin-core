<template>
	<v-sheet>
		<v-container fluid>
			<v-row>
				<!-- Left Panel -->
				<v-col cols="12" md="4" class="pa-0">
					<v-card title="Configuration" :elevation="0">
						<template v-slot:append>
							<v-btn prepend-icon="mdi-plus" size="small" @click="openNewTab()">Add Tab</v-btn>
						</template>

						<v-card-text>
							<v-expansion-panels :modelValue="0" density="compact" variant="accordion">
								<v-expansion-panel v-for="(tab, index) in config_menu" :key="index">
									<v-expansion-panel-title>
										<strong>{{ tab.label }} ({{ tab.position }})</strong>
									</v-expansion-panel-title>
									<v-divider></v-divider>
									<v-expansion-panel-text>
										<v-btn-group variant="outlined" divided>
											<v-btn prepend-icon="mdi-plus" size="small" class="mb-4"
												@click="openNewSection(tab.id)">Add
												Section</v-btn>
											<v-btn prepend-icon="mdi-pencil" size="small" class="mb-4"
												@click="openEditConfig(tab)">Edit
												Tab</v-btn>
										</v-btn-group>

										<v-list v-if="tab.children && tab.children.length > 0">
											<v-list-item v-for="section in tab.children" :key="section.id"
												@click="onSectionClicked(section)">
												<v-list-item-title>{{ section.label }}</v-list-item-title>
											</v-list-item>
										</v-list>
									</v-expansion-panel-text>
								</v-expansion-panel>
							</v-expansion-panels>
						</v-card-text>
					</v-card>
				</v-col>
				<v-spacer></v-spacer>
				<!-- Right Panel -->
				<v-col cols="12" md="7" class="pa-0" v-if="selected_section">
					<v-toolbar density="compact">
						<v-btn @click="openNewGroup" size="small" prepend-icon="mdi-plus">Add Group</v-btn>
					</v-toolbar>
					<v-expansion-panels :modelValue="0" :elevation="0">
						<v-expansion-panel v-for="(group, index) in selected_section.children" :key="index">
							<v-expansion-panel-title><strong>{{ group.label }} ({{ group.children.length
							}})</strong></v-expansion-panel-title>
							<v-divider></v-divider>
							<v-expansion-panel-text>
								<v-btn-group variant="outlined" divided>
									<v-btn prepend-icon="mdi-plus" size="small" class="mb-4"
										@click="openNewField(group)">
										Add Field
									</v-btn>
									<v-btn prepend-icon="mdi-pencil" size="small" class="mb-4"
										@click="openEditConfig(group)">
										Edit Group
									</v-btn>
								</v-btn-group>

								<v-table v-if="group.children && group.children.length > 0">
									<tbody>
										<tr v-for="field in group.children" :key="field.id">
											<td>
												<div><strong>{{ field.label }}</strong></div>
												<div>{{ field.data_class }}</div>
											</td>
											<td>{{ getInputTypeLabel(field.input_type) }} </td>
											<td>
												<v-btn color="grey-lighten-1" icon="mdi-pencil" variant="text"
													@click="openEditConfig(field)"></v-btn>
											</td>
										</tr>
									</tbody>
								</v-table>

							</v-expansion-panel-text>
						</v-expansion-panel>
					</v-expansion-panels>
				</v-col>
			</v-row>

		</v-container>

		<!-- Dialog - Add config -->
		<v-dialog v-model="dialog_add_config" max-width="600">
			<v-card>
				<v-toolbar>
					<v-toolbar-title>Add Config</v-toolbar-title>
					<v-spacer></v-spacer>
					<v-btn icon="mdi-close" @click="dialog_add_config = false"></v-btn>
				</v-toolbar>
				<v-card-text>
					<!-- Label -->
					<v-text-field v-model="config_new_label" placeholder="Label" density="compact" variant="outlined"
						required>
					</v-text-field>
					<!-- Input Type -->
					<v-select v-if="config_new_type == SYSTEM_CONFIG_TYPE.FIELD" v-model="config_new_input_type"
						:items="getAllInputTypes()" density="compact" variant="outlined" placeholder="Input Type"
						required>
					</v-select>
					<!-- Data Class -->
					<v-text-field v-if="config_new_type == SYSTEM_CONFIG_TYPE.FIELD" v-model="config_new_data_class"
						placeholder="Data Class" density="compact" variant="outlined">
					</v-text-field>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text="Close" variant="plain" @click="dialog_add_config = false"></v-btn>
					<v-btn color="primary" variant="tonal" @click="addConfig">Save</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog - Edit config -->
		<v-dialog v-model="dialog_edit_config" max-width="600">
			<v-card>
				<v-toolbar>
					<v-toolbar-title>Edit Config</v-toolbar-title>
					<v-spacer></v-spacer>
					<v-btn icon="mdi-close" @click="dialog_edit_config = false"></v-btn>
				</v-toolbar>
				<v-card-text v-if="config_edit_data">
					<!-- Position -->
					<v-text-field type="number" v-model="config_edit_data.position" density="compact"
						variant="outlined" />
					<!-- Input Type -->
					<v-select v-if="config_edit_data.type == SYSTEM_CONFIG_TYPE.FIELD"
						v-model="config_edit_data.input_type" :items="getAllInputTypes()" density="compact"
						variant="outlined" placeholder="Input Type" required>
					</v-select>
					<!-- Data Class -->
					<v-text-field v-if="config_edit_data.type == SYSTEM_CONFIG_TYPE.FIELD"
						v-model="config_edit_data.data_class" placeholder="Data Class" density="compact"
						variant="outlined">
					</v-text-field>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-btn color="red" @click="askTodeleteConfig(config_edit_data)">Delete</v-btn>
					<v-spacer></v-spacer>
					<v-btn text="Close" variant="plain" @click="dialog_edit_config = false"></v-btn>
					<v-btn color="primary" variant="tonal" @click="editConfig">Update</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog - Delete config -->
		<v-dialog v-model="dialog_delete_config" max-width="600">
			<v-card>
				<v-toolbar>
					<v-toolbar-title>Add Config</v-toolbar-title>
					<v-spacer></v-spacer>
					<v-btn icon="mdi-close" @click="dialog_delete_config = false"></v-btn>
				</v-toolbar>
				<v-card-text v-if="config_delete_data">
					Do you want to delete config: {{ config_delete_data.label }} ?
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text="Close" variant="plain" @click="dialog_delete_config = false"></v-btn>
					<v-btn color="primary" variant="tonal" @click="deleteConfig">Delete</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

	</v-sheet>
</template>

<script setup>

// Constants

// Refs
const config_menu = ref([]);
const dialog_add_config = ref(false);
const config_new_type = ref();
const config_new_parent_id = ref(0);
const config_new_label = ref("");
const config_new_input_type = ref();
const config_new_data_class = ref("");

const dialog_edit_config = ref(false);
const config_edit_data = ref();

const dialog_delete_config = ref(false);
const config_delete_data = ref();

const selected_section = ref();

// Functions
async function getConfigMenu() {
	const res_data = await useApiFetch("/admin/system/config/menu", {
		method: HTTP_METHOD.GET
	});

	if (res_data.result) {
		config_menu.value = res_data.menu;

		// Get data for right panel
		if (selected_section.value) {
			selected_section.value = await getSectionById(selected_section.value.id);
		}
	}
}

async function addConfig() {
	try {
		if (!config_new_label.value) {
			return;
		}

		const res_data = await useApiFetch("/admin/system/config/create", {
			method: HTTP_METHOD.POST,
			body: {
				type: config_new_type.value,
				parent_id: config_new_parent_id.value,
				label: config_new_label.value,
				input_type: config_new_input_type.value,
				data_class: config_new_data_class.value
			}
		});

		if (!res_data.result) {
			return;
		}

		config_new_label.value = "";
		getConfigMenu();
	} catch (error) {
		console.error('Error saving data:', error);
	}

	dialog_add_config.value = false;
}

async function editConfig() {
	try {
		if (!config_edit_data.value) {
			return;
		}

		const res_data = await useApiFetch("/admin/system/config/edit", {
			method: HTTP_METHOD.PUT,
			body: {
				id: config_edit_data.value.id,
				position: config_edit_data.value.position,
				input_type: config_edit_data.value.input_type,
				data_class: config_edit_data.value.data_class,
			}
		});

		if (!res_data.result) {
			return;
		}

		config_edit_data.value = null;
		getConfigMenu();
	} catch (error) {
		console.error('Error saving data:', error);
	}

	dialog_edit_config.value = false;
}

async function deleteConfig() {
	try {
		if (!config_delete_data.value) {
			return;
		}

		const res_data = await useApiFetch("/admin/system/config/delete/" + config_delete_data.value.id, {
			method: HTTP_METHOD.DELETE
		});

		if (!res_data.result) {
			return;
		}

		config_delete_data.value = null;
		getConfigMenu();
	} catch (error) {
		console.error('Error saving data:', error);
	}

	dialog_delete_config.value = false;
	dialog_edit_config.value = false;
}

async function getSectionById(section_id) {
	try {
		if (!section_id) {
			return;
		}

		const res_data = await useApiFetch("/admin/system/config/section/" + section_id, {
			method: HTTP_METHOD.GET
		});

		if (!res_data.result) {
			return;
		}

		return res_data.menu;
	} catch (error) {
		console.error(error);
	}

	return null;
}

function openNewTab() {
	config_new_type.value = SYSTEM_CONFIG_TYPE.TAB;
	config_new_parent_id.value = 0;

	dialog_add_config.value = true;
}

function openNewSection(parent_id) {
	config_new_type.value = SYSTEM_CONFIG_TYPE.SECTION;
	config_new_parent_id.value = parent_id;

	dialog_add_config.value = true;
}

function openNewGroup() {
	if (!selected_section.value) {
		return;
	}

	config_new_type.value = SYSTEM_CONFIG_TYPE.GROUP;
	config_new_parent_id.value = selected_section.value.id;

	dialog_add_config.value = true;
}

function openNewField(group) {
	config_new_type.value = SYSTEM_CONFIG_TYPE.FIELD;
	config_new_parent_id.value = group.id;
	config_new_label.value = null;
	config_new_input_type.value = null;
	config_new_data_class.value = null;

	dialog_add_config.value = true;
}

function openEditConfig(menu) {
	config_edit_data.value = menu;
	dialog_edit_config.value = true;

	console.log(config_edit_data.value);
}

async function askTodeleteConfig(config_menu) {
	config_delete_data.value = config_menu;

	dialog_delete_config.value = true;
}

async function onSectionClicked(section) {
	selected_section.value = await getSectionById(section.id);

	console.log(selected_section.value);
}

onMounted(() => {
	getConfigMenu();
})

</script>

<style lang="less"></style>
