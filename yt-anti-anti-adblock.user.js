// ==UserScript==
// @name           YouTube Anti-Anti-Adblock
// @name:de        YouTube Anti-Anti-Adblock
// @namespace      yt-anti-anti-adblock
// @version        1.4.3
// @description    Removes all the "ad blockers are not allowed on youtube" popups.
// @description:de Entfernt alle "Werbeblocker sind auf YouTube nicht erlaubt" popups.
// @author         NullDev
// @copyright      2023+, NullDev
// @license        MIT
// @match          *://*.youtube.com/*
// @homepageURL    https://github.com/NullDev/YT-Anti-Anti-Adblock
// @supportURL     https://github.com/NullDev/YT-Anti-Anti-Adblock/issues/new/choose
// @icon           https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/icon.png
// @updateURL      https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/yt-anti-anti-adblock.user.js
// @downloadURL    https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/yt-anti-anti-adblock.user.js
// @grant          none
// @run-at         document-idle
// ==/UserScript==

"use strict";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

// @ts-ignore
window.google_ad_status = 1;

const playerID = Math.random().toString(36).substring(7); // @ts-ignore
window[playerID] = null;

// @ts-ignore
window.trustedTypes.createPolicy("default", {
    createHTML: (/** @type {string} */ str) => str,
    createScriptURL: (/** @type {string} */ str) => str,
    createScript: (/** @type {string} */ str) => str,
});

// @ts-ignore
// eslint-disable-next-line camelcase
const prodMode = !!GM_info.script.updateURL;
const runningInIframe = (window.location !== window.parent.location);

/**
 * Log a yt-anti-anti-adblock message and format it.
 *
 * @param {any} msg
 */
const log = function(msg, forceShow = false){
    // @ts-ignore
    // eslint-disable-next-line camelcase
    if (prodMode && !forceShow) return;
    console.log(`%cyt-anti-anti-adblock: %c${msg}`, "color:#66A1FF;font-weight:bold;", "color:#63B06B;font-weight:bold;");
};

/**
 * Probe an array of popup parents (depending on which one youtube decides to show).
 *
 * @param {Element} probe
 * @param {string[]} parents
 */
const parentProber = function(probe, parents){
    for (const parent of parents){
        const parentProbe = probe.closest(parent);
        if (parentProbe) parentProbe.remove();
    }
};

/**
 * Check if the video URL contains a timestamp and seek to it.
 *
 * @param {string|null} [ts=null]
 */
const checkAndSeekTimestamp = function(ts = null){
    const timestamp = ts ?? (new URLSearchParams(window.location.search)).get("t");
    if (!timestamp) return;

    // @ts-ignore
    const [ time, unit ] = timestamp.match(/\d+|\D+/g);
    const seconds = (unit === "s") ? time : time * 60;
    // @ts-ignore
    window[playerID].seekTo(seconds, true);

    log("Seeked to timestamp.");
};

/**
 * Generate a random Client Playback Nonce
 *
 * @return {string}
 */
const generateCPN = function(){
    const CPN_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
    const cpn = Array.from({ length: 16 }, () => CPN_ALPHABET[Math.floor(Math.random() * 256) & 63]).join("");
    return cpn;
};

/**
 * Mark the video as watched.
 *
 * @return {void}
 */
const markVideoAsWatched = function(){
    const currentVideoId = (new URLSearchParams(window.location.search)).get("v");
    if (!currentVideoId) return;

    const scripts = document.querySelectorAll("body script");
    for (const script of scripts){
        if (!script.innerHTML.includes("var ytInitialPlayerResponse = {")) continue;

        try {
            const json = JSON.parse(script.innerHTML.split("var ytInitialPlayerResponse = ")[1].split(";var meta")[0]);
            // videostatsPlaybackUrl -> baseUrl -> String
            // videostatsDelayplayUrl -> baseUrl -> String
            // videostatsWatchtimeUrl -> baseUrl -> String
            // ptrackingUrl -> baseUrl -> String
            // qoeUrl -> baseUrl -> String
            // atrUrl ->
            //    baseUrl -> String
            //    elapsedMediaTimeSeconds -> Number
            // videostatsScheduledFlushWalltimeSeconds -> []
            // videostatsDefaultFlushIntervalSeconds -> Number
            const tracking = json.playbackTracking;
            // @TODO: Also use watchtime to show the videos progress.
            // see: https://github.com/Airkek/Youtube-Viewers/issues/128
            const url = new URL(tracking.videostatsPlaybackUrl.baseUrl);

            url.searchParams.set("ver", "2");
            url.searchParams.set("cpn", generateCPN());

            fetch(url.toString(), {
                method: "GET",
                mode: "no-cors",
                credentials: "omit",
                headers: {
                    "User-Agent": navigator.userAgent,
                },
            });
        }
        catch (e){
            log("Failed to parse ytInitialPlayerResponse. Exiting...");
            return;
        }
    }

    log("Marked video as watched.");
};

