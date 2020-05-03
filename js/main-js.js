// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const squatsURL = "https://teachablemachine.withgoogle.com/models/AS-YmSPJZ/";//squats model
const pushupsURL = "https://teachablemachine.withgoogle.com/models/jBzVDZ0SJ/";//pushups model
const pullupsURL = "https://teachablemachine.withgoogle.com/models/NX7POcZGY/";//pullups model

let squatsModel, pushupsModel, pullupsModel, webcam, ctx, labelContainer, maxPredictions;
let enterSquat = false, enterPushup = false, squatsCount = 0, pushupsCount = 0, squatComplete = false, pushupComplete = false
pushupStatus="", squatStatus="", enterPullup = false, pullupsCount = 0, pullupComplete = false
pullupStatus="";

let devMode=true;
let squatMode=false;
let pushupMode=false;
let pullupMode=false;

let minEnterConfidence = 0.6, minCompleteConfidence=0.85;


async function init() {
    //squats model url
    const squatsModelURL = squatsURL + "model.json";
    const squatsMetadataURL = squatsURL + "metadata.json";
    //pushups model url
    const pushupsModelURL = pushupsURL + "model.json";
    const pushupsMetadataURL = pushupsURL + "metadata.json";
    //pullups model url
    const pullupsModelURL = pullupsURL + "model.json";
    const pullupsMetadataURL = pullupsURL + "metadata.json";


    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    squatsModel = await tmPose.load(squatsModelURL, squatsMetadataURL);
    squatsMaxPredictions = squatsModel.getTotalClasses();

    pushupsModel = await tmPose.load(pushupsModelURL, pushupsMetadataURL);
    pushupsMaxPredictions = pushupsModel.getTotalClasses();

    pullupsModel = await tmPose.load(pullupsModelURL, pullupsMetadataURL);
    pullupsMaxPredictions = pullupsModel.getTotalClasses();


    // Convenience function to setup a webcam
    const size = 400;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");

    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < squatsMaxPredictions+pushupsMaxPredictions+pullupsMaxPredictions; i++) { // and class labels
        // if (i == squatsMaxPredictions) labelContainer.appendChild(document.createElement("hr"));
        // if (i == pullupsMaxPredictions+squatsMaxPredictions) labelContainer.appendChild(document.createElement("hr"));
        labelContainer.appendChild(document.createElement("div"));
    }
    document.getElementById("squatsBtn").disabled = false;
    document.getElementById("pushupsBtn").disabled = false;
    document.getElementById("pullupsBtn").disabled = false;

    document.getElementById("cmrbtn").classList.toggle("disabled");

    alert("Models Ready to use!");
}


function countSquats() {
    squatMode=!squatMode;
    var squatcolor=document.getElementById("squatsBtn").style.background;
    if (squatcolor=='red') {
        document.getElementById("squatsBtn").style.background = '#1da1f2';
    }else {
        document.getElementById("squatsBtn").style.background = 'red';
    }
}

function countPushups() {
    pushupMode=!pushupMode;
    var pushcolor=document.getElementById("pushupsBtn").style.background;
    if (pushcolor=='red') {
        document.getElementById("pushupsBtn").style.background = '#1da1f2';
    }else {
        document.getElementById("pushupsBtn").style.background = 'red';
    }
}

