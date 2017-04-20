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

// get Window Frames
function getPassageWindow(i){
    if (typeof i !== 'undefined')
        return $("frame[name^=passage]",$("frame[name^=ElementDisplayFrame]")[0].contentWindow.document)[0].contentWindow;
    return $("frame[name^=passage]",$("frame[name^=ElementDisplayFrame]")[0].contentWindow.document)[0].contentWindow.document;
}
window.pw = getPassageWindow

function getQuestionWindow(i){
    if (typeof i !== 'undefined')
        return $("frame[name^=ITSElementDisplay]", $("frame[name^=ElementDisplayFrame]")[0].contentWindow.document)[0].contentWindow;
    return $("frame[name^=ITSElementDisplay]", $("frame[name^=ElementDisplayFrame]")[0].contentWindow.document)[0].contentWindow.document;
}
window.qw = getQuestionWindow

/*
 * Toggle highlighting of passages
 * singleton. so multiple instances don't exist
 */

var togglePassageHighlight = new function(){
    //toggle state 'true' is hilite; else no-hlite
    var show = true;

    return function(tshow){

        show = (typeof tshow !== 'undefined') ? tshow : show;
        $("span.itdhilite" + (show ? "" : "off"), getPassageWindow()).each(
            function(i,e){
                e.setAttribute('class', 'itdhilite' + (show ? "off" : ""));});
        // toggle state
        show = (show===true) ? false : true;
        console.log("cur passage highlight state: ", show);
    };
};

/*
 * Toggle strikeThroughs of answers
 *  (singleton)
 */
var toggleStrikethrough = new function(){
    // toggle strikeout of answer choices

    // current state
    var show = true;

    return function(tshow){
        show = (typeof tshow !== 'undefined') ? tshow : show;
        if (!show){
            $(".itdstrikeout", getQuestionWindow()).each(
                function(i, e){
                    e.setAttribute('class', 'itdstrikeout-x');});
        } else{
            $(".itdstrikeout-x", getQuestionWindow()).each(
                function(i, e){
                    e.setAttribute('class', 'itdstrikeout');});
        }
        show = (show===true) ? false : true;
        console.log("cur ans strike state: ", show);
    };
};


var toggleAnswerHighlight = new function (){

    var show = true;
    var ansKey = null;

    var showr = function(i,e){e.setAttribute('style', 'background-color:yellow');};
    var hider = function(i,e){e.setAttribute('style', '');};

    return function(tshow){
        if (ansKey === null){
            // get key to determine answer
            ansKey = $("form input[name=Key1]", getQuestionWindow())[0].value;
            console.log('anskey: ' + ansKey);
        }

        show = (typeof tshow !== 'undefined') ? tshow : show;
        if (!show){
            $("td[class^=ITSMCOptionLabel] div[id=sep1" +ansKey+"]",  getQuestionWindow()).each(showr);
            $("td[class^=ITSMCOptionLabel] div[id=item1" +ansKey+"]", getQuestionWindow()).each(showr);
            $("td[class^=ITSMCOptionText] div[id=radio1"+ansKey+"]",  getQuestionWindow()).each(showr);
        }else{
            $("td[class^=ITSMCOptionLabel] div[id=sep1" +ansKey+"]",  getQuestionWindow()).each(hider);
            $("td[class^=ITSMCOptionLabel] div[id=item1" +ansKey+"]", getQuestionWindow()).each(hider);
            $("td[class^=ITSMCOptionText] div[id=radio1"+ansKey+"]",  getQuestionWindow()).each(hider);
        }
        show = (show===true) ? false : true;
        console.log("cur ans highlight state: ", show);
    };
};

// Attachs toggle to the image
function rewireFuncs(){
    d('attached');

    var win;
    var pwin;

    // prevent crashes when score report screen loads
    try{
        win = getQuestionWindow('w');
        //pWin = getPassageWindow('w');
    }catch(e){
        return false;
    }

    // intercept. introduce toggle of strikethrough
    var origFunc = win.displayCurrentSolution;
    win.displayCurrentSolution = function(i){
        origFunc(i);
        toggleStrikethrough();
        toggleAnswerHighlight();
        togglePassageHighlight();
    };

    // nav function - TODO: remove intervals, move to event based
    /*
    var origNav = processAction;
    window.processAction = function(i){
        framedetails();
        $("frame[name^=ElementDisplayFrame]")[0].contentWindow.addEventListener('load',
                                                                                function(){console.log('load');});
//        setTimeout(rewireFuncs, 1500);
        origNav(i);
        setTimeout(function(){
           //toggleStrikethrough(win.contentWindow.document, false);
           toggleAnswerHighlight();
        }, 1000);
    };
*/
    runOnce(win);
}

function runOnce(win){
    win.displayCurrentSolution(1);
    toggleStrikethrough(false);
}


// enable/disable button.
//  usecase: disable hiding when taking tests

// show/hide strikethrough answers
var frameDisplay='';
var framePassage='';
window.addEventListener('load', function() {
    'use strict';
    rewireFuncs();
});

