<template>
	<div id="la-main-menu" v-click-outside="onClickOutside">
		<!-- Menu Level 0 -->
		<v-navigation-drawer class="menu-level-0" permanent :rail="level_0_rail" 
			@click="closeMenu">
			<v-list-item prepend-avatar="@/assets/img/mini-logo.png" class="logo" @click.stop="closeMenu">
				<img class="" src="@/assets/img/logo.png" />
			</v-list-item>
			<v-divider></v-divider>

			<v-list v-if="menu_data" density="compact" nav @click.stop="">
				<v-list-item class="menu-item-level-0" v-for="(item, index) in menu_data" :key="index"
					:value="item.code" :prepend-icon="item.icon" :title="item.name" color="#fff" base-color="#fff"
					@click.stop="onClickMenuItem0(item)" :active="item.active">
					<template v-slot:append>
						<v-btn v-if="item.children?.length > 0"
							:icon="item.active ? 'mdi-chevron-right' : 'mdi-chevron-down'" variant="text" flat
							density="compact"></v-btn>
					</template>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>

		<!-- Menu Level 1,2 -->
		<v-navigation-drawer class="menu-level-1" v-if="active_menu_item_0 && active_menu_item_0.children.length > 0"
			v-model="level_1_menu" :disable-resize-watcher="true" temporary @update:modelValue="onDrawerLv1Change">
			<div class="menu-level-1-title">
				<span>{{ active_menu_item_0.name }}</span>
				<v-btn icon="mdi-close-circle" variant="text" @click.stop="closeMenu"></v-btn>
			</div>
			<div v-for="(item_level_1, index) in level_1_children" :key="'lv-1-' + index">
				<div class="menu-level-1-subtitle">
					{{ item_level_1.name }}
				</div>
				<v-list class="menu-level-2" v-if="item_level_1.children.length > 0" density="compact" nav>
					<v-list-item class="menu-item-level-2" v-for="(item_level_2, index) in item_level_1.children"
						:key="'lv-2-' + index" :value="item_level_2.code" :prepend-icon="item_level_2.icon" color="#fff"
						base-color="#fff" :active="item_level_2.active" @click="onClickMenuItem2(item_level_2)">
						<v-list-item-title>
							<nuxt-link :to="item_level_2.url"> {{ item_level_2.name }}</nuxt-link>
						</v-list-item-title>
					</v-list-item>
				</v-list>
			</div>
		</v-navigation-drawer>
	</div>
</template>

<script setup>

// Plugins
const { $admin_menu } = useNuxtApp();

// Router
const router = useRouter();

// Refs
const level_0_rail = ref(true);
const menu_data = ref();
const active_menu_item_0 = ref();
const level_1_menu = ref(false);
const level_1_children = ref([]);
const active_menu_item_2 = ref();
const current_url = ref(router.currentRoute.value.path);

// Watch
watch(() => router.currentRoute.value.path, (newPath) => {
	current_url.value = newPath;
});

// Functions
function closeMenu() {
	level_0_rail.value = !level_0_rail.value;
	level_1_menu.value = false;
}

async function requestMenu() {
	const res_data = await $admin_menu.getMainMenu();
	if (res_data.result) {
		menu_data.value = res_data.menu;
	}
}

function onClickMenuItem0(item) {
	if (item.url) {
		level_1_menu.value = false;
		router.push(item.url);
	} else {
		level_0_rail.value = false;
	}

	if (active_menu_item_0.value) {
		active_menu_item_0.value.active = false;
	}

	// Toggle active
	item.active = true;
	active_menu_item_0.value = item;

	if (active_menu_item_0.value) {
		level_1_children.value = active_menu_item_0.value.children;
		level_1_menu.value = true;
	} else {
		level_1_children.value = [];
		level_1_menu.value = false;
	}
}

function onDrawerLv1Change(value) {
	if (!value) {
		closeMenu();
	}
}

function onClickOutside() {
	level_0_rail.value = true;
	level_1_menu.value = false;
}

function onClickMenuItem2(item_lv_2) {
	if (active_menu_item_2.value) {
		active_menu_item_2.value.active = false;
	}

	active_menu_item_2.value = item_lv_2;
	active_menu_item_2.value.active = true;
}

onMounted(() => {
	requestMenu();
})

</script>

<style lang="less" scoped>
#la-main-menu {
	user-select: none;
	background-color: var(--la_primary_color);

	// Logo
	.logo {
		padding: 4px 8px;

		img {
			height: 46px;
			margin-top: 14px;
		}

		:deep(.v-avatar) {
			width: 40px !important;
			height: 40px !important;
			border-radius: 4px;
		}
	}

	// Level 0
	.menu-level-0 {
		width: 56px;
		background-color: var(--la_primary_color);

		.menu-item-level-0 {
			&:hover {
				background-color: var(--la_neutral_color_2);
			}
		}
	}

	.menu-level-1 {
		background-color: var(--la_primary_color);

		.menu-level-1-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: 28px;
			font-weight: bold;
			padding: 8px 16px;
			color: #fff;
		}

		.menu-level-1-subtitle {
			color: var(--la_primary_color_silver_3);
			font-weight: 600;
			border-top: 1px solid #ccc;
			font-size: 18px;
			padding: 16px 16px 0px 16px;
		}
	}

	.menu-level-2 {
		.menu-item-level-2 {
			padding: 0px;
			margin: 0px;

			a {
				display: flex;
				align-content: center;
				align-items: center;
				padding: 8px;
				color: #fff;
				text-decoration: none;
				height: 40px;
			}

			&:hover {
				background-color: var(--la_neutral_color_2);

				a {
					color: #111111;
				}
			}

		}
	}
}
</style>