function countPullups() {
    pullupMode=!pullupMode;
    var pullcolor=document.getElementById("pullupsBtn").style.background
    if (pullcolor=='red') {
        document.getElementById("pullupsBtn").style.background = '#1da1f2';
    }else {
        document.getElementById("pullupsBtn").style.background = 'red';
    }
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();

    document.getElementById("squat-boolean-container").innerHTML = enterSquat;
    document.getElementById("squat-status-container").innerHTML = squatStatus;
    document.getElementById("squat-count-container").innerHTML = squatsCount;

    document.getElementById("pushup-boolean-container").innerHTML = enterPushup;
    document.getElementById("pushup-status-container").innerHTML = pushupStatus;
    document.getElementById("pushup-count-container").innerHTML = pushupsCount;
    
    document.getElementById("pullup-boolean-container").innerHTML = enterPullup;
    document.getElementById("pullup-status-container").innerHTML = pullupStatus;
    document.getElementById("pullup-count-container").innerHTML = pullupsCount;

    window.requestAnimationFrame(loop);
}

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await squatsModel.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const squatsPrediction = await squatsModel.predict(posenetOutput);
    

    // Prediction 2: run input through teachable machine classification model
    const pushupsPrediction = await pushupsModel.predict(posenetOutput);
    

    // Prediction 2: run input through teachable machine classification model
    const pullupsPrediction = await pullupsModel.predict(posenetOutput);
    

    for (let i = 0; i < squatsMaxPredictions; i++) {
        const classPrediction = "squats:"+squatsPrediction[i].className + ": " + squatsPrediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    //counting squats
    // console.log(squatsPrediction[1].className);
    if (squatsPrediction[1].probability > minEnterConfidence) {
        enterSquat = true;
        squatStatus = "";
    }
    if (enterSquat == true && squatsPrediction[1].probability <= minEnterConfidence) {
        enterSquat = false;
        squatComplete = false;
        squatStatus = "incomplete squat";
    } else if (enterSquat == true && squatsPrediction[1].probability >= minCompleteConfidence && squatComplete == false) { 
        if(squatMode) squatsCount += 1;
        squatComplete = true;
        squatStatus = "complete squat";
    }

    //counting pushups
    // console.log(pushupsPrediction[1].className);
    for (let i = 0; i < pushupsMaxPredictions; i++) {
        const classPrediction = "pushups:"+pushupsPrediction[i].className + ": " + pushupsPrediction[i].probability.toFixed(2);
        labelContainer.childNodes[i + squatsMaxPredictions].innerHTML = classPrediction;
    }
    if (pushupsPrediction[1].probability > minEnterConfidence) {
        enterPushup = true;
        squatStatus = "";
    }
    if (enterPushup == true && pushupsPrediction[1].probability <= minEnterConfidence) {
        enterPushup = false;
        pushupComplete = false;
        pushupStatus = "incomplete pushup";
    } else if (enterPushup == true && pushupsPrediction[1].probability >= minCompleteConfidence && pushupComplete == false) { 
        if(pushupMode) pushupsCount += 1;
        pushupComplete = true;
        pushupStatus = "complete pushup";
    }


    //counting pullups
    // console.log(pullupsPrediction[1].className);
    for (let i = 0; i < pullupsMaxPredictions; i++) {
        const classPrediction ="pullups:"+ pullupsPrediction[i].className + ": " + pullupsPrediction[i].probability.toFixed(2);
        labelContainer.childNodes[i + pushupsMaxPredictions +  squatsMaxPredictions].innerHTML = classPrediction;
    }
    if (pullupsPrediction[1].probability > minEnterConfidence) {
        enterPullup = true;
        pullupStatus = "";
    }
    if (enterPullup == true && pullupsPrediction[1].probability <= minEnterConfidence) {
        enterPullup = false;
        pullupComplete = false;
        pullupStatus = "incomplete pullup";
    } else if (enterPullup == true && pullupsPrediction[1].probability >= minCompleteConfidence && pullupComplete == false) { 
        if(pullupMode) pullupsCount += 1;
        pullupComplete = true;
        pullupStatus = "complete pullup";
    }
    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose && devMode==true) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}
function dark_mode() {
    $(".container").toggleClass("dark");
}

//function to toggle dark mode
// Code By Webdevtrick ( https://webdevtrick.com )
let buttonenabled = true, scroll = 0;
$(document).on("click", ".darkmode", function(){
	if(!buttonenabled) return;
    buttonenabled = false;
    let clipContents=$(".clip")[0].outerHTML;
	$(".clip").html($("body >.container")[0].outerHTML); 
	$(".clip .container").toggleClass("dark").scrollTop(scroll); 
	$(".clip").addClass("anim"); 
	setTimeout(function(){
		$("body >.container").replaceWith($(".clip").html()) 
		//scrollbind($("body >.container")); 
		//$("body >.container").scrollTop(scroll);
		$(".clip").html(clipContents).removeClass("anim"); 
		buttonenabled = true;
	}, 1000); 
});
function bunny_animate() {
    bunny = $("#bunny-imag");
    bunny.addClass('animate');
    setTimeout(function(){
        bunny.removeClass('animate');
    },10000);
}
const scrollbind = el => el.bind("scroll", function(){
	scroll = $(this).scrollTop();
	if($(".container").length > 1)
		$(".container").scrollTop(scroll); 
		
});
scrollbind($(".container"));


function dev_mode_toggle() {
    devMode=!devMode;
    modelPredictionData=document.getElementById("label-container");
    modelPredictionData.classList.toggle("disabled");
}