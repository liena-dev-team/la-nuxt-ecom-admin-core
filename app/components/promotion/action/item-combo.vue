<template>
	<div class="la-promotion-action-item-combo" v-if="combo">
		<div class="name">
			<span class="default-name" @click="selectDefaultCombo">
				<input type="radio" :name="'radio-' + action.id + '-' + combo.id" v-model="action.default_combo_id"
					:value="combo.id">
				<span class="name">Combo {{ (child_index + 1) }}</span>
			</span>
			<v-btn class="btn-remove" icon="mdi-close-circle" size="x-small" color="red" variant="text"
				@click="removeItemCombo" />
		</div>
		<div class="items">
			<promotion-action-item v-for="(item, i) in combo.items" :key="i" v-model:item="combo.items[i]"
				:action="action" :child_index="i" @remove="removeItem(i)" @update="emitUpdate"/>
		</div>
		<div class="actions">
			<v-btn prepend-icon="mdi-plus" size="x-small" variant="text" @click="addItem">
				<span>Add Item</span>
			</v-btn>
		</div>
	</div>
</template>

<script setup>

// Emits
const emit = defineEmits(["update", "remove"]);

// Props
const { id, child_index } = defineProps({
	id: {
		type: Number,
		default: -1
	},
	child_index: {
		type: Number,
		default: -1
	}
});

// Model
const action = defineModel('action', { type: PromotionActionCartGift, default: null });
const combo = defineModel('combo', { type: PromotionalItemCombo, default: null });
combo.value.id = id;

// Refs

// Functions
function addItem() {
	const item = new PromotionalItem({
	});

	combo.value.items.push(item);
	
	emitUpdate();
}

function removeItemCombo() {
	emit("remove");
}

function removeItem(index) {
	for (let i in combo.value.items) {
		if (i == index) {
			combo.value.items.splice(i, 1);
			break;
		}
	}
}

function selectDefaultCombo() {
	action.value.default_combo_id = combo.value.id;
}

function emitUpdate() {
	emit("update");
}

onMounted(() => {
	if (!combo.value.items) {
		combo.value.items = [];
	}
})

</script>

<style lang="less">
.la-promotion-action-item-combo {
	>.name {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;

		>.default-name {
			display: flex;
			gap: 8px;
			font-size: 16px;
			margin-left: 12px;
			user-select: none;

			>input {
				width: 20px;
				cursor: pointer;
			}

			>.name {
				display: inline-block;
				border-radius: 4px;
				padding: 2px 8px;
				background-color: var(--la_accent_color_2);
				color: #fff;
				font-weight: bold;
				font-size: 14px;
				cursor: pointer;
			}
		}
	}

	>.items {
		display: grid;
		gap: 20px;
		margin-bottom: 8px;
		padding-left: 60px;
	}

	>.actions {
		padding-left: 20px;
	}

}
</style>