/**
 * Toggle theater mode.
 *
 * @return {void}
 */
const toggleTheaterMode = function(){
    const playerWrap = /** @type {HTMLDivElement} */ (
        (runningInIframe ? window.parent : window).document.querySelector("ytd-watch-flexy")
    );

    const isTheater = playerWrap.hasAttribute("theater");
    if (!isTheater){
        playerWrap.setAttribute("theater", "");
        playerWrap.setAttribute("theater-requested_", "");
        playerWrap.setAttribute("full-bleed-player", "");
        playerWrap.removeAttribute("default-layout");

        playerWrap.style.cssText = `
            --ytd-watch-flexy-panel-max-height: 460px;
            --ytd-watch-flexy-chat-max-height: 460px;
            --ytd-watch-flexy-structured-description-max-height: 460px;
            --ytd-watch-flexy-comments-panel-max-height: 460px;
            --ytd-comments-engagement-panel-content-height: 460px;
        `;

        const playerParent = /** @type {HTMLDivElement} */ (
            (runningInIframe ? window.parent : window).document.querySelector("#columns > #primary > #primary-inner > #player")
        );
        playerParent.style.cssText = `
            display: block !important;
            width: 100% !important;
            position: absolute !important;
            top: 55px !important;
            left: 0 !important;
            overflow-x: clip !important;
        `;

        const theaterModeButton = document.querySelector("button.ytp-size-button.ytp-button");
        if (theaterModeButton){
            theaterModeButton.innerHTML = `
                <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
                    <use class="ytp-svg-shadow" xlink:href="#ytp-id-122"></use>
                    <path d="m 26,13 0,10 -16,0 0,-10 z m -14,2 12,0 0,6 -12,0 0,-6 z" fill="#fff" fill-rule="evenodd" id="ytp-id-122"></path>
                </svg>
            `;
        }
    }

    else {
        playerWrap.removeAttribute("theater");
        playerWrap.removeAttribute("theater-requested_");
        playerWrap.removeAttribute("full-bleed-player");
        playerWrap.setAttribute("default-layout", "");

        playerWrap.style.cssText = `
            --ytd-watch-flexy-panel-max-height: 707px;
            --ytd-watch-flexy-chat-max-height: 707px;
            --ytd-watch-flexy-structured-description-max-height: 707px;
            --ytd-watch-flexy-comments-panel-max-height: 707px;
            --ytd-comments-engagement-panel-content-height: 707px;
        `;

        const playerParent = /** @type {HTMLDivElement} */ (
            (runningInIframe ? window.parent : window).document.querySelector("#columns > #primary > #primary-inner > #player")
        );
        playerParent.style.cssText = "";

        const theaterModeButton = document.querySelector("button.ytp-size-button.ytp-button");
        if (theaterModeButton){
            theaterModeButton.innerHTML = `
                <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
                    <use class="ytp-svg-shadow" xlink:href="#ytp-id-58"></use>
                    <path d="m 28,11 0,14 -20,0 0,-14 z m -18,2 16,0 0,10 -16,0 0,-10 z" fill="#fff" fill-rule="evenodd" id="ytp-id-58"></path>
                </svg>
            `;
        }
    }

    log("Toggled theater mode.");
};

/**
 * Add the picture-in-picture and theater mode buttons to the player.
 */
