var iframe;
var base;
var overlay;
var div;
var lifeContainer;
var lives = [];
var attemptCount=0;

var numLevels = 1;
var levelsPassed = 0;

var levelmap;

var setup = function(source){
    console.log("Setup: " + source);
    iframe = document.createElement('iframe');
    iframe.src = source
    iframe.width = window.innerWidth+10;
    iframe.height = window.innerHeight;

    base = document.createElement('div');
    base.setAttribute("class","bar");

    overlay = document.createElement('div');
    overlay.setAttribute("class","overlay");

    div = document.createElement('div');
    div.setAttribute("class","barcontent")

    lifeContainer = document.createElement('div');
    lifeContainer.setAttribute("class","lifeContainer")

    var image1 = document.createElement('img');
    image1.setAttribute("src", "jiji.png");
    image1.setAttribute("class", "life");


    var image2 = document.createElement('img');
    image2.setAttribute("src", "jiji.png");
    image2.setAttribute("class", "life");

    levelcount = document.createElement('div')
    levelcount.setAttribute("class",'levelcount');

    backboard = document.createElement('div')
    backboard.setAttribute("class",'backboard');

    progress = document.createElement('div')
    progress.setAttribute("class",'progress');

    lives = [image2, image1];

    lifeContainer.appendChild(image1);
    lifeContainer.appendChild(image2);


    levelcount.appendChild(backboard);
    levelcount.appendChild(progress)

    div.appendChild(levelcount);
    div.appendChild(lifeContainer);


    document.body.appendChild(base);
    document.body.appendChild(overlay);
    document.body.appendChild(div);
    document.body.appendChild(iframe);
}


var getLevelURL = function() {
    let url = new URL(window.location.href);
    return url.searchParams.get("l")
}

var fetchLevelMap = function() {
    request = new XMLHttpRequest();
    request.onreadystatechange = processLevelMap;
    request.open("GET", "urlMap.json",true);
    request.send();
}

var loadGame = function(){
    levelCode = getLevelURL();
    if(!levelmap[levelCode]) {
        console.log("Level does not exist");
    } else {
        let entry = levelmap[levelCode];
        levelsrc = entry.urlBase + "_" + Math.floor(Math.random() * parseInt(entry.count));

        setup(levelsrc);
    }
}

var processLevelMap = function(m) {
    
    if(m.target.readyState == 4){
        levelmap = JSON.parse(m.target.response);
        console.log(levelmap);
        loadGame()
    }
}


var resizeHandle = function(){
    iframe.width = window.innerWidth+10;
    iframe.height = window.innerHeight;
};
var onPuzzleAnswered = function(data){
    if(data.correct == false) {
        attemptCount++;
    }
}

var showBar = function() {
    base.setAttribute("class","bar")
    overlay.setAttribute("class","overlay")
    div.setAttribute("class","barcontent")
}

var setLives = function(count, array) {
    for(var i = 0; i < count && i < array.length; i++){
        array[i].setAttribute("class", "life lost")
    }

}

var setProgress = function(data) {
    let puzzles = data.context.puzzles.length;
    let current = data.context.currentPuzzleIndex;
    let size = 140;
    let unit = size/puzzles;
    let width = current*unit;
    progress.setAttribute("style", "width:" + width + "px");
}

var onPuzzleStarted = function(data){
    console.log("Started");

    setLives(attemptCount, lives)
    setProgress(data)

    if(attemptCount >= 2){
        if(history.length > 1) {
             history.back();
        } else {
            window.close();
        }
       
    }

}

var onMessage = function(m) {
    console.log(m);

    if(m.data.eventName)
    {
        if(m.data.eventName == "puzzle_answered") {
            onPuzzleAnswered(m.data.eventData);
        }

        if(m.data.eventName == "puzzle_completed" || m.data.eventName=="puzzle_started") {
            onPuzzleStarted(m.data.eventData);
        }
    }
}

window.addEventListener("resize", resizeHandle)
window.addEventListener("DOMContentLoaded", fetchLevelMap)
window.addEventListener("message",onMessage);