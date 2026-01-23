<template>
  <v-dialog v-model="model" max-width="500" max-height="500">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold d-flex align-center">
        Filter Guide
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" density="compact" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-card-text>
        <h3 class="section-title text-h6 font-weight-bold mb-2"># Filter Number</h3>
        <div class="mb-4">
          <p>- Comparison operators: = , > , >= , < , <=</p>
          <ul>
            <li>=1 : Find value equals 1</li>
            <li>>1 : Find values greater than 1</li>
            <li>&gt;= 1 : Greater or equal 1</li>
          </ul>

          <p class="mt-3">- Composite operators: & (AND) , | (OR)</p>
          <ul>
            <li>=1 | =3 → equals 1 or 3</li>
            <li>>2 & &lt;=10 → between 2 and 10</li>
          </ul>

          <p class="mt-3">- Range operator: ..</p>
          <ul>
            <li>100..200 → between 100 and 200 (not equal)</li>
            <li>=100.. → >= 100</li>
            <li>=100..=200 → >=100 and <=200</li>
            <li>..200 → < 200</li>
          </ul>
        </div>

        <h3 class="section-title text-h6 font-weight-bold mb-2"># Filter String</h3>
        <div>
          <ul>
            <li>liena → same as "*liena*"</li>
            <li>*liena → ends with liena</li>
            <li>liena* → starts with liena</li>
            <li>"liena" → exact match</li>
            <li>@liena → case-sensitive search</li>
            <li>liena|lam|moi → OR search</li>
          </ul>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue', false])

const model = ref(props.modelValue)

watch(() => props.modelValue, (val) => (model.value = val))

function closeDialog() {
  model.value = false
  emit('update:modelValue', false)
}

watch(model, (val) => {
  emit('update:modelValue', val)
})
</script>

<style scoped>
.section-title {
  margin-bottom: 6px;
  padding-left: 4px;
  border-left: 3px solid #1976d2;
}

ul {
  margin: 6px 0 14px;
  padding-left: 20px;
}

li {
  margin-bottom: 3px;
}

.v-card-title {
  border-bottom: 1px solid #eee;
}

.v-card-actions {
  border-top: 1px solid #eee;
}
</style>