const addPlayerControls = function(){
    const pictureInPictureButton = document.querySelector("button.ytp-pip-button.ytp-button");
    const theaterModeButton = document.querySelector("button.ytp-size-button.ytp-button");

    pictureInPictureButton?.removeAttribute("style");
    log("Added picture-in-picture button.");

    if (theaterModeButton){
        theaterModeButton.outerHTML = `
        <button class="ytp-size-button ytp-button" aria-keyshortcuts="t" data-priority="7" data-title-no-tooltip="Theater mode" 
            aria-label="Theater mode keyboard shortcut t" title="Theater mode (t)">
            <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
                <use class="ytp-svg-shadow" xlink:href="#ytp-id-58"></use>
                <path d="m 28,11 0,14 -20,0 0,-14 z m -18,2 16,0 0,10 -16,0 0,-10 z" fill="#fff" fill-rule="evenodd" id="ytp-id-58"></path>
            </svg>
        </button>
        `;

        log("Added theater mode button.");
    }

    const settingsMenu = document.querySelector("div.ytp-popup.ytp-settings-menu > .ytp-panel > .ytp-panel-menu");
    const btnHtml = `
        <div class="ytp-menuitem-icon">
            <svg height="24" viewBox="0 0 24 24" width="24">
                <path d="M21 7v10H3V7h18m1-1H2v12h20V6zM11.5 2v3h1V2h-1zm1 17h-1v3h1v-3zM3.79 3 6 5.21l.71-.71L4.5 2.29 3.79 3zm2.92 16.5L6 18.79 3.79 21l.71.71 2.21-2.21zM19.5 2.29 17.29 4.5l.71.71L20.21 3l-.71-.71zm0 19.42.71-.71L18 18.79l-.71.71 2.21 2.21z" fill="white">
                </path>
            </svg>
        </div>
        <div class="ytp-menuitem-label">Ambient mode</div>
        <div class="ytp-menuitem-content">
            <div class="ytp-menuitem-toggle-checkbox"></div>
        </div>
    `;

    const btn = document.createElement("div");
    btn.className = "ytp-menuitem";
    btn.setAttribute("role", "menuitemcheckbox");
    btn.setAttribute("aria-checked", "true");
    btn.setAttribute("tabindex", "0");
    btn.innerHTML = btnHtml;

    btn.addEventListener("click", () => {
        const checked = btn.getAttribute("aria-checked") === "true";
        btn.setAttribute("aria-checked", String(!checked));

        const c = window.parent.document.getElementById("cinematics-container");
        if (c) c.style.display = checked ? "none" : "block";
    });

    settingsMenu?.insertBefore(btn, settingsMenu.firstChild);

    log("Added ambient mode button.");
};

/**
 * Add a next button to the player.
 *
 * @return {void}
 */
const addNextButton = function(attempt = 0){
    const nextButton = /** @type {HTMLLinkElement} */ (document.querySelector("a.ytp-next-button.ytp-button"));
    if (!nextButton || nextButton.getAttribute("aria-disabled") === "false") return;

    const nextVideoElementA = window.parent.document.querySelector("ytd-compact-video-renderer a");
    if (!nextVideoElementA) return;

    const href = nextVideoElementA.getAttribute("href") ?? "";
    const title = nextVideoElementA.closest("#dismissible")?.querySelector("#video-title")?.getAttribute("title") ?? "";
    const thumbnail = nextVideoElementA.querySelector("img")?.getAttribute("src") ?? "";

    nextButton.setAttribute("aria-disabled", "false");
    nextButton.setAttribute("data-preview", thumbnail);
    nextButton.setAttribute("data-tooltip-text", title);
    nextButton.setAttribute("href", href);
    nextButton.setAttribute("title", "Next - " + title);
    nextButton.setAttribute("data-title-no-tooltip", "Next");
    nextButton.removeAttribute("style");
    nextButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        window.parent.history.replaceState(null, "", "https://www.youtube.com" + String(href));
        window.parent.location.reload();
    });

    setTimeout(() => {
        if (attempt >= 10){
            log("Next button not added. Giving up...");
            return;
        }
        else if (nextButton.getAttribute("aria-disabled") === "true"){
            log("Next button not added. Retrying...");
            addNextButton(attempt + 1);
        }
        else log("Next button added.");
    }, 500);
};

/**
 * Enable ambient mode.
 *
 * @return {void}
 */
const enableAmbientMode = function(){
};

/**
 * Load the YouTube API and create a new player.
 *
 * @return {void}
 */
