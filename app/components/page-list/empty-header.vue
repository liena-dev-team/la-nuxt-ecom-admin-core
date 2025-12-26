<template>
    <thead>
        <tr>
            <!-- Sticky header fields -->
            <th v-for="(header, index) in headers_sticky" :key="index"
                :is_sticky="true" :left="header.left" :is_dropdown="header.is_dropdown"
                class="header-empty-field" 
                :class="{ 'is-checkbox': header.is_checkbox == true, 'show-selectbox': show_selectbox }"
                :style="{ 'width': header.width ? (header.width + 'px'): '0' }"
            >
                {{  header.label }}
            </th>
            <!-- Non-sticky header fields -->
            <th v-for="(header, index) in headers_not_sticky" :key="index" 
                :is_sticky="false"
                class="header-empty-field" :style="{ 'width': header.width ? (header.width + 'px'): '0' }"
            >
                {{  header.label }}
            </th>
            <!-- Last Column -->
            <th style="width: 100px"></th>
        </tr>
    </thead>
</template>

<script setup>

const { show_selectbox, headers_not_sticky } = defineProps({
    show_selectbox: Boolean,
    headers_sticky: Object, 
    headers_not_sticky: Object
});

</script>

<style scoped lang="less">

.header-empty-field {
    // visibility: hidden;
    text-align: left;
    height: 40px;
    width: auto;
    min-width: 20px;
    max-width: 1000px;
    padding: 4px 8px;
    
    // Checkbox
    &.is-checkbox {
        display: none;
    }

    &.show-selectbox {
        display: table-cell;
    }
}

</style>
