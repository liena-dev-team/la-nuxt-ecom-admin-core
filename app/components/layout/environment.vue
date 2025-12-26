<template>
	<div class="la-layout-environment">
		<template v-for="env in ENVIRONMENT_OPTIONS">
			<v-chip v-if="admin_env == env.value" :color="env.color" label variant="flat" size="small">
				<span>Admin {{ env.title }} {{ admin_version }}</span>
			</v-chip>
		</template>
		<template v-for="env in ENVIRONMENT_OPTIONS">
			<v-chip v-if="admin_store.api_env == env.value" :color="env.color" label variant="flat" size="small">
				<span>Api {{ env.title }} </span>
			</v-chip>
		</template>
	</div>
</template>

<script setup>

// Use
const config = useRuntimeConfig();
const admin_store = useAdminStore();

// Refs
const admin_env = ref(config.public.environment);
const admin_version = ref(config.public.appVersion);

</script>
<style scoped lang="less">
.la-layout-environment {
	display: flex;
	justify-content: center;
	gap: 2px;
}
</style>
