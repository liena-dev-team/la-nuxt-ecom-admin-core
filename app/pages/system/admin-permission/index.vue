<template>
	<v-sheet>
		<v-container fluid>
			<v-row no-gutters>
				<v-col cols="12" md="4" class="pa-2">
					<v-card>
						<v-card-title>Admin Permission</v-card-title>
						<v-card-text>
							<div class="pa-2">
								<v-select v-model="selected_role" :items="all_roles" density="compact" return-object
									variant="outlined" hide-details="auto" @update:model-value="onSelectRole">
								</v-select>
							</div>
							<div v-if="selected_role">
								<div v-if="selected_role.is_super_admin">
									<v-alert type="info" text="This role is Super Admin"></v-alert>
								</div>
								<div v-else>
									<advanced-tree :nodes="page_nodes" :node_selectable="false"
										@node:activated="onSelectPage">
										<template #["label"]="slot_data">
											<div class="element-label" v-if="slot_data.element.parent_id">
												<span class="el-title">{{ slot_data.element.title }} </span>
												<div class="el-icons">
													<v-icon v-if="slot_data.element.data.readable == 1"
														small>mdi-eye-circle</v-icon>
													<v-icon v-if="slot_data.element.data.insertable == 1"
														small>mdi-plus-circle</v-icon>
													<v-icon v-if="slot_data.element.data.editable == 1"
														small>mdi-pencil-circle</v-icon>
													<v-icon v-if="slot_data.element.data.deletable == 1"
														small>mdi-close-circle</v-icon>
												</div>
											</div>
											<div v-else>
												{{ slot_data.element.title }}
											</div>
										</template>
									</advanced-tree>
								</div>
							</div>
						</v-card-text>
						<v-divider></v-divider>
						<v-card-actions>
							<div class="d-flex">
								<v-btn size="small" @click="createPermissions" v-if="selected_role">Create Permissions</v-btn>
								<v-btn size="small" @click="resetPermission" v-if="selected_permission_id">Reset Permission</v-btn>
							</div>
						</v-card-actions>
					</v-card>
				</v-col>
				<v-spacer></v-spacer>
				<v-col cols="12" md="8" class="pa-2">
					<page-card id="la-system-permission-card" v-show="selected_permission_id" ref="page_card"
						page_class="App\AdminPage\System\AdminPagePermissionCard" :caption_fields="['caption']"
						v-model:record="current_permission" @field:changed="onFieldUpdated" :insertable="false">
						<template #["part:actions"]>
							<div class="action-group">
								<v-checkbox v-if="page" v-for="(action, index) in page.actions" multiple
									:hide-details="true" v-model="selected_actions" :key="action.code"
									:value="action.code" :label="action.label"
									@update:model-value="onActionsSelected" />
							</div>
						</template>
						<template #["part:fields"]>
							<div class="pa-2" v-if="page && page.fields.length > 0">
								<div class="d-flex ga-4">
									<v-btn variant="tonal" color="primary" size="small"
										@click="onSelectAllFields">Select All</v-btn>
									<v-btn variant="tonal" color="primary" size="small"
										@click="onSelectNoFields">Un-select All</v-btn>
								</div>
								<div class="field-group">
									<v-checkbox v-for="(field, index) in page.fields" multiple :hide-details="true"
										v-model="selected_fields" :key="field.code" :value="field.code"
										:label="field.caption" @update:model-value="onFieldsSelected" />
								</div>
							</div>
						</template>
						<template #["part:sections"]>
							<div class="section-group">
								<v-checkbox v-if="page" v-for="(section, index) in page.sections" multiple
									:hide-details="true" v-model="selected_sections" :key="section.code"
									:value="section.code" :label="section.caption"
									@update:model-value="onSectionsSelected" />
							</div>
						</template>
					</page-card>
				</v-col>
			</v-row>
		</v-container>
	</v-sheet>
</template>

<script setup>

// Plugins
const { $admin_user, $admin_page } = useNuxtApp();

// Template Ref
const page_card = useTemplateRef("page_card");
const current_permission = ref();
const page = ref();

// Refs
const selected_permission_id = ref();
const page_nodes = ref([]);
const selected_actions = ref();
const selected_fields = ref();
const selected_sections = ref();
const all_roles = ref([]);
const selected_role = ref();

