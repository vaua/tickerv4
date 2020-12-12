"use strict";

var hostData = {};
var canvas;
var ctx;
var gene = new Genome();



var idleTimeBeforeNextRequestAttempt = 100;


// This is the initial starting function that gets called from the browser
// When the simulation page is opened. It will initialize rendering
// variables and ask for a batch to process, starting the loop.
function processDataBatch() {
    var url = "processBatch";
    var method = "GET";
    var shouldBeAsync = true;
    var request = new XMLHttpRequest();
    var that = this;

    // Plot or replot the world
    request.onload = function () {

        var status = request.status;
        if (status == 200) {
            var updatedData = request.responseText;

            if ('"status" : 0'.localeCompare(updatedData) == 0) {
                console.log("No data to be processed available. Idling for some time before asking again.");
                setTimeout(processDataBatch(), idleTimeBeforeNextRequestAttempt);
            } else {
                //console.log("Received data batch with length " + updatedData.length + ".");
                var batch = JSON.parse(updatedData);
                batch.size = updatedData.length;
                //console.log("Parsed data batch " + batch.batchNumber + ", created: " + (Date.now() - batch.timeStamp) + " ms ago.");
                executeAndSubmitResult(batch);
                //console.log("Processed and submitted the data from batch " + batch.batchNumber);
            }
        }
        else {
            console.log("Something went horribly wrong!");
        }

    }

    request.open(method, url, shouldBeAsync);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send();
    console.log("Asked for data to process.");
}

// This function executes the received animals in the batch and gathers
// their actions, which it submits to the world. Upon submition completion,
// new loop is triggered.
function executeAndSubmitResult(batchData) {
    //var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var url = "submitBatchProcessingResult";
    var method = "POST";
    var shouldBeAsync = true;
    var request = new XMLHttpRequest();
    var actions = runAnimals(batchData);

    request.onload = function () {
       var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
       if (status == 200) {

           // OK, time to schedule next cycle...
           setTimeout(processDataBatch(), 0);
       }
       else {
           console.log("Something went horribly wrong!");
       }
    }

    request.open(method, url, shouldBeAsync);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(actions));
}


