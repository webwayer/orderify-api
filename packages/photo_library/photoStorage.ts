import { Readable } from 'stream'
import { RequestPromiseAPI } from 'request-promise';
import { storage } from 'pkgcloud';

export function photoStorageFactory(request: RequestPromiseAPI, storage: storage.Client) {
    async function uploadFromUrl(id: number, url: string) {
        const readStream = request.get(url)
        const writeStream = storage.upload({
            container: 'photos',
            remote: id.toString(),
        })

        return promisifiedPipe(readStream, writeStream)
    }

    function downloadAsStream(id: number): Readable {
        return storage.download({
            container: 'photos',
            remote: id.toString()
        })
    }

    return {
        downloadAsStream,
        uploadFromUrl,
    }
}

/**
 * Streams input to output and resolves only after stream has successfully ended.
 * Closes the output stream in success and error cases.
 * @param input {stream.Readable} Read from
 * @param output {stream.Writable} Write to
 * @return Promise Resolves only after the output stream is "end"ed or "finish"ed.
 */
async function promisifiedPipe(input, output) {
    let ended = false;
    function end() {
        if (!ended) {
            ended = true;
            output.close && output.close();
            input.close && input.close();
            return true;
        }
    }

    return new Promise((resolve, reject) => {
        input.pipe(output);
        input.on('error', errorEnding);

        function niceEnding() {
            if (end()) resolve();
        }

        function errorEnding(error) {
            if (end()) reject(error);
        }

        output.on('finish', niceEnding);
        output.on('end', niceEnding);
        output.on('error', errorEnding);
    });
};