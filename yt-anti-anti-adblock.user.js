// ==UserScript==
// @name         YouTube Anti-Anti-Adblock
// @namespace    yt-anti-anti-adblock
// @version      1.1.0
// @description  Remove the "ad blockers are not allowed on youtube" popup.
// @author       NullDev
// @license      MIT
// @match        *://*.youtube.com/*
// @homepageURL  https://github.com/NullDev/YT-Anti-Anti-Adblock
// @icon         https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/icon.png
// @updateURL    https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/yt-anti-anti-adblock.user.js
// @downloadURL  https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/yt-anti-anti-adblock.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

"use strict";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

// @ts-ignore
window.google_ad_status = 1;

const playerID = Math.random().toString(36).substring(7);
window[playerID] = null;

/**
 * Log a yt-anti-anti-adblock message and format it.
 *
 * @param {string} msg
 */
const log = (msg) => console.log(`%cyt-anti-anti-adblock: %c${msg}`, "color:#66A1FF;font-weight:bold;", "color:#63B06B;font-weight:bold;");

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
    if (timestamp){ // @ts-ignore
        const [ time, unit ] = timestamp.match(/\d+|\D+/g);
        const seconds = (unit === "s") ? time : time * 60;
        window[playerID].seekTo(seconds, true);
    }
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

        !!YT && YT.ready(function(){
            log("YouTube API ready.");
            window[playerID] = new YT.Player(playerID, {
                videoId: (new URLSearchParams(window.location.search).get("v") || ""),
                playerVars: { autoplay: 1, controls: 1, disablekb: 0, enablejsapi: 1 },
                events: {
                    onReady(){
                        document.body.focus();
                        log("Video loaded.");

                        checkAndSeekTimestamp();
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
    this.document.querySelector("div.yt-playability-error-supported-renderers")?.appendChild(f);

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
    log("Initialized.");
    log("By NullDev - https://nulldev.org - Code: https://github.com/NullDev/YT-Anti-Anti-Adblock");

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