const loadVideo = function(){
    log("Loading video...");

    const t = document.createElement("script");
    t.src = "https://www.youtube.com/iframe_api";

    const firstScr = document.getElementsByTagName("script")[0];
    firstScr.parentNode?.insertBefore(t, firstScr);

    t.onload = function(){ // @ts-ignore
        const { YT } = window;

        const playerVars = {
            autoplay: 1,
            controls: 1,
            disablekb: 0,
            enablejsapi: 1,
            listType: "",
            list: "",
        };

        if ((new URLSearchParams(window.location.search)).has("list")){
            playerVars.listType = "playlist";
            playerVars.list = (new URLSearchParams(window.location.search)).get("list") || "";
        }

        !!YT && YT.ready(function(){
            log("YouTube API ready."); // @ts-ignore
            window[playerID] = new YT.Player(playerID, {
                videoId: (new URLSearchParams(window.location.search).get("v") || ""),
                playerVars,
                events: {
                    onReady(){
                        document.body.focus();
                        checkAndSeekTimestamp();
                        markVideoAsWatched();
                        enableAmbientMode();
                    },
                    /**
                     * @param {{ data: any; target: { getVideoData: () => { (): any; new (): any; video_id: any; }; }; }} event
                     */
                    onStateChange(event){
                        if (event.data === YT.PlayerState.PLAYING && (new URLSearchParams(window.location.search)).has("list")){
                            const videoId = event.target.getVideoData().video_id;

                            const url = new URL(window.location.href);
                            url.searchParams.set("v", videoId);

                            const parentUrl = new URL(window.parent.location.href);
                            if (parentUrl.searchParams.get("v") !== videoId){
                                window.history.replaceState(null, "", String(url));
                                // @TODO: This is VERY heavy to reload the ENTIRE page.
                                //        We should find a way to only reload the parent player and UI.
                                window.parent.location.reload();
                            }
                        }
                    },
                },
            });
        });
    };
};

/**
 * Disable auto play to stop funky behaviour.
 */
const disableAutoPlay = function(){
    if (!(new URLSearchParams(window.location.search)).has("list")) return;

    const [ manager ] = document.getElementsByTagName("yt-playlist-manager"); // @ts-ignore
    manager.canAutoAdvance_ = false; // @ts-ignore
    manager.autoplayData = null;

    log("Disabled auto play.");
};

/**
 * Handle navigation to a new page.
 *
 * @return {void}
 */
const handleNavigation = function(){
    if (window.location.pathname !== "/watch") return;

    disableAutoPlay();
    if (!!document.getElementById(playerID)) return;

    const f = document.createElement("div");
    f.setAttribute("id", playerID);
    f.className = "video-stream html5-main-video";
    document.querySelector("div.yt-playability-error-supported-renderers")?.appendChild(f);

    // eslint-disable-next-line no-use-before-define
    cleanUp();
};

/**
 * Handle key codes for the video player.
 *
 * @param {KeyboardEvent} event
 */
const handleKeyCodes = function(event){
    const { key } = event;

    if (
        document.activeElement?.tagName === "INPUT"
        || document.activeElement?.tagName === "TEXTAREA"
        || document.activeElement?.id === "search"
        || document.activeElement?.id === "contenteditable-root"
        || (
            document.activeElement?.tagName === "DIV"
            && (
                document.activeElement?.getAttribute("contenteditable") === "true"
                || document.activeElement?.id.includes("contenteditable")
            )
        )
    ) return;

    if (key === " "){ // @ts-ignore
        (window[playerID].getPlayerState() === 1) ? window[playerID].pauseVideo() : window[playerID].playVideo();

        event.preventDefault();
    }

    else if (key === "ArrowLeft" || key === "ArrowRight"){ // @ts-ignore
        const currentTime = window[playerID].getCurrentTime(); // @ts-ignore
        window[playerID].seekTo(currentTime + (key === "ArrowLeft" ? -5 : 5), true);
    }

    else if (key === "f"){ // @ts-ignore
        ((document.fullscreenElement || document.webkitFullscreenElement) !== null)
            ? document.exitFullscreen() // @ts-ignore
            : window[playerID].getIframe().requestFullscreen();
    }

    else if (key === "t"){
        toggleTheaterMode();
    }
};

/**
 * Initialize the event listener for the video player and for navigation.
 */
const listeners = function(){
    document.addEventListener("keydown", handleKeyCodes);
    window.addEventListener("popstate", handleNavigation);
};

/**
 * Clean up the page and restore the video player.
 * Needs to be hoisted.
 *
 * @return {void}
 */
