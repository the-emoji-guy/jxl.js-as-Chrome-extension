# JXL.js

This is a JPEG XL decoder in JavaScript using WebAssembly implementation from the [Squoosh](https://github.com/GoogleChromeLabs/squoosh) app running in Web Worker.

## Usage

Just insert your JPEG XL images to your HTML document as usual: `<img src="image.jxl" alt="..." width="..." height="...">` and append the minified JXL.js script to the `<head>` of your web page:

`<script src="jxl.min.js"></script>`

That's it!

## How it works

JXL.js uses Mutation Observer to watch for `<img>` tags being added to the DOM as well as CSS background images and it decodes them as they appear using WebAssembly decoder in Web Worker. Then the JPEG XL image data is transcoded into JPEG image and cached using Cache API for faster subsequent page views. The transcoding is performed using Offscreen Canvas in Web Worker for jank-free performance, if available.

#### [See the demo](https://niutech.github.io/jxl.js/)

## License

&copy; 2022 Jerzy Głowacki and Squoosh Developers under Apache 2.0 License.