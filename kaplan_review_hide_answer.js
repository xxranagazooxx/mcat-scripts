// ==UserScript==
// @id           KaplanReviewHideAnswer
// @name         Kaplan Review Hide Answer
// @namespace    KaplanReviewHideAnswers
// @version      0.3
// @description  Hide the goddamn answer, highlight and explanation by default, so I can test.
// @include      http*://atom.kaptest.com/assignment/jasper/test.*/start*
// @match        http*://atom.kaptest.com/assignment/jasper/test.*/start*
// @match        http*://atom.kaptest.com/assignment/jasper/*
// ==/UserScript==


(function() {
    'use strict';

    var loadDelay = 2000;
    var debugFlag = false;
    var runOnce = false;

    // DOMs for various IFrames. populated as rendered
    var topFrame = null;
    var testModeFrame = null;
    var questionIframe = null;

    // Console logger
    function debugz(e){
        if(debugFlag)
             console.log("KRHA debug: ", e);
    }
    debugz("running Script to Hide Answers");

    var Toggler = (function(){
        // local
        var state = 'show'; // current state

        // Selectors
        var tblSel = "table[name=singleAnswerMultipleChoice]"; // selector for answer choices
        var qExpSel = "div [id^=exp-mc]";          // selector for question passage outline
        var hiliteSel = "#divPassage table font";  // selector for highlighted sentences

        // derived
        var explainBox = $(qExpSel, questionIframe.contentWindow.document)[0];
        var seqCtFrame = $("iframe", testModeFrame.contentWindow.document)[0];
        var sCtx = seqCtFrame.contentWindow.document;

        // leggo!
        // save state
        var savedState = sCtx.querySelector(tblSel).innerHTML;
        // hide Explanation - run once to hide, since it already toggles
        try{ topFrame.contentWindow.g_seqUtil.ToggleDivVisibility(explainBox.id);} catch(e){}

        return function helper(){
            // current state='show', so hide
            if(state == 'show'){

                // hide Question outline
                try{ topFrame.contentWindow.g_seqUtil.ToggleDivVisibility("exp-");} catch(e){} //some Qs don't have this box;

                // run once to hide the highlight
                try{ topFrame.contentWindow.g_seqUtil.ToggleCorrectAns("1");} catch(e){}

                // remove strike through
                sCtx.querySelectorAll(tblSel + " tr[style*=text]").forEach(
                    function(e){
                        e.style['text-decoration']="none";
                    });

                // turn off answer bullet fill-in
                sCtx.querySelectorAll(tblSel + " td img", sCtx).forEach(
                    function(e){
                        if(e.getAttribute('id').indexOf("state0")!=-1) {
                            e.style["display"]="block";
                        }else{
                            e.style["display"]="none";
                        }});

                // turn off highlighting if it exists
                sCtx.querySelectorAll(hiliteSel).forEach(
                    function(e){
                        e.setAttribute('style', 'background-color: rgb(255,255,255)');
                    });
                state = 'hide'; // update state

            }else{
                // we're hidden, so show
                sCtx.querySelector(tblSel).innerHTML = savedState;
                // toggle Question outline
                try{ topFrame.contentWindow.g_seqUtil.ToggleDivVisibility("exp-");} catch(e){} //some Qs don't have this box;
                // toggle Answer Highlight
                //try{ topFrame.contentWindow.g_seqUtil.ToggleCorrectAns("1");} catch(e){console.log(e)}

                // turn off highlighting if it exists
                sCtx.querySelectorAll(hiliteSel).forEach(
                    function(e){
                        e.setAttribute('style', 'background-color: rgb(255,255,0)');
                    });
                state = 'show';
            }
        };
    });


    function qFrameListener(){
        var aExpSel = "div.subitem img[name^=btnExplanation]";
        var expButton = $(aExpSel, questionIframe.contentWindow.document)[0];
        var tog = Toggler();

        // toggle details;
        tog();
        // Handler for the explanation "button"
        expButton.addEventListener("click", tog);
    }

    function iframeListener(){
        // attach event and set runOnce
        debugz('ifl 1');
        questionIframe = $("iframe", testModeFrame.contentWindow.document)[0];
        var isIframe = (typeof(questionIframe) !== "undefined");

        // set listener only once
        if(!runOnce && isIframe){
            debugz("runonce");
            runOnce=true;
            questionIframe.addEventListener("load", qFrameListener);
        }

        // reset if we navigate away to main screen
        if (!isIframe){
            debugz("reset aml");
            runOnce=false;
        }
    }

    function main(){
        debugz('running main');
        topFrame = $("iframe")[0];
        testModeFrame = $("frame[name=testMode]", topFrame.contentWindow.document)[0];
        testModeFrame.addEventListener("load", iframeListener);
    }

    // delay until render; hacky but works
    setTimeout(main, loadDelay);
})();
