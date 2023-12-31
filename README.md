# YT Anti-Anti-Adblock

[![Greasy Fork](https://img.shields.io/greasyfork/dt/478457?label=Installs)](https://greasyfork.org/en/scripts/478457-youtube-anti-anti-adblock)
[![Tampermonkey / Violentmonkey](https://img.shields.io/badge/Tampermonkey%20/%20Violentmonkey-✓-brightgreen.svg)](https://www.tampermonkey.net)
[![Greasemonkey](https://img.shields.io/badge/Greasemonkey-✓-brightgreen.svg)](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
[![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/NullDev/YT-Anti-Anti-Adblock?logo=Cachet&label=Closed+Issues)](https://github.com/NullDev/YT-Anti-Anti-Adblock/issues?q=is%3Aissue+is%3Aclosed)
[![Version](https://img.shields.io/greasyfork/v/478457?label=Version)](https://greasyfork.org/en/scripts/478457-youtube-anti-anti-adblock/versions)
[![Greasy Fork Rating](https://img.shields.io/greasyfork/rating-count/478457?label=Rating)](https://greasyfork.org/en/scripts/478457-youtube-anti-anti-adblock/feedback)

<p align="center"><a href="https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/yt-anti-anti-adblock.user.js"><img height="200" width="auto" src="/icon.png" /></a></p>
<p align="center"><b>Simplistic user-script to remove YouTube's "Adblockers are not allowed" popup.</b></p>
<hr>

## :question: What does it do?

It automatically closes the anti-adblock popups and un-pauses (or loads) the video for you. <br>
Hopefully even fast enough so that you don't even notice 😸

- It removes the closable "Ad blockers are not allowed on YouTube" popup.
- It removes the closable three-strikes popup.
- And it removes the **non-closable** "Ad blockers violate YouTube's Terms of Service".
- It also supports playlists and timestamps and stuff.
- Oh and the script auto updates. Which is neat. I guess.

**Note:** This is _not_ a replacement for your Ad-Blocker.

<hr>

## ✔️ Compatibility

This script has been tested and is compatible with the following extensions and userscripts: 
- [AdBlockPlus](https://chrome.google.com/webstore/detail/adblock-plus-free-ad-bloc/cfhdojbkjhnklbpkdaibdccddilifddb)
- [uBlock Origin](https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm)
- [minerBlock](https://chrome.google.com/webstore/detail/minerblock/emikbbbebcdfohonlaifafnoanocnebl)
- [Return YouTube Dislike](https://chrome.google.com/webstore/detail/return-youtube-dislike/gebbhagfogifgggkldgodflihgfeippi)
- [Sponsor block for YouTube](https://chrome.google.com/webstore/detail/sponsorblock-for-youtube/mnjggcdmjocbbbhaepdhchncahnbgone)
- [YouTube Playlist Search](https://inspect.video/playlist-search)
- [Enhancer for YT](https://chromewebstore.google.com/detail/enhancer-for-youtube/ponfpcnoihfmfllpaingbgckeeldkhle)
- ... others will most likely work as well, but have not been tested. Please [report any issue](https://github.com/NullDev/YT-Anti-Anti-Adblock/issues/new/choose) you encounter.

<hr>

## :question: Why not use xyz?

Existing solutions either didn't work (e.g. a semi transparent window was still there and scrolling was disabled) or they were overkill (e.g. a complete youtube-only adblocker) or they only killed one type of popup.

Hence: ✨ YouTube Anti-Anti-Adblock ✨

<hr>

## :satellite: Installation

1. **Install Tampermonkey for your browser**:
   - [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Greasemonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
   - [Tampermonkey for Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
   - [Tampermonkey for Opera/OperaGX](https://addons.opera.com/en-gb/extensions/details/tampermonkey-beta/)

   Note: [ViolentMonkey](https://violentmonkey.github.io/) works too!

2. **Install the script**: <br><br>
[![Click to install](https://img.shields.io/badge/Click%20to%20install-37a779?style=for-the-badge)](https://github.com/NullDev/YT-Anti-Anti-Adblock/raw/master/yt-anti-anti-adblock.user.js)

    <sub>If the button doesn't work for some reason: [click here](https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/yt-anti-anti-adblock.user.js).</sub>

### 🍴 You can also find the script on [Greasy Fork](https://greasyfork.org/en/scripts/478457-youtube-anti-anti-adblock)!

<hr>

## :diamond_shape_with_a_dot_inside: Feature requests & Issues

Feature request or discovered a bug? Please [open an Issue](https://github.com/NullDev/YT-Anti-Anti-Adblock/issues/new/choose) here on GitHub.

<hr>

## :octocat: Contributors

<a href="https://github.com/NullDev/YT-Anti-Anti-Adblock/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NullDev/YT-Anti-Anti-Adblock" />
</a>

<sub>Made with [contrib.rocks](https://contrib.rocks).</sub>

<hr>

## 💻 Development

If you're interested in helping out (thanks!): 
- Clone the repository: `git clone https://github.com/NullDev/YT-Anti-Anti-Adblock.git`
- Open it in your favourite IDE
- Install the dependencies for linting with `npm i`
- [Link the script in Tampermonkey](https://www.tampermonkey.net/faq.php?locale=en#Q402)

Basically, in your Tampermonkey dashboard you create a new script that looks like this: 

```js
// ==UserScript==
// @name           YouTube Anti-Anti-Adblock
// @name:de        YouTube Anti-Anti-Adblock
// @namespace      yt-anti-anti-adblock
// @version        1.2.2
// @description    Removes all the "ad blockers are not allowed on youtube" popups.
// @description:de Entfernt alle "Werbeblocker sind auf YouTube nicht erlaubt" popups.
// @author         NullDev
// @copyright      Copyright (c) 2023 NullDev
// @license        MIT
// @match          *://*.youtube.com/*
// @homepageURL    https://github.com/NullDev/YT-Anti-Anti-Adblock
// @supportURL     https://github.com/NullDev/YT-Anti-Anti-Adblock/issues/new/choose
// @icon           https://raw.githubusercontent.com/NullDev/YT-Anti-Anti-Adblock/master/icon.png
// @grant          none
// @run-at         document-idle
// @require        file://C:/Users/XXX/PATH/TO/REPOSITORY/YT-Anti-Anti-Adblock/yt-anti-anti-adblock.user.js
// ==/UserScript==
```

Pay attention to the `// @require` line and edit the path accordingly.
- Windows: `file://C:/.../...` 
- Linux: `file:///.../...`

**Note:** Make sure you _DO NOT_ provide a `@updateURL` and `@downloadURL` field!

Then make sure the Tampermonkey extension [has permissions for file paths](https://www.tampermonkey.net/faq.php?locale=en#Q204). <br>
And finally, just code in your IDE and Tampermonkey will autoupdate it. (You need to reload YouTube though)

Now all thats left to do is grab an [open issue](https://github.com/NullDev/YT-Anti-Anti-Adblock/issues) and start coding. 😸

<hr>
