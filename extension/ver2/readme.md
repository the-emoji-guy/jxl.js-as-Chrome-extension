# only WASM file encoded to Base64
Same function as original source (convert JXL to WEBP), with the following modifications:

* Mods to `jxl_dec.js` to make it function as a regular worker.
* Added function to convert the WASM file to Base64 so it can be passed as a message to the worker script.
* Updated mutation code to include images added as base64 strings in the initial run.

A bit slower than ver1 since it still requires converting the JS and WASM files to other formats. It's possible to save a couple of `ms` to just include the final Base64 string. However, I am aware that a full audit of the source code is required for submission to the Chrome Web Store, so including the original versions of the code may be preferred.     
