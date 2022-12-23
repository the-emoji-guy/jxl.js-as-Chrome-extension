(function () {
  "use strict";

// Start by converting the WASM to Base64 
// so we can send it to our worker file
   var Base64edWASM; 
   convertWASMtoBase64();
	
// jpeg/png/webp :: webp selected to preserve transparency
// useCache set as true to allow faster loading times on page revisits
   const config = {
     useCache: true,
     imageType: 'webp' 
   };

  let cache, workers = {};

  function imgDataToDataURL(img, imgData, isCSS, isSource) {
    const jxlSrc = img.dataset.jxlSrc;
    if (imgData instanceof Blob) {
      dataURLToSrc(img, URL.createObjectURL(imgData), isCSS, isSource);
    } else if ('OffscreenCanvas' in window) {
      const canvas = new OffscreenCanvas(imgData.width, imgData.height);
      workers[jxlSrc].postMessage({canvas, imgData, imageType: config.imageType}, [canvas]);
      workers[jxlSrc].addEventListener('message', m => {
        if (m.data.url && m.data.blob) {
	   // Required to display images coded in Base64
		  var newIMGsrc = URL.createObjectURL(m.data.blob);
          dataURLToSrc(img, newIMGsrc, isCSS, isSource);
		  if(jxlSrc.includes('base64')) { return; } ; 
          config.useCache && cache && cache.put(jxlSrc, new Response(m.data.blob));
        }		
      });
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = imgData.width;
      canvas.height = imgData.height;
      canvas.getContext('2d').putImageData(imgData, 0, 0);
      canvas.toBlob(blob => {
        dataURLToSrc(img, URL.createObjectURL(blob), isCSS, isSource);
        config.useCache && cache && cache.put(jxlSrc, new Response(blob));
      }, 'image/' + config.imageType);
    }
  }

  function dataURLToSrc(img, dataURL, isCSS, isSource) {
    if (isCSS)
      img.style.backgroundImage = 'url("' + dataURL + '")';
    else if (isSource) {
      img.srcset = dataURL;
      img.type = 'image/' + config.imageType;
    } else
      img.src = dataURL;
  }

  async function decode(img, isCSS, isSource) {
 // Added img.src as a parameter	  
    const jxlSrc = img.dataset.jxlSrc = isCSS ? getComputedStyle(img).backgroundImage.slice(5, -2) : isSource ? img.srcset : (img.currentSrc.length === 0) ? img.src : img.currentSrc;
    if (!isCSS && !isSource) {
      img.srcset = '';
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; // blank 1x1 image
    }
    if (config.useCache) {
      try {
        cache = cache || await caches.open('jxl');
      } catch (e) {}
      const cachedImg = cache && await cache.match(jxlSrc);
      if (cachedImg) {
        const cachedImgData = await cachedImg.blob();
        requestAnimationFrame(() => imgDataToDataURL(img, cachedImgData, isCSS, isSource));
        return;
      }
    }
	
 // if source image is null, do not continue
    if (jxlSrc.includes('null')) { console.log('null line68'); return; };
		
    const res = await fetch(jxlSrc);
    const image = await res.arrayBuffer();


    workers[jxlSrc] = new Worker(URL.createObjectURL(new Blob(["("+worker_function.toString()+")()"], {type: 'text/javascript'})));
    workers[jxlSrc].postMessage({jxlSrc, image, Base64edWASM});
    workers[jxlSrc].addEventListener('message', m => m.data.imgData && requestAnimationFrame(() => imgDataToDataURL(img, m.data.imgData, isCSS, isSource)));
  }

  new MutationObserver(mutations => mutations.forEach(mutation => mutation.addedNodes.forEach(el => {
    if (el instanceof HTMLImageElement && el.src.endsWith('.jxl'))
      el.onerror = () => decode(el, false, false);
    else if (el instanceof HTMLSourceElement && el.srcset.endsWith('.jxl'))
      decode(el, false, true);
 // Also convert inline images encoded in Base64
    else if (el instanceof HTMLImageElement && el.src.includes('image/jxl'))
      decode(el, false, false);
    else if (el instanceof Element && getComputedStyle(el).backgroundImage.endsWith('.jxl")'))
      decode(el, true, false);
  }))).observe(document.documentElement, {subtree: true, childList: true});


// ~~~~~~~~ CUSTOM CODE STARTS HERE ~~~~~~~~~~~~~~~~~~~
  
async function convertWASMtoBase64() {
	const url = chrome.runtime.getURL("jxl_dec.wasm"); 
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();
    await new Promise((resolve, reject) => {
      reader.onload = resolve;
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
	Base64edWASM = reader.result.replace(/wasm;/, 'octet-stream;');
    return reader.result.replace(/wasm;/, 'octet-stream;');
  }
 
function lookForOthers() {
	var highlightedItems = document.querySelectorAll("img[src*='jxl']");
	highlightedItems.forEach((userItem) => {
		if( userItem.classList.contains("alreadyConverted") ) 
			{ 
			return; 
			} else {
			   userItem.classList.add("alreadyConverted");  
			   decode(userItem, false);
		     }
		});
};


document.addEventListener("click", e => {
  const origin = e.target.closest("a");
  if (origin) {
    const href = origin.href;
	lookForOthers();
	setTimeout(() => { lookForOthers() }, 1000);
  }
});
  
}());