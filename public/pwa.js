(function(){
  "use strict";
  var deferredPrompt = null;

  function registerSW(){
    if("serviceWorker" in navigator){
      window.addEventListener("load", function(){
        navigator.serviceWorker.register("/sw.js").catch(function(e){
          console.warn("MATHCLOUD service worker registration failed", e);
        });
      });
    }
  }

  function isStandalone(){
    return window.matchMedia && window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function showGuide(){
    var existing = document.getElementById("mathcloud-pwa-guide");
    if(existing) existing.remove();

    var box = document.createElement("div");
    box.id = "mathcloud-pwa-guide";
    box.className = "mc-pwa-guide open";
    box.innerHTML =
      '<div class="mc-pwa-guide-card" role="dialog" aria-modal="true" aria-label="Install MATHCLOUD App">' +
        '<div class="mc-pwa-guide-head">' +
          '<div><h2>Install MATHCLOUD App</h2><p>Install MathCloud Tutorial on your device for a faster app-like learning experience.</p></div>' +
          '<button class="mc-pwa-close" type="button" aria-label="Close">×</button>' +
        '</div>' +
        '<div class="mc-pwa-platform"><h3>Android / Chrome</h3><p>If the installation prompt is available, tap <b>Install MATHCLOUD App</b>. Otherwise open the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</p></div>' +
        '<div class="mc-pwa-platform"><h3>iPhone / iPad</h3><p>Open this website in Safari, tap <b>Share</b>, choose <b>Add to Home Screen</b>, then tap <b>Add</b>.</p></div>' +
        '<div class="mc-pwa-actions"><button class="btn btn-primary mc-pwa-close-action" type="button">Close</button></div>' +
      '</div>';
    document.body.appendChild(box);
    box.querySelector(".mc-pwa-close").addEventListener("click", function(){box.remove();});
    box.querySelector(".mc-pwa-close-action").addEventListener("click", function(){box.remove();});
    box.addEventListener("click", function(e){if(e.target === box) box.remove();});
  }

  async function installApp(btn){
    if(deferredPrompt){
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch(e) {}
      deferredPrompt = null;
      return;
    }
    showGuide();
  }

  function addInstallUI(){
    if(document.getElementById("mathcloud-pwa-install")) return;

    var wrap = document.createElement("div");
    wrap.id = "mathcloud-pwa-install-wrap";
    wrap.className = "mc-pwa-install-wrap";

    var btn = document.createElement("button");
    btn.id = "mathcloud-pwa-install";
    btn.type = "button";
    btn.className = "mc-pwa-install-btn";
    btn.textContent = "Install MATHCLOUD App";
    btn.setAttribute("aria-label", "Install MATHCLOUD App");
    btn.addEventListener("click", function(){ installApp(btn); });

    var note = document.createElement("span");
    note.className = "mc-pwa-install-note";
    note.textContent = "Install for easier access";

    wrap.appendChild(note);
    wrap.appendChild(btn);
    document.body.appendChild(wrap);

    window.addEventListener("beforeinstallprompt", function(e){
      e.preventDefault();
      deferredPrompt = e;
      btn.classList.add("ready");
    });

    window.addEventListener("appinstalled", function(){
      deferredPrompt = null;
      btn.classList.remove("ready");
      btn.textContent = "MATHCLOUD Installed";
      setTimeout(function(){
        if(!isStandalone()) btn.textContent = "Install MATHCLOUD App";
      }, 2500);
    });
  }

  function init(){
    registerSW();
    addInstallUI();
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
