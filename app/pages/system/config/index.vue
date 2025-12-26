<template>
	<v-sheet>
		<v-container fluid id="la-system-config-index">
			<v-row>
				<!-- Left Panel -->
				<v-col cols="12" md="4" class="panel-left pa-0">
					<v-card :elevation="0">
						<v-card-title>
							<span class="config-title">
								Configuration
								<v-select :items="ENVIRONMENT_OPTIONS" hide-details="auto" density="compact"
									variant="outlined" v-model="env_mode" @update:model-value="getSectionById">
								</v-select>
							</span>
						</v-card-title>
						<v-card-text>
							<v-expansion-panels :modelValue="0" density="compact" variant="accordion">
								<v-expansion-panel v-for="(tab, index) in config_menu" :key="index">
									<v-expansion-panel-title>
										<strong>{{ tab.label }}</strong>
									</v-expansion-panel-title>
									<v-divider></v-divider>
									<v-expansion-panel-text>
										<v-list v-if="tab.children && tab.children.length > 0" density="compact">
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
				<!-- Right Panel-->
				<v-col cols="12" md="7" class="panel-right pa-0" v-if="selected_section">
					<v-banner class="sticky-bar pa-0" :sticky="true">
						<v-toolbar density="compact">
							<div class="d-flex ga-2 pa-2 w-100">
								<v-spacer></v-spacer>
								<v-chip v-if="is_saving" variant="flat" color="blue"> Saving... </v-chip>
								<v-chip v-else variant="flat" color="green" prepend-icon="mdi-check-bold"> Saved
								</v-chip>
							</div>
						</v-toolbar>
					</v-banner>
					<v-expansion-panels class="extension-panels" :modelValue="0" :elevation="0">
						<v-expansion-panel class="extension-panel" v-for="(group, index) in selected_section.children"
							:key="index">
							<v-expansion-panel-title><strong>{{ group.label }}</strong></v-expansion-panel-title>
							<v-divider></v-divider>
							<v-expansion-panel-text>
								<v-container v-if="group.children && group.children.length > 0">
									<v-row v-for="field in group.children" :key="field.id">
										<v-col cols="4" class="col-label pa-1">
											<span>{{ field.label }}</span>
										</v-col>
										<v-col cols="8" class="col-value pa-1">
											<!-- String -->
											<div class="string" v-if="field.input_type == FIELD_INPUT_TYPE.STRING">
												<v-text-field v-model="field.value" density="compact" variant="outlined"
													hide-details="auto" @blur="onValueChanged(field)"
													:error="!!field_errors[field.code]"
													:error-messages="field_errors[field.code]">
												</v-text-field>
											</div>
											<!-- Int -->
											<div class="int" v-if="field.input_type == FIELD_INPUT_TYPE.INT">
												<v-text-field v-model="field.value" type="number" density="compact"
													variant="outlined" hide-details="auto" @blur="onValueChanged(field)"
													:error="!!field_errors[field.code]"
													:error-messages="field_errors[field.code]">
												</v-text-field>
											</div>
											<!-- Decimal -->
											<div class="decimal" v-if="field.input_type == FIELD_INPUT_TYPE.DECIMAL">
												<v-text-field v-model="field.value" type="number" density="compact"
													variant="outlined" hide-details="auto" @blur="onValueChanged(field)"
													:error="!!field_errors[field.code]"
													:error-messages="field_errors[field.code]">
												</v-text-field>
											</div>
											<!-- Bool -->
											<div class="boolean" v-if="field.input_type == FIELD_INPUT_TYPE.BOOL">
												<v-checkbox v-model="field.value" density="compact" variant="outlined"
													hide-details="auto" @update:model-value="onValueChanged(field)"
													:error="!!field_errors[field.code]"
													:error-messages="field_errors[field.code]">
												</v-checkbox>
											</div>
											<!-- Date -->
											<div class="date" v-if="field.input_type == FIELD_INPUT_TYPE.DATE">
												<vue-date-picker v-model="field.value" :enable-time-picker="false"
													:format="formatDisplayDate"
													@update:model-value="onValueChanged(field)" />
											</div>
											<!-- Date Time -->
											<div class="date-time">
												<vue-date-picker v-if="field.input_type == FIELD_INPUT_TYPE.DATE_TIME"
													v-model="field.value" :text-input="textInputOptions"
													:format="formatDisplayDateTime"
													@update:model-value="onValueChanged(field)" />
											</div>
											<!-- Select -->
											<div class="select"
												v-if="field.input_type == FIELD_INPUT_TYPE.SELECT && field.data">
												<v-select v-model="field.value" :items="field.data.options"
													density="compact" hide-details="auto"
													@update:model-value="onValueChanged(field)"
													:error="!!field_errors[field.code]"
													:error-messages="field_errors[field.code]">
												</v-select>
											</div>
											<!-- Multi-Select -->
											<div class="multi-select"
												v-if="field.input_type == FIELD_INPUT_TYPE.MULTI_SELECT && field.data">
												<v-select v-model="field.value" :items="field.data.options"
													density="compact" hide-details="auto" multiple chips
													@update:model-value="onValueChanged(field)"
													:error="!!field_errors[field.code]"
													:error-messages="field_errors[field.code]">
												</v-select>
											</div>
											<!-- Text Area -->
											<div class="text-area"
												v-if="field.input_type == FIELD_INPUT_TYPE.TEXT_AREA">
												<v-textarea v-model="field.value" density="compact" variant="outlined"
													hide-details="auto" @blur="onValueChanged(field)"
													:error="!!field_errors[field.code]"
													:error-messages="field_errors[field.code]">
												</v-textarea>
											</div>
											<!-- Encrypted -->
											<div class="encrypted"
												v-if="field.input_type == FIELD_INPUT_TYPE.ENCRYPTED">
												<v-text-field v-model="field.value" density="compact" variant="outlined"
													hide-details="auto" @blur="onValueChanged(field)"
													:error="!!field_errors[field.code]"
													:error-messages="field_errors[field.code]"
													:append-icon="field.show ? 'mdi-eye' : 'mdi-eye-off'"
													:type="field.show ? 'text' : 'password'" counter
													@click:append="field.show = !field.show">
												</v-text-field>
											</div>
											<!-- Rich Text Editor -->
											<div class="rich_editor"
												v-if="field.input_type == FIELD_INPUT_TYPE.RICH_EDITOR">
												<field-rich-editor v-model="field.value" :field="field" :form_mode="FORM_MODE.EDIT"
													@blur="onValueChanged(field)" />
											</div>
											<!-- JSON -->
											<div class="json" v-if="field.input_type == FIELD_INPUT_TYPE.JSON">
												<v-textarea v-model="field.value" density="compact" variant="outlined"
													hide-details="auto" rows="6" @blur="onValueChanged(field)"
													:error="!!field_errors[field.code]"
													:error-messages="field_errors[field.code]">
												</v-textarea>
											</div>
										</v-col>
									</v-row>
								</v-container>
							</v-expansion-panel-text>
						</v-expansion-panel>
					</v-expansion-panels>
				</v-col>
			</v-row>
		</v-container>
	</v-sheet>
