(function() {
    'use strict';

    // First try to inject if we're already in a Twitch player iframe
    if (window.location.hostname.includes('player.twitch.tv')) {
        injectAdBlock();
        return;
    }

    // Otherwise set up observer to watch for Twitch iframes being added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeName === 'IFRAME' && node.src?.includes('player.twitch.tv')) {
                    // Get the original iframe attributes
                    const originalSrc = node.src;
                    const originalAttrs = {};
                    Array.from(node.attributes).forEach(attr => {
                        originalAttrs[attr.name] = attr.value;
                    });

                    // Create a wrapper to maintain position/sizing
                    const wrapper = document.createElement('div');
                    wrapper.style.cssText = node.style.cssText;
                    wrapper.style.width = '100%';
                    wrapper.style.height = '100%';
                    wrapper.style.position = 'relative';

                    // Create our proxy iframe
                    const proxyFrame = document.createElement('iframe');
                    Object.keys(originalAttrs).forEach(key => {
                        if (key !== 'src') { // Don't copy src yet
                            proxyFrame.setAttribute(key, originalAttrs[key]);
                        }
                    });
                    proxyFrame.style.cssText = 'width:100%;height:100%;border:none;position:absolute;';

                    // Create HTML content that loads our script first
                    const html = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
                                iframe { width: 100%; height: 100%; border: none; }
                            </style>
                            <script>
                                // Inject our ad blocking code
                                ${injectAdBlock.toString()}
                                
                                // Create the real Twitch iframe after our code is ready
                                const iframe = document.createElement('iframe');
                                iframe.src = "${originalSrc}";
                                iframe.allowFullscreen = true;
                                document.body.appendChild(iframe);
                                
                                // Initialize ad blocking
                                injectAdBlock();
                            </script>
                        </head>
                        <body></body>
                        </html>
                    `;

                    proxyFrame.srcdoc = html;
                    
                    // Replace original iframe with our proxy
                    wrapper.appendChild(proxyFrame);
                    node.parentNode.replaceChild(wrapper, node);
                }
            });
        });
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // The actual ad blocking code that runs in the Twitch player context
    function injectAdBlock() {
        var ourTwitchAdSolutionsVersion = 2;
        if (window.twitchAdSolutionsVersion && window.twitchAdSolutionsVersion >= ourTwitchAdSolutionsVersion) {
            console.log("skipping vaft as there's another script active");
            window.twitchAdSolutionsVersion = ourTwitchAdSolutionsVersion;
            return;
        }
        window.twitchAdSolutionsVersion = ourTwitchAdSolutionsVersion;

        function declareOptions(scope) {
            scope.AdSignifier = 'stitched';
            scope.ClientID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
            scope.ClientVersion = 'null';
            scope.ClientSession = 'null';
            scope.PlayerType2 = 'embed';
            scope.PlayerType3 = 'site';
            scope.PlayerType4 = 'autoplay';
            scope.CurrentChannelName = null;
            scope.UsherParams = null;
            scope.WasShowingAd = false;
            scope.GQLDeviceID = null;
            scope.IsSquadStream = false;
            scope.StreamInfos = [];
            scope.StreamInfosByUrl = [];
            scope.MainUrlByUrl = [];
            scope.EncodingCacheTimeout = 60000;
            scope.ClientIntegrityHeader = null;
            scope.AuthorizationHeader = null;
        }

        // Rest of the original ad blocking implementation...
    }
})();