// Functions
async function onSelectPage(node) {
	try {
		if (!node.is_activated) {
			// If not selected
			selected_permission_id.value = null;
			return;
		}

		selected_permission_id.value = node.id;
		if (selected_permission_id.value) {
			await page_card.value.loadById(selected_permission_id.value);
		}

		if (!current_permission.value) {
			return;
		}
		
		// Set actions
		selected_actions.value = current_permission.value.actions;
		// Set fields
		selected_fields.value = current_permission.value.fields;
		// Set sections
		selected_sections.value = current_permission.value.sections;

		// Get page by id
		const res_data = await $admin_page.getByClass(node.data.page_class);
		if (res_data) {
			page.value = res_data.record;
		}
	} catch (error) {
		console.log(error);
	}
}

function onActionsSelected() {
	// Update selected_actions to Page Permission
	if (current_permission.value) {
		current_permission.value.actions = selected_actions.value;
		page_card.value.requestUpdate();
	}
}

function onSelectAllFields() {
	if (!page.value) {
		return;
	}

	selected_fields.value = [];
	for (let i in page.value.fields) {
		const field = page.value.fields[i];
		selected_fields.value.push(field.code);
	}

	onFieldsSelected();
}

function onSelectNoFields() {
	selected_fields.value = [];
	onFieldsSelected();
}

function onFieldsSelected() {
	// Update selected_actions to Page Permission
	if (current_permission.value) {
		current_permission.value.fields = selected_fields.value;
		page_card.value.requestUpdate();
	}
}

function onSectionsSelected() {
	// Update selected_sections to Page Permission
	if (current_permission.value) {
		current_permission.value.sections = selected_sections.value;
		page_card.value.requestUpdate();
	}
}

async function getPages() {
	if (!selected_role.value || selected_role.value.is_super_admin) {
		page_nodes.value = [];
		return;
	}

	const filter_request = new FilterRequest();
	filter_request.filters = [
		{
			field: {
				code: "role_id",
			},
			expression: String(selected_role.value.id)
		}
	];

	filter_request.pagination.size = -1;
	const res_data = await $admin_page.filterPagePermissions(filter_request);
	if (res_data.result) {
		// Convert records to tree nodes
		const records = res_data.records;
		// Create group nodes
		let all_groups = {};
		for (let i in records) {
			const record = records[i];
			if (!all_groups[record["group_name"]]) {
				all_groups[record["group_name"]] = {
					id: record["group_name"],
					title: record["group_name"],
					parent_id: null,
					level: 0,
					children: []
				};
			}

			const group = all_groups[record["group_name"]];
			record["id"] = record["id"];
			record["title"] = record["caption"];
			record["parent_id"] = record["group_name"];
			record["level"] = 1;
			record["selectable"] = true;

			group.children.push(record);
		}

		// Create Nodes
		page_nodes.value = [];
		for (let i in all_groups) {
			const group = all_groups[i];

			for (let j in group.children) {
				const child = group.children[j];
				page_nodes.value.push(child);
			}

			group.children = null;
			page_nodes.value.push(group);
		}

	}
}

async function createPermissions() {
	if (!selected_role.value) {
		return;
	}

	const res_data = await $admin_page.populatePermissions(selected_role.value.id);
	if (res_data.result) {
		selected_permission_id.value = null;
		getPages();
	}
}

async function resetPermission() {
	if (!selected_permission_id.value) {
		return;
	}
	
	const res_data = await $admin_page.resetPermission(selected_permission_id.value);
	if (res_data.result) {
		selected_permission_id.value = null;
		getPages();
	}
}

function onFieldUpdated(field, current_value) {
	getPages();
}

async function getRoles() {
	const filter_request = new FilterRequest();
	filter_request.pagination.size = -1;
	const res_data = await $admin_user.filterRoles(filter_request);
	if (res_data.result) {
		res_data.records.forEach((record) => {
			record.value = record.id;
			record.title = record.code;
			all_roles.value.push(record)
		});
	}
}

function onSelectRole() {
	getPages();
}

onMounted(async () => {
	await getRoles();
	getPages();
})

</script>

<style lang="less">
#la-system-permission-card {
	.field-group {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.action-group {
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 8px;
	}

}
</style>
