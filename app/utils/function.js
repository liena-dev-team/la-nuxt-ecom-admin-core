
export function makeXMLHttpRequest(method, url, responseType = "json") {
	return new Promise(function (resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.responseType = responseType;
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};

		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};
		xhr.send();
	});
}

export async function getFileFromUrl(url) {
	const filename = url.split('/').pop();
	const blob = await makeXMLHttpRequest("GET", url, "blob");
	blob.lastModifiedDate = new Date();
	blob.name = filename;
	const file = new File([blob], filename);
	return file;
};
