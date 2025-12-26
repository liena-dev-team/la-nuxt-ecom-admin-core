<template>
	<v-app>
		<layout-main-menu style="z-index: 1;" />
		<v-main style="z-index: 0;">
			<layout-bar />
			<v-container style="height: calc(100vh - 80px)" fluid>
				<slot></slot>
			</v-container>
		</v-main>
	</v-app>
</template>

<script setup>
</script>
