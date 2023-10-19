// ==UserScript==
// @name         YouTube Anti-Anti-Adblock
// @namespace    yt-anti-anti-adblock
// @version      0.1.2
// @description  Remove the "ad blockers are not allowed on youtube" popup.
// @author       NullDev
// @license      MIT
// @match        *://*.youtube.com/*
// @homepageURL  https://github.com/NullDev/YT-Anti-Anti-Adblock
// @icon         https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/icon.png
// @updateURL    https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/yt-anti-anti-adblock.user.js
// @downloadURL  https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/yt-anti-anti-adblock.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

"use strict";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

// @ts-ignore
window.google_ad_status = 1;

const probeElement = "#header.style-scope.ytd-enforcement-message-view-model";
const checkInterval = 1000;
const maxChecks = 30;

/**
 * Log a yt-anti-anti-adblock message and format it.
 */
const log = (msg) => console.log(`%cyt-anti-anti-adblock: %c${msg}`, "color:#66A1FF;font-weight:bold;", "color:#63B06B;font-weight:bold;");

/**
 * Check if the probe element exists.
 *
 * @return {boolean}
 */
const checkIfElementExists = () => !!document.querySelector(probeElement);

/**
 * Probe an array of popup parents (depending on which one youtube decides to show).
 */
const parentProber = function(probe, parents){
    for (const parent of parents){
        const parentProbe = probe.closest(parent);
        if (parentProbe) parentProbe.remove();
    }
};

/**
 * Remove the popup and play the video.
 * We need to get the parent element of the probe element to get the entire popup.
 *
 * @returns {void}
 */
const cleanUp = function(){
    const probe = document.querySelector(probeElement);
    if (!probe) return;

    parentProber(probe, ["ytd-popup-container", "#error-screen"]);

    log("Popup removed.");

    const video = document.querySelector("video");
    if (video){
        video.play();
        return;
    }

    log("No video element found. YouTube is doing something fishy.");
};

/**
 * Prober function to check if the probe element exists.
 * We check every second for 30 seconds. If the element exists, we remove the popup and play the video.
 *
 * @returns {void}
 */
const prober = function(){
    if (checkIfElementExists()){
        log("Popup is already here! Cleaning up now.");
        cleanUp();
        return;
    }

    let counter = 0;
    const interval = setInterval(() => {
        if (checkIfElementExists()){
            log("Found the popup! Cleaning up now.");
            cleanUp();
            clearInterval(interval);
            return;
        }
        else if (counter >= maxChecks){
            clearInterval(interval);
            log(`No popup found after ${maxChecks}s. I'm giving up`);
            return;
        }
        counter++;
    }, checkInterval);
};

(() => {
    if (!location.pathname.startsWith("/watch")) return;

    log("Initialized.");
    log("By NullDev - https://nulldev.org - Code: https://github.com/NullDev/YT-Anti-Anti-Adblock");

    prober();
})();
