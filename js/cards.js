CardsLangLocalData.init_localdata();
CardsLang.load();

window.applicationCache.addEventListener('updateready', function (event) {
    // window.location.reload(true);
    window.applicationCache.update();
    window.applicationCache.swapCache();
}, false);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js')
        .then((reg) => {

            if (reg.waiting) {
                // a new version is already waiting to take control
                this.newWorker = reg.waiting;

                /*
                  code omitted: displays a snackbar to the user to manually trigger
                  activation of the new SW. This will be done by calling skipWaiting()
                  then reloading the page
                */
            };

            // handler for updates occuring while the app is running, either actively or in the background
            reg.onupdatefound = () => {
                this.newWorker = reg.installing;

                this.newWorker.onstatechange = () => {
                    if (this.newWorker.state === 'installed') {
                        if (reg.active) {
                            // a version of the SW already has control over the app

                            /*
                              same code omitted
                            */
                        } else {
                            // very first service worker registration, do nothing
                        };
                    };
                };
            };
        });
};