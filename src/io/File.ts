export default async function readFileAsync(url: string): Promise<string> {
    return fetch(url)
        .then((response) => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Failed to download file.');
            }
        })
        .catch((reason) => {
            throw new Error(reason);
        });
}
