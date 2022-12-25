(function () {
  "use strict";

  const config = {
    useCache: true,
    imageType: "webp" // jpeg/png/webp
  };

  let cache, workers = {};
  var oldData;
  var RjxlSrc  = [];
  var RimgObj  = [];
  var RnewURL  = [];
  var jj = 0 ;
  var kk = 0 ;

  function dataURLToSrc(img, dataURL, isCSS, isSource) {
    if (isCSS)
      img.style.backgroundImage = 'url("' + dataURL + '")';
    else if (isSource) {
      img.srcset = dataURL;
      img.type = 'image/' + config.imageType;
      } 
    else img.src = dataURL;
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
      } catch (e) { }
      const cachedImg = cache && await cache.match(jxlSrc);
      if (cachedImg) {
        const cachedImgData = await cachedImg.blob();
        const newIMGsrc = URL.createObjectURL(cachedImgData);
        dataURLToSrc( img, newIMGsrc, isCSS, isSource);
        //requestAnimationFrame(() => imgDataToDataURL(img, cachedImgData, isCSS));
        return;
        }
     };

    const res = await fetch(jxlSrc);
    const image = await res.arrayBuffer();
    const iframe = document.getElementById('sandbox');

    if(!iframe) { iframe.addEventListener("load", function() { sendDataToIframe() }) }
    else sendDataToIframe();
    function sendDataToIframe() {
        RjxlSrc.push(jxlSrc);
        RimgObj.push(img);
        iframe.contentWindow.postMessage({jxlSrc, image, jj}, '*')
        jj = jj + 1;     
        };

     window.addEventListener('message', m => {
        if( m.data === oldData ) { return; }
        const newIMGsrc = URL.createObjectURL(m.data.nWebP);
        const cacheName = m.data.fName;
        const kk = m.data.jj;        
        if(cacheName.includes('jxl;base64')) { console.log('Base64. Skipping cache...'); }
        else { config.useCache && cache && cache.put(cacheName, new Response(m.data.nWebP)) };
        oldData  = m.data;
        RnewURL[kk] = newIMGsrc;
        dataURLToSrc( RimgObj[kk], RnewURL[kk], isCSS, isSource);
        });

    // workers[jxlSrc] = new Worker('jxl_dec.js');
    // workers[jxlSrc].postMessage({jxlSrc, image});
    // workers[jxlSrc].addEventListener('message', m => m.data.imgData && requestAnimationFrame(() => imgDataToDataURL(img, m.data.imgData, isCSS)));
    };

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


  function lookForOthers() {
    var MissedItems = document.querySelectorAll("img[src*='jxl']");
    MissedItems.forEach((userItem) => {
        if ( userItem.classList.contains("alreadyConverted") ) { 
             return; 
             } 
        else {
             userItem.classList.add("alreadyConverted");  
             decode(userItem, false, false);
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


window.addEventListener('DOMContentLoaded', function(){
   var jxlIframe = document.createElement("iframe");
   jxlIframe.src = chrome.runtime.getURL("jxl_dec.html");
   jxlIframe.width = "1";
   jxlIframe.height = "1";
   jxlIframe.setAttribute("id","sandbox");
   jxlIframe.setAttribute("style","position: absolute; left: -10000px; overflow: hidden;");
   document.body.appendChild(jxlIframe);
   });