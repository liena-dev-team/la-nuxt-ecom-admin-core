<template>
	<page-card page_class="App\AdminPage\System\AdminRoleCard" :go_back="true">
		<template #["part:menu"]>
			<v-container>
				<v-card>
					<advanced-tree :nodes="menu_nodes" :select_type="FIELD_TREE.SELECT_TYPE_CLASSIC"></advanced-tree>
				</v-card>
			</v-container>
		</template>
		<template #["part:page"]>
			<h3>Pages</h3>
		</template>
	</page-card>
</template>

<script setup>
</script>
