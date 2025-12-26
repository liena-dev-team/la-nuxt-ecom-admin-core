
export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {
		// the next plugin will be executed immediately
		// console.log("plugin: media manager");

		class MediaManager {
			async getFilesByIds(ids) {
				return await useApiFetch(
					"/admin/media/file/ids?ids=" + ids, {
					method: HTTP_METHOD.GET
				});
			}

			async getImageCacheById(id) {
				return await useApiFetch(
					"/admin/media/manager/image/cache/" + id, {
					method: HTTP_METHOD.GET
				});
			}

			async list(dir_path, only_folder = false) {
				let url = "/admin/media/manager/list?dir_path=" + dir_path;
				if (only_folder) {
					url += "&only_folder=true";
				}
				
				return await useApiFetch(
					url, {
					method: HTTP_METHOD.GET
				});
			}
			
			async newFolder(dir_path, new_name) {
				let url = "/admin/media/manager/folder/new?";
				url += "dir_path=" + dir_path;
				url += "&new_name=" + new_name;

				return await useApiFetch(url, {
					method: HTTP_METHOD.POST,
				});
			}

			async uploadFiles(files, dir_path) {
				const form_data = new FormData();
				
				for (let i = 0; i < files.length; i++) {
					form_data.append("files[]", files[i]);
				}

				return await useApiFetch(
					"/admin/media/manager/file/upload?dir_path=" + dir_path, {
					method: HTTP_METHOD.POST,
					body: form_data
				});
			}
			async editFilesInFo(id, form_data) {
				return await useApiFetch(
					"/admin/media/manager/file/edit-info/" + id, {
					method: HTTP_METHOD.POST,
					body: form_data
				});
			}

			async renameFolder(old_name, new_name, parent_path) {
				let url = "/admin/media/manager/folder/rename?";
				url += "old_name=" + old_name;
				url += "&new_name=" + new_name;
				url += "&parent_path=" + parent_path;

				return await useApiFetch(url, {
					method: HTTP_METHOD.POST,
				});
			}

			async renameFolder(old_name, new_name, parent_path) {
				let url = "/admin/media/manager/folder/rename?";
				url += "old_name=" + old_name;
				url += "&new_name=" + new_name;
				url += "&parent_path=" + parent_path;

				return await useApiFetch(url, {
					method: HTTP_METHOD.POST,
				});
			}

			async renameFile(media_file_id, new_name) {
				let url = "/admin/media/manager/file/rename?";
				url += "media_file_id=" + media_file_id;
				url += "&new_name=" + new_name;

				return await useApiFetch(url, {
					method: HTTP_METHOD.POST,
				});
			}

			async deleteFolder(path) {
				let url = "/admin/media/manager/folder/delete?";
				url += "path=" + path;

				return await useApiFetch(url, {
					method: HTTP_METHOD.DELETE,
				});
			}
			async deleteFile(media_file_id) {
				let url = "/admin/media/manager/file/delete?";
				url += "media_file_id=" + media_file_id;

				return await useApiFetch(url, {
					method: HTTP_METHOD.POST,
				});
			}
		}

		const media_manager = new MediaManager();

		return {
			provide: {
				media_manager: media_manager,
			},
		};
	}
});
