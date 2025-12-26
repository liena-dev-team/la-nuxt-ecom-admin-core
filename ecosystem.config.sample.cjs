
module.exports = {
	apps: [
		{
			name: 'ecom_2_admin',
			port: '3001',
			exec_mode: 'cluster',
			instances: '1', // max
			script: './.output/server/index.mjs'
		}
	]
}
