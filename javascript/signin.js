var jobDetail = "";
var currenthostname = "";

function getURLInfo() {
    var currentUrl;
    chrome.tabs.query({
        'active': true,
        'lastFocusedWindow': true
    }, function (tabs) {
        currentUrl = tabs[0].url;
        var parsedURL = getLocation(currentUrl);
        if (parsedURL) {
            //remove www
            currenthostname = parsedURL.hostname;
            //console.log("hostname www index is: "+currenthostname.indexOf("www."));
            if (currenthostname.indexOf("www.") >= 0) {
                currenthostname = currenthostname.substring(4);
            }
            $('.wrapper img#page-icon').attr("src", tabs[0].favIconUrl);
            $('.wrapper span#page-title').html("Welcome to " + currenthostname + "!");
            $('.wrapper button').removeAttr("disabled");
        } else {
            console.log("Can not detect URL: ");
            console.log(tabs);
        }
    });
}

function getLocation(href) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        href: href,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    }
}

function findKeyword(keyword) {
    if (jobDetail.indexOf(keyword) >= 0) {
        return true;
    } else {
        return false;
    }
}

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action === "getSource" && currenthostname === "linkedin.com") {
        var pageSource = $.parseHTML(request.source);
        jobDetail = $(pageSource).find("#job-details").prop('innerHTML').toLowerCase();
        //console.log("pageSource fetch complete, get:");
        //console.log(jobDetail);
        //console.log(chrome.extension.getURL('/jsons/keywords.json'));
        /*
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var keywordArray = JSON.parse(xhr.responseText);
                //var keywordArray2 = ["javascript", "php", "sass"];
                console.log("keyword array is: " + keywordArray);
                var filteredKey = keywordArray.filter(findKeyword);
                //debugger;
                console.log("filteredKey is: " + filteredKey);
                if (filteredKey == []) {
                    message.innerText = "Sorry, found nothing";
                    return;
                }
                message.innerText = "Hard Skills: " + filteredKey;
            }
        };
        xhr.open("GET", chrome.extension.getURL('/jsons/keywords.json'), true);
        xhr.send();
        */

        //$.getJSON(chrome.extension.getURL('/jsons/keywords.json'), function(data) {
            //debugger;
            //console.log("data is: " + data);
            //var keywordArray = JSON.parse(data);
            var keywordArray2 = ["javascript", "php", "sass", "html", "css", "ajax"];
            console.log("keyword array is: " + keywordArray2);
            var filteredKey = keywordArray2.filter(findKeyword);
            console.log("filteredKey is: " + filteredKey);
            if (filteredKey.length == 0) {
                message.innerText = "Mmm, nothing matches";
                return;
            }
            message.innerText = "Hard Skills: " + filteredKey;
        //});
    } else {
        message.innerText = "Currently only support LinkedIn";
    }
});

function scanPage() {

    var message = document.querySelector('#message');

    chrome.tabs.executeScript(null, {
        file: "/javascript/getPagesSource.js"
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });

}

$(document).ready(function () {
    getURLInfo();

    $('.btn').click(function (e) {
        scanPage();
    })
});