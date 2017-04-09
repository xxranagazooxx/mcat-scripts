// ==UserScript==
// @name         Kaplan Diagnostics hacks
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://atom.kaptest.com/assignment/jasper/test.*/*
// @grant        none
// ==/UserScript==

//ascii: http://www.network-science.de/ascii/
// font: big

/*
 _          _
| |        | |
| |__   ___| |_ __   ___ _ __ ___
| '_ \ / _ \ | '_ \ / _ \ '__/ __|
| | | |  __/ | |_) |  __/ |  \__ \
|_| |_|\___|_| .__/ \___|_|  |___/
             | |
             |_|
*/

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

function insertAfter(newNode, referenceNode) {
    //http://stackoverflow.com/questions/4793604/how-to-do-insert-after-in-javascript-without-using-a-library
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/*
          _
         | |
 _ __ ___| | __ _ _   _
| '__/ _ \ |/ _` | | | |
| | |  __/ | (_| | |_| |
|_|  \___|_|\__,_|\__, |
                   __/ |
                  |___/
 Singleton
*/

var myRelay = new function (){
    self = this;
    var content = [];
    self.add=function(stuff){
        content.push(stuff);
        window.dispatchEvent(evKD1);
    };
    self.get=function(){return content.pop();};
};

// Global relay to coordinate
//var myRelay = new relay();
var evKD1 = new CustomEvent("kd1"); // Content Loaded

//kd1 handler
function relayListener(e){
    debugz(4, "rl: loaded");
    var ret = myRelay.get();
    debugz(5, ("rl: ", ret));

    // Functions to call
    calcTimes.main(ret);
}

var DLEVEL=3; //emerg, crit, warn, info, trace
function debugz(level, args){
    if(level<=DLEVEL){
        if (typeof(args) === "string")
            console.log("KD: " + args);
        else{
            console.log("KD: ");
            console.info(args);
        }
    }
}

// Calculate and Render Timing Info
//  Singleton

var calcTimes = new function() {

    // VARS
    var self = this;
    self.stat = {
        numQ:0, numCt:0, numIct:0,
        timeTot:0, timeCt:0, timeIct:0,
        avgTimeCt:0, avgTimeIct:0, avgTimeQ:0};
    self.bdcta_flag = false;            // run once flag
    self.attachDOM = "#div-catScore";   // where to attach
    self.rawData = {};                  // raw data, just in case
    self.sectionName = "";              // name of section being rendered/processed
    self.registry = [];                 // registry of sections rendered

    // FUNCS
    // Parse data and generate stats
    self.process = function(data){
        self.rawData = data;
        debugz(5, "pc:"+data);
        // Stats array to store calc'd stats
        var stats={
            numQ:0, numCt:0, numIct:0,
            timeTot:0, timeCt:0, timeIct:0,
            avgTimeCt:0, avgTimeIct:0, avgTimeQ:0};

        // narrow namespace
        var secName = data.sequenceItemList.syllabusNodeTitle;
        var qlist = data.sequenceItemList.sequenceItem.sectionItems.sectionItem;
        self.sectionName = secName;

        // add to registry
        if(self.registry.indexOf(self.sectionName) == -1){
            self.registry.push(self.sectionName);
        }else{
            // if we've already rendered it, then bail!
            return false;
        }

        /* Splice important bits */
        var rows = [];
        qlist.forEach(function(q){
          var e = q.sectionItemAttribute;
          var new_e= {};

          // flatten the array of objects
          for (var x in e){
            new_e[e[x]['name']] = e[x]['value'];
          }
          var iidx = new_e['itemIndex'];
          var topic = new_e['mcat15QTopic'];
          var secs = new_e['mSecUsed'];
          var resp = new_e['responseCorrect'];
          rows.push({iidx: iidx, topic:topic, secs:secs, resp:resp});
        });

        rows.forEach(function(q){
          if (q.resp==="True"){
            stats['numCt']++;
            stats['timeCt'] += typeof q.secs === 'undefined' ? 0: parseInt(q.secs,10);
          }else if (q.resp==="False"){
            stats['numIct']++;
            stats['timeIct'] += typeof q.secs === 'undefined' ? 0: parseInt(q.secs,10);
          }
            stats['numQ'] += typeof q.resp === 'undefined'? 0: 1;
            stats['timeTot'] += typeof q.secs === 'undefined' ? 0: parseInt(q.secs,10);
        });
        stats['avgTimeQ'] = (stats['timeTot']/stats['numQ']).toFixed(2);
        stats['avgTimeCt'] = (stats['timeCt']/stats['numCt']).toFixed(2);
        stats['avgTimeIct'] = (stats['timeIct']/stats['numIct']).toFixed(2);
        debugz(5, "pc:"+ rows);
        debugz(5, "pc:"+ stats);

        self.stat = stats;
        return stats;
    };

    // Build DOMs

    // Build Anchor point for rest of the DOMs
    self.build_anchor = function(){
        var templHtml = `
<section id="calcTimes" class="content-scores sub-section-count-4" style="float:left">
    <ul class="item-review-test-analysis-scalesXXX" sytle="width:auto; margin:10px;  padding:10px">
      <!--- li class="multi-score-minor">
          <span>hi</span>
          <div>chem</div>
      </li --->
    </ul>
</section>`;

        var templElem = document.createElement("template");
        templElem.innerHTML = templHtml;

        // Insert!
        var attachPoint = $(self.attachDOM, window.frames[0].g_frameMgr.mainFrame.document)[0];
        debugz(4, "ba: attach: "+ attachPoint);
        insertAfter(templElem.content, attachPoint);
        debugz(4, 'ba: anchor built');
    };

    //create DOM for calc time by correct/incorrect
    self.build_nodes = function(stats){
        var li = `
<li class=\"multi-score-minorsXXX\" style=\"width:230px; margin-top: 0px !important; float:left; \">
    <sxpan>{0}</sxpan>
    <h3>{1}</h3><hr style="border-top: 1px dotted #aaa"/>{2}
</li>`;
        var div_tmpl = `
<table style="text-align: right">
    <tr><td>Correct: {0}</td><td>Time: {1}</td><td>Avg: {2}</td></tr>
    <tr><td>Incorrect: {3}</td><td>Time: {4}</td><td>Avg: {5}</td></tr>
    <tr><td>Total: {6}</td><td>Time: {7}</td><td>Avg: {8}</td></tr>
</table>`;

        var ret = li.format('', self.sectionName,
                            div_tmpl.format(
            stats.numCt, stats.timeCt,  stats.avgTimeCt,
            stats.numIct,stats.timeIct, stats.avgTimeIct,
            stats.numQ,  stats.timeTot, stats.avgTimeQ
                                           ));
        $("#calcTimes ul", window.frames[0].g_frameMgr.mainFrame.document)[0].insertAdjacentHTML( 'beforeend', ret );
    };

    // Main handler
    self.main = function(data){
        // process data
        var stats = self.process(data);
        if (!stats)
            return;
        // if 1st run, handle anchor dom attachment
        // HACK: delay for rendering to finish;
        //  turn this into a listener
        // this WILL backfire
        if(!calcTimes.bdcta_flag){
            setTimeout(function(){
                self.bdcta_flag = true;
                self.build_anchor();
                self.build_nodes(stats);
            }, 1000);
        }else{
            self.build_nodes(stats);
        }
    };
};

/*
 _       _           _   _                              _
(_)     (_)         | | (_)                            | |
 _ _ __  _  ___  ___| |_ _  ___  _ __   __   _____  ___| |_ ___  _ __
| | '_ \| |/ _ \/ __| __| |/ _ \| '_ \  \ \ / / _ \/ __| __/ _ \| '__|
| | | | | |  __/ (__| |_| | (_) | | | |  \ V /  __/ (__| || (_) | |
|_|_| |_| |\___|\___|\__|_|\___/|_| |_|   \_/ \___|\___|\__\___/|_|
       _/ |
      |__/
*/

var INJECT_JS = function (contentArea) { self=this; g_frameMgr = window.frames[0].g_frameMgr; this.donkey = "kong"; this.contentArea = contentArea; this.ajaxManager = $("iframe")[0].contentWindow.ajaxManager; this.sequenceData = null; this.view = null; this.selectedPath = null; this.init = false; this.sectionTabConfigItems = null; this.sectionData = null; this.showSectionTabConfigItems = null; this.DataModel = function () { this.SectionsItemsAttributes = null; this.SequenceItems = null; }; this.Init = function (data) { if (data != null) { this.populateDataModel(data); } else { alert("SequenceItemList Obj not available"); } }; this.populateDataModel = function (data) { if (data && data.sequenceItemList) { this.RenderView(this.sequenceData, data); } else { this.RenderView(this.sequenceData, null); } }; this.HideSequenceSection = function (sequenceSectionName) { var hide = false; $.each(this.sectionTabConfigItems, function (index, value) { if (value.toLowerCase() == sequenceSectionName.toLowerCase()) { hide = true; return false; } }); return hide; }; this.GetSequenceSectionTitle = function (sequenceSectionName) { var retVal = null; if (this.showSectionTabConfigItems && this.showSectionTabConfigItems != null) { $.each(this.showSectionTabConfigItems, function(index, value) { if (value.toLowerCase() == sequenceSectionName.toLowerCase()) { retVal = value.title; } }); } return retVal; }; this.InitProductTestAnalysisConfig = function () { if (g_frameMgr.productConfig && g_frameMgr.productConfig.testAnalysis) { var testAnalysisConfig = g_frameMgr.productConfig.testAnalysis; if (testAnalysisConfig.hideSections && testAnalysisConfig.hideSections.sectionName) this.sectionTabConfigItems = testAnalysisConfig.hideSections.sectionName; if (testAnalysisConfig.showSections && testAnalysisConfig.showSections.sectionName) this.showSectionTabConfigItems = testAnalysisConfig.showSections.sectionName; } }; this.GetData = function (sequencedata, selectedSections, init) { if (!sequencedata) { alert("No Sequence Data"); return; } this.sequenceData = sequencedata; this.init = init; this.InitProductTestAnalysisConfig(); if (selectedSections != null) { this.selectedPath = selectedSections; } else { if (this.sequenceData.syllabusNodes != null && this.sequenceData.syllabusNodes != undefined) { var sequenceSections = $(sequencedata.syllabusNodes.sequenceSection); var sequenceSectionName = ""; for (var i = 0; i < sequenceSections.length; i++) { if (!this.HideSequenceSection(sequenceSections[i].name)) { this.selectedPath = sequenceSections[i].name; break; } } } else { this.selectedPath = ""; } } var sequenceItemList = window.frames[0].helper.ResolveSequenceItemListName(this.sequenceData); if (sequenceItemList == null) { alert('sequenceItemList not found for sequence and parent(s) : ' + this.sequenceData.title); throw { name: "Bad Configuration", level: "Show Stopper", message: 'sequenceItemList not found for sequence and parent(s) : ' + this.sequenceData.title, htmlMessage: "" }; } this.ajaxManager.LoadSequenceAnalysis({ onSuccessCallback: this.OnDataReceived, async: false, context: this }, this.sequenceData.path + (this.selectedPath != "" ? ("/" + this.selectedPath) : ""), (sequenceItemList) ? sequenceItemList : ""); }; this.GetPrintPreviewData = function (sequencedata, selectedSections, init) { if (!sequencedata) { alert("No Sequence Data"); return; } this.sequenceData = sequencedata; this.init = init; this.InitProductTestAnalysisConfig(); if (selectedSections != null) { this.selectedPath = selectedSections; } else { if (this.sequenceData.syllabusNodes != null && this.sequenceData.syllabusNodes != undefined) { var sequenceSections = $(sequencedata.syllabusNodes.sequenceSection); var sequenceItemList = window.frames[0].helper.ResolveSequenceItemListName(this.sequenceData); var sequenceSectionName = ""; for (var i = 0; i < sequenceSections.length; i++) { if (!this.HideSequenceSection(sequenceSections[i].name)) { this.selectedPath = sequenceSections[i].name; if (sequenceItemList != null) this.ajaxManager.LoadSequenceAnalysis({ onSuccessCallback: this.OnDataReceived, async: false, context: this }, this.sequenceData.path + (this.selectedPath != "" ? ("/" + this.selectedPath) : ""), (sequenceItemList) ? sequenceItemList : ""); } } } else { this.selectedPath = ""; } } if (sequenceItemList == null) { alert('sequenceItemList not found for sequence and parent(s) : ' + this.sequenceData.title); throw { name: "Bad Configuration", level: "Show Stopper", message: 'sequenceItemList not found for sequence and parent(s) : ' + this.sequenceData.title, htmlMessage: "" }; } }; this.OnDataReceived = function (data) {myRelay.add(data); this.Init(data); }; this.RenderView = function (sequenceData, data) { if (!this.view) this.view = new window.frames[0].TestAnalysisView({ controller: this, contentArea: this.contentArea }); if (this.init) { this.view.init(sequenceData, data, this.selectedPath); } else { this.view.renderTableByItemList(data); } }; $("iframe")[0].contentWindow.g_frameMgr.itemReviewPageLoaded = true; };

/*
                 _
                (_)
 _ __ ___   __ _ _ _ __
| '_ ` _ \ / _` | | '_ \
| | | | | | (_| | | | | |
|_| |_| |_|\__,_|_|_| |_|

*/

// Main function
setTimeout(function() {
    'use strict';

    // holla!
    debugz(2, "running haccktttorrr");

    //get into testMode frame
    var testFrame = $("frame[name=testMode]", $("iframe")[0].contentWindow.document)[0];
    var nptLandingWindow = $("iframe")[0].contentWindow;

    //inject function
    nptLandingWindow.TestAnalaysis = INJECT_JS;

    window.addEventListener("kd1", relayListener);

}, 3000);