</template>

<script setup>

// Use
const config = useRuntimeConfig();

// Refs
const config_menu = ref([]);
const selected_section = ref();
const field_errors = reactive({});
const is_saving = ref(false);
const env_mode = ref(config.public.environment);

// Test
const textInputOptions = {
	format: 'd/M/yyyy HH:mm:ss'
};

// Functions
async function getConfigMenu() {
	const res_data = await useApiFetch("/admin/system/config/menu", {
		method: HTTP_METHOD.GET
	});

	if (res_data.result) {
		config_menu.value = res_data.menu;

		// Get data for right panel
		await getSectionById();
	}
}

async function getSectionById() {
	try {
		if (!selected_section.value) {
			return;
		}

		const section_id = selected_section.value.id;
		const url = "/admin/system/config/section/" + section_id + "?env=" + env_mode.value;
		const res_data = await useApiFetch(url, {
			method: HTTP_METHOD.GET,
		});

		if (!res_data.result) {
			return;
		}

		// Process field values
		const section = res_data.menu;
		for (let i in section.children) {
			const group = section.children[i];
			for (let y in group.children) {
				const field = group.children[y];
				processDataAfterLoad(field);
			}
		}

		selected_section.value = section;
	} catch (error) {
		console.error(error);
	}
}

async function saveData(field, value) {
	is_saving.value = true;

	try {
		if (!field.id) {
			is_saving.value = false;
			return;
		}

		// Pre-process data before saving
		const process_result = processDataBeforeSave(field);
		if (!process_result) {
			return;
		}

		const res_data = await useApiFetch("/admin/system/config/data", {
			method: HTTP_METHOD.PUT,
			body: {
				id: field.id,
				value: field.value,
				env: env_mode.value
			}
		});

		if (!res_data.result) {
			is_saving.value = false;
			return;
		}

		is_saving.value = false;
		return res_data.data;
	} catch (error) {
		console.error(error);
	}

	is_saving.value = false;
	return null;
}

