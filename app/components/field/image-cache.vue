<template>
	<div class="la-field-image-cache" v-if="image_cache">
		<img :src="image_cache.path" :width="image_cache.width" :height="image_cache.height"/>
	</div>
</template>

<script setup>

// Use
const { $media_manager } = useNuxtApp();

// Props
const { field, record } = defineProps({
	field: {
		type: Object,
		default: null
	},
	record: {
		type: Object,
		default: null
	},
});

// Refs
const image_cache = ref();

// Watch
watch(() => record[field.code], (newValue) => {
	getImageCache();
});

// Functions 
function getImageCache() {
	const result_image = $media_manager.getImageCacheById(record[field.code]);
	if (result_image.result) {
		image_cache = result_image.image_cache;
	}
}

</script>

<style lang="less">
.la-field-image-cache {

}

</style>
