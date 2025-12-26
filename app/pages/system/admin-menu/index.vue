<template>
	<v-sheet>
		<v-container fluid>
			<v-row no-gutters>
				<v-col cols="12" md="4" class="pa-2">
					<v-card>
						<v-card-title>Admin Role</v-card-title>
						<v-card-text>
							<v-select v-model="selected_role" :items="all_roles" density="compact" return-object
								variant="outlined" hide-details="auto" @update:model-value="onSelectRole">
							</v-select>
							<div v-if="selected_role && selected_role.is_super_admin" class="pt-4">
								<v-alert type="info" text="This role is Super Admin"></v-alert>
							</div>
						</v-card-text>
					</v-card>
				</v-col>
				<v-spacer></v-spacer>
				<v-col cols="12" md="8" class="pa-2">
					<v-card v-if="selected_role && !selected_role.is_super_admin">
						<v-card-title>Admin Menu</v-card-title>
						<v-card-text>
							<!-- Loading Bar -->
							<v-progress-linear :active="is_loading" color="light-blue" indeterminate
								rounded></v-progress-linear>
							<!-- Form messages -->
							<form-message :messages="form_messages"></form-message>
							<v-treeview v-model:selected="selected_items" :items="menu_items"
								select-strategy="independent" item-value="code" selectable
								@update:selected="onSelectMenuItems">
							</v-treeview>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-container>
	</v-sheet>
</template>

<script setup>

// Plugins
const { $admin_user, $admin_menu } = useNuxtApp();

// Refs
const all_roles = ref([]);
const selected_role = ref();
const menu_items = ref([]);
const selected_items = ref([]);
const form_messages = ref([]);
const is_loading = ref(false);

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
	getMenuPermission();
}

async function getTreeMenu() {
	const res_data = await $admin_menu.getMainMenu();
	if (res_data.result) {
		menu_items.value = buildMenuItems(res_data.menu);
	}
}

function buildMenuItems(menu_items) {
	let return_items = [];
	for (let i in menu_items) {
		const menu_item = menu_items[i];

		const node = {
			id: menu_item.id,
			title: menu_item.name,
			code: menu_item.code
		};

		const children = buildMenuItems(menu_item.children);
		if (children && children.length > 0) {
			node.children = children;
		}

		return_items.push(node);
	}

	return return_items;
}

async function onSelectMenuItems(items) {
	if (!selected_role.value) {
		return;
	}

	let menu_codes = [];
	for (let i in items) {
		const item = items[i];
		menu_codes.push(item);
	}

	is_loading.value = true;
	const response_data = await $admin_menu.updateMainMenuPermission(selected_role.value.id, menu_codes);
	is_loading.value = false;
	form_messages.value = response_data.messages;
	if (response_data.result) {
		getMenuPermission();
	}
}

async function getMenuPermission() {
	if (!selected_role.value || selected_role.value.is_super_admin) {
		selected_items.value = [];
		return;
	}

	is_loading.value = true;
	const res_data = await $admin_menu.getMainMenuPermission(selected_role.value.id);
	is_loading.value = false;
	if (res_data.result) {
		selected_items.value = res_data.menu_codes;
	}
}

onMounted(async () => {
	getRoles();
	getTreeMenu();
})

</script>
