// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const squatsURL = "https://teachablemachine.withgoogle.com/models/AS-YmSPJZ/";//squats model
const pushupsURL = "https://teachablemachine.withgoogle.com/models/gmX6vfxbq/";//pushups model
let squatsModel, pushupsModel, webcam, ctx, labelContainer, maxPredictions;
let enterSquat = false, enterPushup = false, squatsCount = 0, pushupsCount = 0, squatComplete = false, pushupComplete = false
pushupStatus="", squatStatus="";
let devMode=false;


async function init() {
    //squats model url
    const squatsModelURL = squatsURL + "model.json";
    const squatsMetadataURL = squatsURL + "metadata.json";
    //pushups model url
    const pushupsModelURL = pushupsURL + "model.json";
    const pushupsMetadataURL = pushupsURL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    squatsModel = await tmPose.load(squatsModelURL, squatsMetadataURL);
    squatsMaxPredictions = squatsModel.getTotalClasses();

    pushupsModel = await tmPose.load(pushupsModelURL, pushupsMetadataURL);
    pushupsMaxPredictions = pushupsModel.getTotalClasses();

    // Convenience function to setup a webcam
    const size = 1600;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size*2, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");


    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < squatsMaxPredictions+pushupsMaxPredictions; i++) { // and class labels
        if (i == squatsMaxPredictions) labelContainer.appendChild(document.createElement("hr"));
        labelContainer.appendChild(document.createElement("div"));
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

    for (let i = 0; i < squatsMaxPredictions; i++) {
        const classPrediction = squatsPrediction[i].className + ": " + squatsPrediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
    if (squatsPrediction[1].probability > 0.5) {
        enterSquat = true;
        squatStatus = "";
    }
    if (enterSquat == true && squatsPrediction[1].probability <= 0.5) {
        enterSquat = false;
        squatComplete = false;
        squatStatus = "incomplete squat";
    } else if (enterSquat == true && squatsPrediction[1].probability >= 0.8 && squatComplete == false) { //considering .8 as fully down
        squatsCount += 1;
        squatComplete = true;
        squatStatus = "complete squat";
    }


    for (let i = 0; i < pushupsMaxPredictions; i++) {
        const classPrediction = pushupsPrediction[i].className + ": " + pushupsPrediction[i].probability.toFixed(2);
        labelContainer.childNodes[i + pushupsMaxPredictions].innerHTML = classPrediction;
    }
    if (pushupsPrediction[1].probability > 0.5) {
        enterPushup = true;
        squatStatus = "";
    }
    if (enterPushup == true && pushupsPrediction[1].probability <= 0.5) {
        enterPushup = false;
        pushupComplete = false;
        pushupStatus = "incomplete pushup";
    } else if (enterPushup == true && pushupsPrediction[1].probability >= 0.8 && pushupComplete == false) { //considering .8 as fully down
        pushupsCount += 1;
        pushupComplete = true;
        pushupStatus = "complete pushup";
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
  