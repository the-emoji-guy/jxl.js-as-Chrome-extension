# JXL.js (as a Chrome extension)

This is an experimental extension that converts any JXL (JPEG XL) image file in the page to WEBP.

It uses the following code for conversion:
* https://github.com/niutech/jxl.js

Code has been slightly modified to work in a 'browser-extension' environment.

<br>

Limitations:
* Conversion may take a couple of seconds, especially for large images.
* No support for animated JXL files. Only the first frame is rendered.
* May cause some pages to not load at all. If this happens, please uninstall the extension.

<br>

This is a work in progress. More explanation on use cases, tips, and workarounds here: 
* https://r360v.blogspot.com/p/jace.html

# Installing

1. Go to the Releases page and download the ZIP file.
1. Extract to a local directory.
1. Follow the installation instructions here:
* https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked

After installation, the extension should run automatically on every page.

<br>

Read the original description below ⬇ :
<hr>

# JXL.js

This is a JPEG XL decoder in JavaScript using WebAssembly implementation from the [Squoosh](https://github.com/GoogleChromeLabs/squoosh) app running in Web Worker.

## Usage

Just insert your JPEG XL images to your HTML document as usual: `<img src="image.jxl" alt="..." width="..." height="...">` and append the minified JXL.js script to the `<head>` of your web page:

`<script src="jxl.min.js"></script>`

That's it!

You can enable/disable cache and choose target image type (JPEG/PNG/WebP) by editing config at the beginning of `jxl.js` file.

## How it works

JXL.js uses Mutation Observer to watch for `<img>` and `<picture>` tags being added to the DOM as well as CSS background images and it decodes them as they appear using WebAssembly decoder in Web Worker. Then the JPEG XL image data is transcoded into JPEG/PNG/WebP image and cached using [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) for faster subsequent page views (you can delete cached images using [Dev Tools](https://developer.chrome.com/docs/devtools/storage/cache/#deleteresource)). The transcoding is performed using Offscreen Canvas in Web Worker for jank-free performance, if available.

#### [See the demo](https://niutech.github.io/jxl.js/)

## Multithread version

There is an experimental multithread version of JXL.js using 4 threads in Web Workers and WebAssembly SIMD operations, if available, based on the [libjxl wasm demo](https://github.com/libjxl/libjxl/tree/main/tools/wasm_demo). Requires HTTPS as well as `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` response headers (or the provided Service Worker script as a fallback).

#### [See the multithread demo](https://niutech.github.io/jxl.js/multithread/)

## Benchmark

|           | Single-thread | Multi-thread |
|-----------|---------------|--------------|
| test.jxl  | 790 ms        | 440 ms       |
| test2.jxl | 830 ms        | 590 ms       |

Tested on Microsoft Edge 108, average times, no cache.

## License

&copy; 2022 Jerzy Głowacki and Squoosh Developers under Apache 2.0 License.
