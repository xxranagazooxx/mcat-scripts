// ==UserScript==
// @name         AAMC Review helper
// @version      0.1
// @description  Hide answers, strikethroughs and highlights to help when reviewing
// @author       xxranagazooxx
// @match        https://www.e-mcat.com/ITDVersions/11.2.0.0/ITDStart.aspx*
// @grant        none
// ==/UserScript==

// debug XXX: validate b4 usage
d = console.log;

// toggle the highlight.
// singleton. so multiple instances don't exist
var toggle = new function(){
    //toggle state "" is hilite; else no-hlite

    var t="";
    return function(){
        $("span.itdhilite" + (t==="" ? "" : "off"),
          $("frame[name^=passage]",
            $("frame[name^=ElementDisplayFrame]")[0].contentWindow.document)[0]
          .contentWindow.document).each(
            function(i,e){
                e.setAttribute('class', 'itdhilite' + (t=== "" ? "off" : ""));});
        // toggle state
        t=(t===""? "off":"");
        d('tog');
    };
};

var toggleStrikethrough = new function(){
    // toggle strikeout of answer choices

    // current state
    var show = true;

    return function(frame, tshow){
        show = (typeof tshow !== 'undefined') ? tshow : show;
        if (!show){
            $(".itdstrikeout", frame).each(
                function(i, e){
                    e.setAttribute('class', 'itdstrikeout-x');});
        } else{
            $(".itdstrikeout-x", frame).each(
                function(i, e){
                    e.setAttribute('class', 'itdstrikeout');});
        }
        show = (show===true) ? false : true;
        console.log("cur state: ", show);
    };
};

var runOnce = false;

// Attachs toggle to the image
function attachToggleListener(){
/*    $('#itmshl1 > table > tbody > tr:nth-child(1) > td.s-sol > p > a > span > img',
      $("frame[name^=ITSElementDisplay]",
        $("frame[name^=ElementDisplayFrame]")[0]
        .contentWindow.document)[0]
      .contentWindow.document)[0]
    // TODO: make toggle accept event directly
        .addEventListener('click', function(e){toggle();});*/
    d('attached');

    var win = $("frame[name^=ITSElementDisplay]",
                   $("frame[name^=ElementDisplayFrame]")[0].contentWindow.document)[0];

    if (typeof win === "undefined"){
        console.log("win undef");
       // return;
    }

    var origFunc = win.contentWindow.displayCurrentSolution;
    // collapse/hide strikes on load
    origFunc(1);
    toggleStrikethrough(win.contentWindow.document, false);


    // intercept and inject
    win.contentWindow.displayCurrentSolution = function(i){
        toggleStrikethrough(win.contentWindow.document);
        origFunc(i);
    };
    
    if (!runOnce){
        // nav function
        var origNav = processAction;
        window.processAction = function(i){
            framedetails();
            $("frame[name^=ElementDisplayFrame]")[0].contentWindow.addEventListener('load', function(){console.log('load');});
            //setTimeout(attachToggleListener, 1000);
            origNav(i);
            attachToggleListener();
        };
        runOnce = true;

    }
    // unload handler
    /*win.contentWindow.onunload = function(e){
        console.log('unload');
        framedetails();
        win.contentWindow.top.postMessage('frame_change', '*');
    };*/
}

// run the hook, so it re-triggers when navigating pages
function injectHook(){

}

// enable/disable button.
//  usecase: disable hiding when taking tests

// show/hide strikethrough answers

function framedetails(){
    var pwin = $("frame[name^=ElementDisplayFrame]")[0];
    var win = $("frame[name^=ITSElementDisplay]",
                   $("frame[name^=ElementDisplayFrame]")[0].contentWindow.document)[0];
    console.log(pwin.contentWindow.location.href);
    console.log(win.contentWindow.location.href);
}

var frameDisplay='';
var framePassage='';
window.addEventListener('load', function() {
    'use strict';
    attachToggleListener();

    //XXX: kinda lame to use delay, but the website is wonky
    /*
    setTimeout(function(e){
        //toggle();
     //   attachToggleListener(); 
        d('to');}, 5000);*/
    console.log('done');
});

window.addEventListener('message', function(e){
    console.log('message recv');
    framedetails();
    var pwin = $("frame[name^=ElementDisplayFrame]")[0];
    var win = $("frame[name^=ITSElementDisplay]",
                   $("frame[name^=ElementDisplayFrame]")[0].contentWindow.document)[0];
    console.log("recv win: ", win);
    console.log("recv pwin: ", pwin);
}, false);

