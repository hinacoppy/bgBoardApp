// start-serviceWorker.js
// serviceWorkerを起動する
'use strict';

if (navigator.serviceWorker) {
  navigator.serviceWorker.register("./serviceWorker.js")
    .then(function(registration) {
      registration.update();
    }).catch(function(error) {
      console.warn("serviceWorker error.", error);
    });
}