function cleanUp(){
    if (window.location.pathname !== "/watch") return;

    const f = document.createElement("div");
    f.setAttribute("id", playerID);
    f.className = "video-stream html5-main-video";

    const video = document.querySelector("video");
    if (video && video.src){
        // old non-strike popup
        const type1 = document.querySelector("#header.style-scope.ytd-enforcement-message-view-model");
        if (!type1) return;

        parentProber(type1, ["ytd-popup-container", "#error-screen"]);

        log("Cleaned up popup. Found the video element. Starting video...");
        video.play();

        return;
    }

    const type2 = document.querySelector("ytd-enforcement-message-view-model.style-scope");
    if (type2){
        type2.closest("yt-playability-error-supported-renderers")?.replaceWith(f);

        const hotkeyManager = document.querySelector("yt-hotkey-manager");
        if (hotkeyManager) hotkeyManager.remove();

        log("Cleaned up violation message");

        listeners();
        disableAutoPlay();
        loadVideo();
    }
}

/**
 * Push our style overrides to the page.
 */
const pushStyles = function(){
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("data-id", "yt-anti-anti-adblock-overrides-" + playerID);
    style.innerHTML = `
    .ytp-pause-overlay-container,
    a.ytp-youtube-button.ytp-button.yt-uix-sessionlink {
        display: none !important;
    }
    `;
    document.head.appendChild(style);
    log("Pushed styles.");
};

/**
 * Override some functions to fix some issues.
 */
const customOverrides = function(){
    // global override for .appendChild
    const { appendChild } = Element.prototype; // @ts-ignore
    Element.prototype.appendChild = function(){
        if (this.classList.contains("ytp-endscreen-content")){
            const links = this.querySelectorAll("a");
            for (const link of links){
                link.removeAttribute("target");

                const clone = link.cloneNode(true);
                link.parentNode?.replaceChild(clone, link);

                clone.addEventListener("click", function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    // @ts-ignore
                    window.parent.location.href = this.href;
                });
            }
            log("Fixed endcart links.");
        }
        // @ts-ignore
        appendChild.apply(this, arguments);
    };
};

/**
 * Watch for comment timestamp clicks and seek to them.
 *
 * @param {Event} event
 * @return {void}
 */
const commentTimeStampWatcher = function(event){
    const el = /** @type {HTMLLinkElement} */ (event.target);
    if (el.tagName !== "A" || !el.classList.contains("yt-simple-endpoint")) return;

    event.preventDefault();

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });

    const timestamp = el.getAttribute("href")?.split("&t=")[1];
    if (!timestamp) return;

    checkAndSeekTimestamp(timestamp);

    const url = new URL(window.location.href);
    url.searchParams.set("t", timestamp);
    window.history.replaceState(null, "", String(url));
};

/**
 * Callback for the page change observer.
 *
 * @return {void}
 */
const prober = function(){
    if (window.location.pathname === "/watch"){
        cleanUp();
        return;
    }

    const prevPlayer = document.getElementById(playerID);
    if (prevPlayer) prevPlayer.remove();
};

/**
 * Push everything that needs to be loaded quickly.
 */
const initLoad = function(){
    document.querySelector("button.ytp-size-button.ytp-button")?.addEventListener("click", () => toggleTheaterMode());

    document.addEventListener("mousedown", event => {
        commentTimeStampWatcher(event);
    });

    if (!runningInIframe){
        const ytd = document.querySelector("ytd-player");
        ytd?.parentElement && ytd.parentElement.removeChild(ytd);
    }

    prober();
};

(() => {
    log("Initialized.", true);
    log("By NullDev - https://nulldev.org - Code: https://github.com/NullDev/YT-Anti-Anti-Adblock", true);
    log("Running in " + (prodMode ? "PRODUCTION" : "DEVELOPMENT") + " mode.", true);
    log("Running in " + (runningInIframe ? "IFRAME" : "PARENT") + " window.", true);

    if (runningInIframe){
        // afaik this is the only other iframe youtube natively uses.
        // we don't have to check other domains.
        if (window.location.href.includes("accounts.youtube.com")){
            log("Running on wrong iframe. Exiting...");
            return;
        }

        customOverrides();
        addNextButton();
        addPlayerControls();
        pushStyles();
    }

    const observer = new MutationObserver(prober);
    observer.observe(document.body, { childList: true, subtree: true });

    const {pushState} = history;
    const {replaceState} = history;
    history.pushState = function(){ // @ts-ignore
        pushState.apply(history, arguments);
        handleNavigation();
    };

    history.replaceState = function(){ // @ts-ignore
        replaceState.apply(history, arguments);
        handleNavigation();
    };

    window.addEventListener("load", initLoad);
})();
