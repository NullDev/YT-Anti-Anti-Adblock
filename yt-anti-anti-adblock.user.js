// ==UserScript==
// @name           YouTube Anti-Anti-Adblock
// @name:de        YouTube Anti-Anti-Adblock
// @namespace      yt-anti-anti-adblock
// @version        1.3.2
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

const playerID = Math.random().toString(36).substring(7);
window[playerID] = null;

// @ts-ignore
// eslint-disable-next-line camelcase
const prodMode = !!GM_info.script.updateURL;
const runningInIframe = (window.location !== window.parent.location);

/**
 * Log a yt-anti-anti-adblock message and format it.
 *
 * @param {string} msg
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
 */
const checkAndSeekTimestamp = function(){
    const timestamp = (new URLSearchParams(window.location.search)).get("t");
    if (!timestamp) return;

    // @ts-ignore
    const [ time, unit ] = timestamp.match(/\d+|\D+/g);
    const seconds = (unit === "s") ? time : time * 60;
    window[playerID].seekTo(seconds, true);
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
        };

        if ((new URLSearchParams(window.location.search)).has("list")){
            playerVars.listType = "playlist";
            playerVars.list = (new URLSearchParams(window.location.search)).get("list");
        }

        !!YT && YT.ready(function(){
            log("YouTube API ready.");
            window[playerID] = new YT.Player(playerID, {
                videoId: (new URLSearchParams(window.location.search).get("v") || ""),
                playerVars,
                events: {
                    onReady(){
                        document.body.focus();
                        checkAndSeekTimestamp();
                    },
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

    if (key === " "){
        if (!(document.activeElement?.id === "search" || document.activeElement?.id === "contenteditable-root")){
            (window[playerID].getPlayerState() === 1)
                ? window[playerID].pauseVideo()
                : window[playerID].playVideo();

            event.preventDefault();
        }
    }

    else if (key === "ArrowLeft" || key === "ArrowRight"){
        const currentTime = window[playerID].getCurrentTime();
        window[playerID].seekTo(currentTime + (key === "ArrowLeft" ? -5 : 5), true);
    }

    else if (key === "f"){ // @ts-ignore
        ((document.fullscreenElement || document.webkitFullscreenElement) !== null)
            ? document.exitFullscreen()
            : window[playerID].getIframe().requestFullscreen();
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
        type2.replaceWith(f);

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
    .ytp-pause-overlay-container {
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

                    window.parent.location.href = this.href;
                });
            }
            log("Fixed endcart links.");
        }

        appendChild.apply(this, arguments);
    };
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

(() => {
    log("Initialized.", true);
    log("By NullDev - https://nulldev.org - Code: https://github.com/NullDev/YT-Anti-Anti-Adblock", true);
    log("Running in " + (prodMode ? "PRODUCTION" : "DEVELOPMENT") + " mode.", true);
    log("Running in " + (runningInIframe ? "IFRAME" : "PARENT") + " window.", true);

    if (runningInIframe){
        customOverrides();
        addNextButton();
        pushStyles();
    }

    const observer = new MutationObserver(prober);
    observer.observe(document.body, { childList: true, subtree: true });

    const {pushState} = history;
    const {replaceState} = history;
    history.pushState = function(){
        pushState.apply(history, arguments);
        handleNavigation();
    };

    history.replaceState = function(){
        replaceState.apply(history, arguments);
        handleNavigation();
    };

    window.addEventListener("load", prober);
})();