async function onSectionClicked(section) {
	selected_section.value = section;
	await getSectionById();
}

async function onValueChanged(field) {
	// Save value
	await saveData(field);
	// Get data for right panel
	await getSectionById();
}

function processDataAfterLoad(field) {
	switch (field.input_type) {
		case FIELD_INPUT_TYPE.BOOL:
			field.value = field.value == "1" ? true : false;
			break;
		case FIELD_INPUT_TYPE.DATE_TIME:
			const local_spacetime = dateTimeConvertUtcToLocal(field.value);
			field.value = local_spacetime.toNativeDate();
			break;
		case FIELD_INPUT_TYPE.MULTI_SELECT:
			if (!field.value) {
				field.value = [];
				return;
			}

			try {
				field.value = field.value.split(",");
			} catch (error) {
				console.log("ERROR:");
				console.log(error);
				field.value = [];
			}

			break;
		case FIELD_INPUT_TYPE.JSON:
			try {
				field.value = JSON.stringify(JSON.parse(field.value), null, 2);
			} catch (error) {
				console.log("ERROR:");
				console.log(error);
			}
			break;
		case FIELD_INPUT_TYPE.RICH_EDITOR:
			field.field_rich_editor = {
				html_id: field.code,
				height: 400
			};
			break;
		default:
			break;
	}
}

function processDataBeforeSave(field) {
	try {
		switch (field.input_type) {
			case FIELD_INPUT_TYPE.MULTI_SELECT:
				if (!field.value) {
					field.value = [];
				}

				field.value = field.value.join(",");
				field_errors[field.code] = null;
				break;
			case FIELD_INPUT_TYPE.JSON:
				if (!field.value.trim()) {
					field.value = "";
					return true;
				}

				const parsed_value = JSON.parse(field.value);
				field.value = JSON.stringify(parsed_value);
				break;
			default:
				break;
		}

		field_errors[field.code] = null;
		return true;
	} catch (error) {
		field_errors[field.code] = ["Invalid format"];
	}

	return false;
}

onMounted(() => {
	getConfigMenu();
})

</script>

<style lang="less">
#la-system-config-index {
	.config-title {
		display: flex;
		gap: 16px;
		align-content: center;
		align-items: center;
		margin-bottom: 12px;
	}

	.panel-right {
		.extension-panels {
			.v-row {
				border-bottom: 1px dashed #ddd;
				padding-bottom: 4px;
				margin-bottom: 4px;
				margin-top: 4px;
			}

			.col-label {
				display: flex;
				align-items: center;
			}

			.col-value {}
		}
	}
}
</style>
