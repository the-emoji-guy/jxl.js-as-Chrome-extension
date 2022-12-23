# only WASM file encoded to Base64
Same function as original source (convert JXL to WEBP), with the following modifications:

* Mods to `jxl_dec.js` to make it function as a regular worker.
* Added function to convert the WASM file to Base64 so it can be passed as a message to the worker script.
* Updated mutation code to include images added as base64 strings in the initial run.
