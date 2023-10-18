// ==UserScript==
// @name         YouTube Anti-Anti-Adblock
// @namespace    yt-anti-anti-adblock
// @version      0.1.0
// @description  Remove the "ad blockers are not allowed on youtube" popup.
// @author       NullDev
// @match        https://www.youtube.com/*
// @icon         https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/icon.png
// @grant        none
// ==/UserScript==

"use strict";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const probeElement = "#header.style-scope.ytd-enforcement-message-view-model";
const checkInterval = 1000;
const maxChecks = 30;

/**
 * Check if the probe element exists.
 *
 * @return {boolean} 
 */
const checkIfElementExists = function(){
    return !!document.querySelector(probeElement);
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

    const parent = probe.closest("ytd-popup-container");
    if (!parent) return;

    parent.remove();

    const video = document.querySelector("video");
    if (!video) return;

    video.play();

    console.log("%cyt-anti-anti-adblock: %cBy NullDev - https://nulldev.org - Code: https://github.com/NullDev/YT-Anti-Anti-Adblock", "color:#66A1FF;font-weight:bold;", "color:#63B06B;font-weight:bold;");
    console.log("%cyt-anti-anti-adblock: %cPopup removed.", "color:#66A1FF;font-weight:bold;", "color:#63B06B;font-weight:bold;");
};

/**
 * Prober function to check if the probe element exists.
 * We check every second for 30 seconds. If the element exists, we remove the popup and play the video.
 *
 * @returns {void}
 */
const prober = function(){
    if (checkIfElementExists()){
        cleanUp();
        return;
    }

    let counter = 0;
    const interval = setInterval(() => {
        if (checkIfElementExists()){
            cleanUp();
            clearInterval(interval);
            return;
        }
        else if (counter >= maxChecks) clearInterval(interval);
        else counter++;
    }, checkInterval);
};

(() => prober())();
