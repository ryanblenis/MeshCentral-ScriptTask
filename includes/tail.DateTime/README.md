tail.DateTime
=============
[![npm Version](https://s.pytes.me/a7034683)](https://s.pytes.me/64a7f3a3)
[![npm Downloads](https://s.pytes.me/e3024ed7)](https://s.pytes.me/64a7f3a3)
[![Support Me](https://s.pytes.me/4a1717aa)](https://buymeacoffee.com/pytesNET)
[![plainJS](https://s.pytes.me/3fd80118)](https://s.pytes.me/e0b6ce86)
[![License](https://s.pytes.me/8257ac72)](LICENSE.md)

The perfect Date/Time Picker for your perfect Website / Web-Application!

<p align="center" style="text-align:center"><a href="https://github.pytes.net/tail.DateTime">
<img src="https://repository-images.githubusercontent.com/157055836/51d40e80-9b33-11e9-8fbb-f05ce51a16c4" style="width:auto;max-width:640px;" />
</a></p>

The **tail.DateTime** script is an extensive and fully-featured Date/Time Picker, written in vanilla
JavaScfript and without any dependency. It is compatible with all major browsers, starting with
**IE 10** and above, and is optimized for a direct use in the browser, as AMD (using requireJS) or
as browserify module.

----------------------------

[Wanna see **tail.DateTime** in action?](https://github.pytes.net/tail.DateTime)

[Wanna translate **tail.DateTime** in your language?](https://github.com/pytesNET/tail.DateTime/wiki/Help-Translating)

Support
-------
<p align="center" style="text-align:center">
You really like my <b>tail.DateTime</b> script and want to support me and all of my projects?<br/>
Then I would be extremely grateful for a coffee! (<b>Thanks to all Supporters</b>)<br/><br/>
<a href="https://www.buymeacoffee.com/pytesNET"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" title="Buy Me A Coffee" /></a>
</p>

Features
--------
-   **Beautiful**. 2 different Designs in 4 / 2 color schemes...
-   **Extensive**.
    -   Define Black- or Whitelists...
    -   Use colorizable tooltips...
    -   Restrict the date/time selection...
    -   ... and way more ...
-   **Configurable**. 30 settings and 4 bindable events...
-   **Translatable**. Already available in 17 languages...
-   **Zero Dependencies**. And written in vanilla JavaScript...
-   **Free/To/Use**. Because it's MIT licensed <3

Install & Embed
---------------
The master branch will always contain the latest Release, which you can download directly here
as [.tar](https://github.com/pytesNET/tail.DateTime/tarball/master) or as [.zip](https://github.com/pytesNET/tail.DateTime/zipball/master)
archive, or just visit the [Releases](https://github.com/pytesNET/tail.DateTime/releases) Page
on GitHub directly. You can also be cool and using NPM (or YARN):

```markup
npm install tail.datetime --save
```

```markup
yarn add tail.datetime --save
```

```markup
bower install tail.datetime --save
```

### Using a CDN
You can also use the awesome CDN services from jsDelivr or UNPKG.

```markup
https://cdn.jsdelivr.net/npm/tail.datetime@latest/
```

```markup
https://unpkg.com/tail.datetime/
```

Thanks To
---------
-   [MrGuiseppe](https://github.com/MrGuiseppe) for the Inspiration
-   [Octicons](https://octicons.github.com/) for the cute Icons
-   [jsCompress](https://jscompress.com/) for the Compressor
-   [prismJS](https://prismjs.com) for the Syntax highlighting library _[used on the demo]_
-   [MenuSpy](https://github.com/lcdsantos/menuspy) for the Menu Navigation _[used on the demo]_

### Translations
-   [Mohammed Alsiddeeq Ahmed](https://github.com/mosid) / [Arabic Translation](https://github.com/pytesNET/tail.DateTime/issues/1)
-   [Júnior Garcia](https://github.com/juniorgarcia) / [Brazilian Portuguese Translation](https://github.com/pytesNET/tail.DateTime/issues/13)
-   [mickeybyte](https://github.com/mickeybyte) / [Dutch Translation](https://github.com/pytesNET/tail.DateTime/issues/15)
-   [noxludio](https://github.com/noxludio) / [Finnish Translation](https://github.com/pytesNET/tail.DateTime/pull/17)
-   [FlashPanther](https://github.com/FlashPanther) / [French Translation](https://github.com/pytesNET/tail.DateTime/pull/19)
-   [Fabio Di Stasio](https://github.com/Fabio286) / [Italian Translation](https://github.com/pytesNET/tail.DateTime/issues/10)
-   [Murat Pala](https://github.com/Prozexis) / [Turkish Translation](https://github.com/pytesNET/tail.DateTime/pull/30)
-   [Lars Athle Larsen](https://github.com/larsathle) / [Norwegian Translation](https://github.com/pytesNET/tail.DateTime/pull/31)
-   [Jacob273](https://github.com/Jacob273) / [Polish Translation](https://github.com/pytesNET/tail.DateTime/pull/32)
-   [elPesecillo](https://github.com/elPesecillo) / [Spanish Mexican Translation](https://github.com/pytesNET/tail.DateTime/issue/34)
-   [Milan Kyncl](https://github.com/milankyncl) / [Czech Translation](https://github.com/pytesNET/tail.DateTime/pill/39)
-   [tsakal](https://github.com/tsakal) / [Greek Translation](https://github.com/pytesNET/tail.DateTime/issues/41)

Documentation
-------------
The Documentation has been moved to [GitHubs Wiki Pages](https://github.com/pytesNET/tail.DateTime/wiki),
but I will keep a table of contents list here and some basic instructions.

-   [Install & Embed](https://www.github.com/pytesNET/tail.DateTime/wiki/instructions)
-   [Default Usage](https://www.github.com/pytesNET/tail.DateTime/wiki/default-usage)
-   [Public Options](https://www.github.com/pytesNET/tail.DateTime/wiki/public-options)
-   [Public Methods](https://www.github.com/pytesNET/tail.DateTime/wiki/public-methods)
-   [Events & Callbacks](https://www.github.com/pytesNET/tail.DateTime/wiki/events-callbacks)
-   [Internal Variables & Methods](https://www.github.com/pytesNET/tail.DateTime/wiki/internal)

### Basic Instructions
You can pass up to 2 arguments to the **tail.DateTime** constructor, the first parameter is required
and need to be an `Element`, a `NodeList`, a `HTMLCollection`, an Array with `Element` objects or
just a single selector as `string`, which calls the `querySelectorAll()` method on its own. The
second parameter is optional and, if set, MUST be an object with your **tail.DateTime** options.

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />

        <link type="text/css" rel="stylesheet" href="css/tail.datetime-default.css" />
        <!-- Additional Stylesheets -->
    </head>
    <body>
        <script type="text/javascript" src="js/tail.datetime.min.js"></script>
        <!-- <script type="text/javascript" src="langs/tail.datetime-{lang}.js"></script> -->

        <input type="text" class="tail-datetime-field" />

        <script type="text/javascript">
            document.addEventListener("DOMContentLoaded", function(){
                tail.DateTime(".tail-datetime-field", { /* Your Options */ });
            });
        </script>
    </body>
</html>
```

### Default Settings
Please check out [GitHubs Wiki Pages](https://github.com/pytesNET/tail.DateTime/wiki) to read more
about each single option!

```javascript
tail.DateTime(".tail-datetime-field", {
    animate: true,                  // [0.4.0]          Boolean
    classNames: false,              // [0.3.0]          Boolean, String, Array, null
    closeButton: true,              // [0.4.5]          Boolean
    dateFormat: "YYYY-mm-dd",       // [0.1.0]          String (PHP similar Date)
    dateStart: false,               // [0.4.0]          String, Date, Integer, False
    dateRanges: [],                 // [0.3.0]          Array
    dateBlacklist: true,            // [0.4.0]          Boolean
    dateEnd: false,                 // [0.4.0]          String, Date, Integer, False
    locale: "en",                   // [0.4.0]          String
    position: "bottom",             // [0.1.0]          String
    rtl: "auto",                    // [0.4.1]          String, Boolean
    startOpen: false,               // [0.3.0]          Boolean
    stayOpen: false,                // [0.3.0]          Boolean
    time12h: false,                 // [0.4.13][NEW]    Boolean
    timeFormat: "HH:ii:ss",         // [0.1.0]          String (PHP similar Date)
    timeHours: true,                // [0.4.13][UPD]    Integer, Boolean, null
    timeMinutes: true,              // [0.4.13][UPD]    Integer, Boolean, null
    timeSeconds: 0,                 // [0.4.13][UPD]    Integer, Boolean, null
    timeIncrement: true,            // [0.4.5]          Boolean
    timeStepHours: 1,               // [0.4.3]          Integer
    timeStepMinutes: 5,             // [0.4.3]          Integer
    timeStepSeconds: 5,             // [0.4.3]          Integer
    today: true,                    // [0.4.0]          Boolean
    tooltips: [],                   // [0.4.0]          Array
    viewDefault: "days",            // [0.4.0]          String
    viewDecades: true,              // [0.4.0]          Boolean
    viewYears: true,                // [0.4.0]          Boolean
    viewMonths: true,               // [0.4.0]          Boolean
    viewDays: true,                 // [0.4.0]          Boolean
    weekStart: 0                    // [0.1.0]          String, Integer
});
```

Copyright & License
-------------------
Published under the MIT-License; Copyright &copy; 2018 - 2019 SamBrishes, pytesNET
