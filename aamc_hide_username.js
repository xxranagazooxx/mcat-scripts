// ==UserScript==
// @name         AAMC hide user name
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  hide username. helpful for screen shots
// @author       You
// @match        https://www.e-mcat.com/ITDVersions/11.2.0.0/ITDStart.aspx*
// @grant        none
// ==/UserScript==


window.addEventListener('load', function() {
    'use strict';

    var DRNAMES = [
        "Gregory House", "Hawkeye Pierce", "Leonard McCoy", "John Dorian",
        "John Carter", "Chris Turk", "Perry Cox", "Thirteen", "James Wilson",
        "Doogie Howser", "Doug Ross", "Sherman T. Potter", "Mark Greene",
        "Trapper John McIntyre", "Robert Chase", "Miranda Bailey", "B. J. Hunnicutt",
        "John Zoidberg", "Lisa Cuddy", "Cristina Yang", "Nick Riveria", "Allison Cameron",
        "John Watson", "Julius Hibbert", "Meredith Grey"];
    var TESTNAMES = ["Medical College Torture Test", "Manatee County Area Transit"];

    var frameIFP = $("frameset frame[name=InfoPanelFrame]")[0].contentDocument;
    var randName = DRNAMES[parseInt(Math.random()*100 % DRNAMES.length)];
    var randTitle = TESTNAMES[parseInt(Math.random()*100 %TESTNAMES.length)].toUpperCase();

    $("#studentname", frameIFP)[0].innerHTML = randName;
    $("span#MCATTitle", frameIFP)[0].innerHTML = randTitle;

}, false);

