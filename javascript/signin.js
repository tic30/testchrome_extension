var jobDetail = "";//become an array later
var currenthostname = "";
var mustHaveSkills = ["basic", "qualifications", "required", "experience", "expertise", "minimum"];
var goodToHaveSkills = ["preferred", "qualifications", "ideal", "candidate"];//"is a plus"
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
    if (request.action === "getSource"){
        var pageSource = $.parseHTML(request.source);
        var detailsDiv = "";
        if(currenthostname === "linkedin.com") {
            detailsDiv = $(pageSource).find("#job-details");
            var easyApply = $(pageSource).find(".jobs-details-top-card__actions");
            if(easyApply && easyApply.find('button[data-control-name="jobdetails_topcard_inapply"]').length > 0){
                document.querySelector('#quickApply').innerText = "Easy Apply via LinkedIn !!!";
            }
        }else if (currenthostname === "glassdoor.com"){
            //var activeHeaderWrapper = $(pageSource).find('#HeroHeaderModule');
            detailsDiv = $(pageSource).find(".jobDescriptionContent");
            //var easyApply = activeHeaderWrapper.find('div[class="tbl fill borderBot anchor navButtons"]');
            //console.log(easyApply);
            if($(pageSource).find('.footerActions a[href="#easy-apply-module"]').length > 0){
               document.querySelector('#quickApply').innerText = "Easy Apply via Glassdoor !!!";
            }
        }else{
            document.querySelector('#content-wrapper').innerText = "Currently only support LinkedIn and Glassdoor";
            return;
        }
        if(detailsDiv.length > 0){
            jobDetail = detailsDiv.prop('innerHTML').toLowerCase();
            //play with string
            jobDetail = jobDetail.replace(/[,.<>\/\s+]/g, ' ');//replace <> to space, or we can do:(/[^\w\s\s+]/g,' '); which replace all none-char/number to space
            jobDetail = jobDetail.split(" ");
            console.log(jobDetail);
            
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
            debugger;
            //$.getJSON(chrome.extension.getURL('/jsons/keywords.json'), function(data) {
                //debugger;
                //console.log("data is: " + data);
                //var keywordArray = JSON.parse(data);
                //var keywordArray2 = ["javascript", "php", "sass", "html", "css", "ajax"];
                //console.log("keyword array is: " + keywordArray);
                var filteredKey = programLanguages.filter(findKeyword);
                console.log("filteredKey is: " + filteredKey);
                var outputKeywords = '';
                for(var keyword in filteredKey){
                    if(filteredKey[keyword].length > 1) outputKeywords += filteredKey[keyword] + ', '; 
                }
                outputKeywords = outputKeywords.substring(0, outputKeywords.length - 2);
                if (outputKeywords.length == 0) {
                    document.querySelector('#message').innerText = "Mmm, nothing matches";
                    return;
                }
                document.querySelector('#message').innerText = outputKeywords;
            //});
        } else {
            document.querySelector('#content-wrapper').innerText = "Please go to a job posting page";
        }
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
    scanPage();
    /*
    $('.btn').click(function (e) {
        scanPage();
    })*/
    
});