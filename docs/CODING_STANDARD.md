

# Html
## 1. Ghi comment để chia các block, cho dễ nhìn. 
<!-- Left Block -->

## 2. 

# Style

## 1. Sử dụng 'scoped' và css less
<style scoped lang="less">
</style>

# Javascript

## 1. Vue composition
<script setup>
</script>

## 2. Chia các phần code bằng comment

Ví dụ:
```js

// Constants
const CHECKBOX_WIDTH = 50;

// Refs
const headers_sticky = ref([]);

// Props
const { headers } = defineProps({
    headers: {
        type: Object,
        default: {}
    },
});

```

## Constants viết hoa , UPPER SNAKE CASE
```js
const CHECKBOX_WIDTH = 50;
```

## Variables viết LOWSER Snake Case
```js
const headers_sticky = ref([]);
```

## Functions viết Camel Case
```js
function showCheckbox(val) {

}
```

## Props viết đầy đủ thông số
```js
const { headers } = defineProps({
    headers: {
        type: Object,
        default: {}
    },
});
```

## 6. Các variables không sử dụng (unused) thì xóa

## 7. Format files bằng extension Prettier, sử dụng tab identation = 4



