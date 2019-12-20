CHANGELOG
=========

Version 0.4.14 - Beta
---------------------
-   Add: The new Indonesian Translation.
    - Thanks to [thenewzhugeliang](https://github.com/thenewzhugeliang)
    @ [#53](https://github.com/pytesNET/tail.DateTime/issues/53).
-   Add: The new Korean Translation.
    - Thanks to [huhushow](https://github.com/huhushow)
    @ [#49](https://github.com/pytesNET/tail.DateTime/issues/49).
-   Bugfix: Calendar won't go back a month from July 2019.
    - Thanks to [#54](https://github.com/pytesNET/tail.DateTime/issues/54).
-   Bugfix: Changing the Hours increases the Date (per Step).
    - Thanks to [#43](https://github.com/pytesNET/tail.DateTime/issues/43),
    - Thanks to [#46](https://github.com/pytesNET/tail.DateTime/issues/46).
-   Bugfix: Multiple `dateRanges` aren't possible on some situations.
    - Thanks to [#55](https://github.com/pytesNET/tail.DateTime/issues/55),
    - Thanks to [#48](https://github.com/pytesNET/tail.DateTime/pull/48).

Version 0.4.13 - Beta
---------------------
-   Add: The new Polish Translation.
    - Thanks to [Jacob273](https://github.com/Jacob273)
    @ [#32](https://github.com/pytesNET/tail.DateTime/pull/32).
-   Add: The new Spanish Mexican Translation.
    - Thanks to [elPesecillo](https://github.com/elPesecillo)
    @ [#34](https://github.com/pytesNET/tail.DateTime/issue/34).
-   Add: The new Czech Translation.
    - Thanks to [Milan Kyncl](https://github.com/milankyncl)
    @ [#39](https://github.com/pytesNET/tail.DateTime/pull/39).
-   Add: The new Greek Translation.
    - Thanks to [tsakal](https://github.com/tsakal)
    @ [#41](https://github.com/pytesNET/tail.DateTime/issues/41).
-   Add: The new option `time12h` to use the AM/PM selector instead of the 24-h format.
    - Thanks to [#23](https://github.com/pytesNET/tail.DateTime/issues/23).
-   Add: Custom "stepUp" and "stepDown" buttons for the new time picker input fields.
-   Add: The new internal methods `this.prepare()` and `this.handleStep()`.
-   Update: The helper methods `cHAS()`, `cADD()` and `cREM()`.
-   Update: Time Selector fields are now `text` fields instead of number, using `inputmode` to force
    the number-selectors on mobile browsers (weak support).
-   Update: Remove the initial inline styling of the DateTime container (use CSS instead).
-   Update: Define factory-global `w` and `d` variables within the factory parameter declaration.
-   Update: The options `timeHours`, `timeMinutes` and `timeSeconds` calculates now the time number
    using the current time and the respective `timeStep*` value if `true` is passed.
-   Update: The options `timeHours`, `timeMinutes` and `timeSeconds` hides the respective field if
    `false` is used or just "disables" them by using `null`.
    - Thanks to [#23](https://github.com/pytesNET/tail.DateTime/issues/23).
-   Update: Use leading Zeros on the single time selectors.
    - Thanks to [#23](https://github.com/pytesNET/tail.DateTime/issues/23).
-   Remove: The `name` attributes from the Time input fields.
-   Bugfix: The helper method `clone` use an IE-unsupported function called `Object.assign`.
-   Bugfix: Webpack issue in VueJS.
    - Thanks to [#35](https://github.com/pytesNET/tail.DateTime/issues/35).
-   Bugfix: The `timeIncrement` function doesn't work by using the Arrow buttons on the respective
    time input[type=number] fields.
-   Bugfix: Dates before 1970-01-01 are disabled.
    - Thanks to [#40](https://github.com/pytesNET/tail.DateTime/issues/40).

### CSS / Less Environment
-   Add: A "not-allowed" cursor on disabled time fields / custom buttons.
-   Add: Minified Stylesheets and Source Maps (for both types).
-   Add: A node.js script to compile the Less stylesheets into CSS.
-   Add: New design parts for the custom time buttons and the AM/PM switch.
-   Update: The complete Less stylesheet structure.
-   Update: A few design changes on both designs.
-   Update: Each single CSS Color scheme contains now the complete styles instead of "imports".
-   Update: Move `direction: rtl;` from inline CSS to CSS stylesheet property.
-   Remove: All obsolete (not required) `-o-` and `-moz-` prefixed CSS properties.
-   Bugfix: Date picker is not positioned properly in a child scrollable container.
    - Thanks to [#33](https://github.com/pytesNET/tail.DateTime/issues/33).

Version 0.4.12 - Beta
---------------------
-   Bugfix: The new `classList` helper methods didn't worked as expected.
-   Bugfix: Add correct file to the `main` bower variable.
-   Bugfix: Add correct file to the `jsdelivr` package variable.

Version 0.4.11 - Beta
---------------------
-   Info: This is the first version, which drops IE 9 support.
-   Add: The new Norwegian Translation.
    - Thanks to [Lars Athle Larsen](https://github.com/larsathle)
    @ [#31](https://github.com/pytesNET/tail.DateTime/pull/31).
-   Add: Support for MooTools.
-   Add: Global `window` implementation using `datetime`, next to the existing `DateTime`, variable.
-   Update: Using `classList` to add / remove / check class names.
-   Update: Using `Object.assign` only to merge / clone object properties.
-   Update: Clone language strings (with the english ones, for backward compatibilities).
-   Rename: The internal `tailDateTime` variable has been renamed into `datetime`.
-   Remove: Support for Internet Explorer 9.
-   Remove: The jQuery `jQuery().tail("DateTime")` method (this was just a test).

Version 0.4.10 - Beta
---------------------
-   Add: The new French Translation.
    - Thanks to [Murat Pala](https://github.com/Prozexis)
    @ [#30](https://github.com/pytesNET/tail.DateTime/pull/30).
-   Bugfix: Use of undefined variable `datePart` in the `convertDate` method.
-   Bugfix: The jQuery implementation has been fixed.

Version 0.4.9 - Beta
--------------------
-   Add: Support for module exporting, using browserfy.
-   Add: A jQuery implementation using `jQuery().DateTime()` or `jQuery().tail("DateTime")`.
-   Update: Remove Parentheses on the `typeof` oeprator ('cause, it isn't a function).
-   Update: Should close (or test with stayopen) after submit time.
    - Thanks to [#24](https://github.com/pytesNET/tail.DateTime/issues/24).
-   Bugfix: Can't resolve '../tail.datetime-default.css'.
    - Thanks to [#25](https://github.com/pytesNET/tail.DateTime/issues/25).

Version 0.4.8 - Beta
--------------------
-   Add: The new French Translation.
    - Thanks to [FlashPanther](https://github.com/FlashPanther)
    @ [#19](https://github.com/pytesNET/tail.DateTime/pull/19).
-   Bugfix: Tooltips doesn't support date range.
    - Thanks to [FlashPanther](https://github.com/FlashPanther)
    @ [#20](https://github.com/pytesNET/tail.DateTime/issues/20).

Version 0.4.7 - Beta
--------------------
-   Add: The new Finish Translation.
    - Thanks to [noxludio](https://github.com/noxludio)
    @ [#17](https://github.com/pytesNET/tail.DateTime/pull/17).

Version 0.4.6 - Beta
--------------------
-   Add: An `@import` rule on the single colors, so only one file need to be included.
-   Update: the `bower.json` and `package.json` files
-   Update: Add 2019 to all Copyright notes.
-   Bugfix: When showing only time picker, the calendar label says undefined.
    - Thanks to [#16](https://github.com/pytesNET/tail.DateTime/issues/16).

Version 0.4.5 - Beta
--------------------
-   Add: The new Dutch Translation.
    - Thanks to [mickeybyte](https://github.com/mickeybyte)
    @ [#15](https://github.com/pytesNET/tail.DateTime/issues/15).
-   Add: Increase and Loop the Time fields by clicking Up and Down.
-   Add: The new option `timeIncrement`, which increase the next unit on loop of the previous one.
-   Add: The new option `closeButton`, which adds a close Button to the DateTime picker.
-   Add: The new internal method `handleTime()` which handles the time events.
-   Update: The `time*` options allows now also `false` as parameter to disable the field.

Version 0.4.4 - Beta
--------------------
-   Remove: The `project.synder` file until the new Synder Format is finished.
-   Bugfix: CDN / NPM Hotfix (because I uploaded the wrong branch to NPM).

Version 0.4.3 - Beta
--------------------
-   Add: The new Italian Translation.
    - Thanks to [Fabio Di Stasio](https://github.com/Fabio286)
    @ [#10](https://github.com/pytesNET/tail.DateTime/issues/10).
-   Add: The new Brazilian Portuguese Translation.
    - Thanks to [Júnior Garcia](https://github.com/juniorgarcia)
    @ [#13](https://github.com/pytesNET/tail.DateTime/issues/13).
-   Add: The new options `timeStep*` to change the step size of the input fields.
    - Thanks to [#9](https://github.com/pytesNET/tail.DateTime/issues/9).
-   Bugfix: Error in dateRanges visualization
    - Thanks to [#12](https://github.com/pytesNET/tail.DateTime/issues/12).

Version 0.4.2 - Beta
--------------------
-   Add: The new `modify()` method on the string Storage to change the strings globally.
-   Update: The `.register()` method checks now if locale is a string and object a object.
-   Update: The `.register()` method returns now `true` on success and `false` on failure.
-   Bugfix: The `.selectTime()` method didn't used the "already select / current viewed" date.
-   Bugfix: Changing time has no effect.
    - Thanks to [#5](https://github.com/pytesNET/tail.DateTime/issues/5).
-   Bugfix: Calculations are wrong in some Environments.
    - Thanks to [AndrewDRX](https://github.com/AndrewDRX)
    @ [#6](https://github.com/pytesNET/tail.DateTime/issues/6).

Version 0.4.1 - Beta
--------------------
-   Add: The new Arabic Translation.
    - Thanks to [Mohammed Alsiddeeq Ahmed](https://github.com/mosid)
    @ [#1](https://github.com/pytesNET/tail.DateTime/issues/1).
-   Add: The new option `rtl`, which allows to display the DateTime picker in an RTL style.
-   Add: The new event `view`.
-   Update: The new RTL supported Stylesheets.
-   Update: The default tooltip tick color depends now on the used theme.
-   Update: The "Enter/Escape" Key listener now also works when the cursor is within an input field.
-   Update: The events now gets fired AFTER the DateTime picker has done his actions.
-   Bugfix: Disabled dates could still be selected / clicked.
-   Bugfix: The `keyup` document event listener has fired per instance.
-   Bugfix: The "Enter" Key listener doesn't notice / used already selected dates.
-   Bugfix: You cannot go back farther than to February of the displayed year.
    - Thanks to [#3](https://github.com/pytesNET/tail.DateTime/issues/3).
-   Bugfix: Issue with Date Selection with Update to 0.4.0.
    - Thanks to [#2](https://github.com/pytesNET/tail.DateTime/issues/2).

Version 0.4.0 - Beta
--------------------
-   Info: This is the first BETA version. :3
-   Info: This Repository is now completely independent, due to the removal of the last original
    lines of MrGuiseppes pureJSCalendar script.
-   Add: Russian translation (Thanks to my workmate).
-   Add: Designs in LESS Format (I'm new at this Pre-Processing Stuff :/).
-   Add: Support as Asynchronous Module Definition.
-   Add: The default design has 3 new, and the "harx" design has one additional color schemes.
-   Add: The new option `animate` to enable and disable the fade and tooltip animations.
-   Add: The new option `dateBlacklist` to turn the `dateRange` from a blacklist to a whitelist.
-   Add: The new option `dateStart` to limit the calendar.
-   Add: The new option `dateEnd` to limit the calendar.
-   Add: The new option `locale` to change the used locale by the calendar.
-   Add: The new option `timeHours` to set the default Hours on init (pass null for current).
-   Add: The new option `timeMintes` to set the default Minutes on init (pass null for current).
-   Add: The new option `timeSeconds` to set the default Seconds on init (pass null for current).
-   Add: The new option `today` to mark the current day within the calendar script.
-   Add: The new option `tooltips` to create tooltips on specific dates.
-   Add: The new option `viewDefault` to select the default view, when the calendar gets opened.
-   Add: The new option `viewDecades` enables the view "Decades" (Show different Decades).
-   Add: The new option `viewYears` enables the view "Years" (Show 12 Years - One Decade).
-   Add: The new option `viewMonths` enables the view "Months" (January - December).
-   Add: The new option `viewDays` enables the view "Days" (01 - 28|29|30|31).
-   Add: The new internal event trigger method `.trigger()`.
-   Add: A new custom event listener, using `.on()` and `.trigger()`.
-   Add: The new internal render and view methods `.renderCalendar()`, `.renderDatePicker()`,
    `.renderTimePicker()`,`.viewDecades()`, `.viewYears()`, `.viewMonths()`, `.viewDays()`,
    `.handleLabel()`, `.showTooltip()` and `.hideTooltip()`.
-   Add: The new public method `.config()` to get and set settings during the runtime.
-   Add: The new public methods `.switchView()`, `.browseView()`, `.switchDate()` and `.fetchDate()`
    to control the calendar interface and fetch the current Date.
-   Add: The new public methods `.appendTooltip()` and `.appendRange()` to append tooltips and date
    ranges during the runtime.
-   Update: The translations itself, as well as the translation / locale system behind.
-   Update: Both designs has been updated to the new structure.
-   Update: The main helper methods.
-   Update: The calendar render process has been re-written, now it will always show 6 rows of dates,
    including days from the previous and next month.
-   Update: The locale system is now usable per instance, the strings doesn't get replaced.
-   Update: The option `classNames` allows now `true` to copy the class names from the main element
    and false, to do nothing.
-   Update: The option `position` and `static` has been merged, so use "top", "left", "right"
    or "bottom" to show the calendar on an absolute position relative to the passed element or pass
    any selector, which should be used as container.
-   Update: The option `weekStart` supports now also numbers (SUN = 0, MON = 1, ... SAT = 6).
-   Update: The option `dateRange` requires now a new range format, the old one is NOT supported.
-   Update: The public methods `.switchMonth()` and `switchYear()` now just aliases for the main
    public method `.switchDate()`.
-   Update: The public methods `.open()` and `.close()` now using `setTimeout()` instead of an
    interval.
-   Update: The public methods `.reload()` reloads the same instance instead of creating a new one.
-   Update: The public event method `.on()` has been updated and supports now a third argument.
-   Remove: The option `static` has been removed (use `position` instead).
-   Remove: The option `zeroSeconds` has been removed (use `timeSeconds` instead).
-   Remove: The option `static` has been removed (use `position` instead).
-   Remove: The `isIE11` and `tail.IE` variables.
-   Remove: The old render functions `.renderDay()`, `.renderMonth()` and `.renderTime()` has been
    replaced by the new `.view*()` and `.render*()` methods.
-   Remove: The `.createCalendar()` method has been replaced by the new `.view*()` methods.
-   Bugfix: The `tbdy` typo has been fixed.
-   Bugfix: Incorrect `colspan` value on the thead element (on the Months View).

Version 0.3.4 - Alpha
---------------------
-   Info: Official support for IE >= 9 starts now :(
-   Add: New `clone()` helper function as Fallback for IE >= 9.
-   Add: New `.IE` helper variable for Fallback use for IE >= 9.
-   Bugfix: Almost complete IE >= 9 support.

Version 0.3.3 - Alpha
---------------------
-   Add: A new internal translate / string function called `__()`.
-   Add: New `reload()` method, which calls `remove()` and re-inits the DateTime Calendar.
-   Update: Use `this` to call the main DateTime IIFE function.
-   Update: Update the selected date when the input field has been filled out manually.
-   BugFix: Fix Typo and wrong attribute name in `remove()` method.
-   BugFix: `Enter` / `Return` executes all events, even if just one field is in focus.
-   Removed: The `dateRange` fallback option has been removed, to clean the source up for the next
    major version.

Version 0.3.2 - Alpha
---------------------
-   Info: npmJS Version Fix.
-   Add: Spanish translation (Thanks to my workmate).

Version 0.3.1 - Alpha
---------------------
-   BugFix: Position Absolute doesn't recalculate.
    - Thanks to [#2](https://github.com/pytesNET/tail.DateTime/issues/2).
-   BugFix: Today on every Year.
    - Thanks to [#1](https://github.com/pytesNET/tail.DateTime/issues/1).

Version 0.3.0 - Alpha
---------------------
-   Info: Uses now some Vectors from GitHubs [Octicons](https://octicons.github.com/).
-   Add: A minified version, minified with [jsCompress](https://jscompress.com/).
-   Add: A new "white" design, used with `tail.datetime.white.css` (together with the main style
    sheet).
-   Add: A new `span` HTML element wraps each single day number.
-   Add: Events for `open`, `close` and `select` (used with `tail.DateTime::` prefix).
-   Add: New helper methos `trigger` to trigger tail.DateTime specific CustomEvents.
-   Add: New Option `static`, which allows a selector or an element as wrapper for a static view.
-   Add: New option `classNames`, which adds additional class names to the DateTime container.
-   Add: New option `startOpen`, which opens the picker after init.
-   Add: New option `stayOpen`, which disables some auto-closing events.
-   Add: New option `zeroSeconds`, which sets the seconds to 0 on init.
-   Add: New method `remove()` to remove the DateTime Picker.
-   Add: Current selected date class name and color.
-   Add: A colon between hours, minutes and seconds (That was really important!).
-   Add: The language strings für `de` (German) and `de_AT` (Austrian German)
-   Update: The SVG arrows on the default theme has been changed into angle images (Octicon).
-   Update: All SVG images has been changed into the Octicon vector graphics.
-   Update: The constructor allows now `NodeList`s and `HTMLCollection`s and uses `querySelectorAll`
    on strings.
-   Update: Renamed any `data-fox-*` attribute names into `data-tail-*`.
-   Update: The internal `element` input variable has renamed into `e`.
-   Update: The internal `calendar` DateTime Picker variable has renamed into `dt`.
-   Update: The internal `options` configuration variable has renamed into `con`.
-   Update: The internal `view` / `current` variables has been merged under `view`.
-   Update: The internal `select` variable holds the last (current) selected Date and Time as Date
    object.
-   Update: The option `dateRange` has renamed into `dateRanges` and allows multiple arrays with
    Date Objects, Date Values (YYYY-mm-dd) and Week-Day names.
-   BugFix: Current Date object has been shared between each prototype instance.

Version 0.2.0 - Alpha
---------------------
-   Info: Project has been renamed to `tail.DateTime` and adapted to the tail implementation.

Version 0.1.2 - Alpha
---------------------
-   Add: Use the `data-fox-value` attribute for pre-defined dates, before trying to parse the input value.
-   Add: Helper Methods `Fox.hasClass`, `Fox.addClass`, `Fox.removeClass`.
-   Add: Calendar Class Names `calendar-close`, `calendar-idle`, `calendar-open`.
-   Update: Changed `&lsaquo;` and `&rsaquo;` into SVG background images.
-   Update: Stores now a (current) Date Object instead of the year / month number.
-   Update: Some minimalistic style and script changes.
-   BugFix: Double Use of the `data-fox-calendar` attribute.
-   BugFix: Calendar closes after selecting a month.
-   BugFix: The `switchYear()` method doesn't supported a year argument.

Version 0.1.1 - Alpha
---------------------
-   Update: Change Calendar Counter Calculation (CCCC).
-   Update: Return `this` on the public methods.

Version 0.1.0 - Alpha
---------------------
-   Initial Release (Fork of [Pure JS Calendar](https://github.com/MrGuiseppe/pureJSCalendar)).
