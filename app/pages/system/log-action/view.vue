<template>
	<page-card page_class="App\AdminPage\System\LogActionCard" :go_back="true" :insertable="false" :deletable="false"
		:editable="false" v-model:record="record">
		<template #["part:changes"]>
			<v-table>
				<thead>
					<tr>
						<th class="text-left">
							Field
						</th>
						<th class="text-left">
							Old Value
						</th>
						<th class="text-left">
							New Value
						</th>
					</tr>
				</thead>
				<tbody v-if="record.changes">
					<tr v-for="(values, field_code) in record.changes" :key="field_code">
						<td>{{ field_code }}</td>
						<td>{{ values?.[0] }}</td>
						<td>{{ values?.[1] }}</td>
					</tr>
				</tbody>
			</v-table>
		</template>
	</page-card>
</template>

<script setup>

// Refs
const record = ref({});

</script>

