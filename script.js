document.getElementById('upload-button').addEventListener('click', function() {
    document.getElementById('video-upload').click();
});

document.getElementById('video-upload').addEventListener('change', handleVideoUpload);

function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            decodeVideo(arrayBuffer);
        };
        reader.readAsArrayBuffer(file);
    }
}

function decodeVideo(arrayBuffer) {
    // Placeholder for video decoding logic
    // This function should decode the video and extract raw RGB frames
    // For now, we'll simulate with a dummy frame
    const dummyFrame = new Uint8Array(640 * 480 * 3); // 640x480 RGB frame
    for (let i = 0; i < dummyFrame.length; i++) {
        dummyFrame[i] = Math.random() * 255;
    }
    const frames = [dummyFrame];
    convertFramesToASCII(frames);
}

function convertFramesToASCII(frames) {
    const asciiFrames = frames.map(frame => {
        let asciiFrame = '';
        for (let i = 0; i < frame.length; i += 3) {
            const r = frame[i];
            const g = frame[i + 1];
            const b = frame[i + 2];
            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const asciiChar = getASCIIChar(luminance);
            asciiFrame += asciiChar;
        }
        return asciiFrame;
    });
    displayASCIIFrames(asciiFrames);
}

function getASCIIChar(luminance) {
    const asciiChars = '@%#*+=-:. ';
    const index = Math.floor((luminance / 255) * (asciiChars.length - 1));
    return asciiChars[index];
}

function displayASCIIFrames(asciiFrames) {
    const videoContainer = document.getElementById('video-container');
    let frameIndex = 0;
    const frameRate = 30; // 30 frames per second
    setInterval(() => {
        videoContainer.textContent = asciiFrames[frameIndex];
        frameIndex = (frameIndex + 1) % asciiFrames.length;
    }, 1000 / frameRate);
}
