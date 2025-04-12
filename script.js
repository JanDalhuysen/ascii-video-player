document.getElementById('upload-button').addEventListener('click', function() {
    document.getElementById('video-upload').click();
});

document.getElementById('image-button').addEventListener('click', function() {
    document.getElementById('image-upload').click();
});

document.getElementById('video-upload').addEventListener('change', handleVideoUpload);
document.getElementById('image-upload').addEventListener('change', handleImageUpload);

function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Show processing message
        const processingMessage = document.getElementById('processing-message');
        processingMessage.textContent = 'Processing video...';
        processingMessage.style.display = 'block';
        
        // Clear previous content and any running animation
        const videoContainer = document.getElementById('video-container');
        if (videoContainer.frameInterval) {
            clearInterval(videoContainer.frameInterval);
            videoContainer.frameInterval = null;
        }
        videoContainer.innerHTML = '';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            decodeVideo(arrayBuffer);
        };
        reader.readAsArrayBuffer(file);
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Show processing message
        const processingMessage = document.getElementById('processing-message');
        processingMessage.textContent = 'Processing image...';
        processingMessage.style.display = 'block';
        
        // Clear previous content and any running animation
        const videoContainer = document.getElementById('video-container');
        if (videoContainer.frameInterval) {
            clearInterval(videoContainer.frameInterval);
            videoContainer.frameInterval = null;
        }
        videoContainer.innerHTML = '';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                processImage(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function decodeVideo(arrayBuffer) {
    // Create a video element to decode the video
    const videoBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(videoBlob);
    const video = document.createElement('video');
    
    video.src = videoUrl;
    video.muted = true;
    video.crossOrigin = 'anonymous';
    
    // Array to store frames and video metadata
    const frames = [];
    let videoWidth, videoHeight;
    
    // Start capturing frames once video can play
    video.oncanplay = function() {
        // Get actual video dimensions
        videoWidth = video.videoWidth;
        videoHeight = video.videoHeight;
        
        // If dimensions are invalid, use fallback values
        if (!videoWidth || !videoHeight) {
            videoWidth = 640;
            videoHeight = 480;
        }
        
        // Create a canvas to extract frames with correct dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        
        // Update the video container size to match video dimensions
        updateVideoContainerSize(videoWidth, videoHeight);
        
        video.play();
        
        // Capture multiple frames
        const totalFrames = 60; // For example, capture 60 frames
        let framesCaptured = 0;
        
        const captureFrame = function() {
            if (framesCaptured < totalFrames) {
                // Draw current video frame to canvas
                ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
                
                // Get image data from canvas
                const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);
                const rgbFrame = new Uint8Array(videoWidth * videoHeight * 3);
                
                // Convert RGBA to RGB
                for (let i = 0, j = 0; i < imageData.data.length; i += 4, j += 3) {
                    rgbFrame[j] = imageData.data[i];       // R
                    rgbFrame[j + 1] = imageData.data[i + 1]; // G
                    rgbFrame[j + 2] = imageData.data[i + 2]; // B
                }
                
                frames.push(rgbFrame);
                framesCaptured++;
                
                // If we still have frames to capture, request next
                requestAnimationFrame(captureFrame);
            } else {
                // Done capturing frames, convert to ASCII
                video.pause();
                URL.revokeObjectURL(videoUrl);
                convertFramesToASCII(frames, videoWidth, videoHeight);
            }
        };
        
        // Start the frame capture process
        captureFrame();
    };
    
    // Fallback in case video can't be played
    video.onerror = function() {
        console.error('Error playing video');
        // Use fallback dimensions
        videoWidth = 640;
        videoHeight = 480;
        
        // Update container size
        updateVideoContainerSize(videoWidth, videoHeight);
        
        // Create a dummy colorful frame as fallback
        const dummyFrame = new Uint8Array(videoWidth * videoHeight * 3);
        
        // Create a more interesting pattern than random noise
        for (let y = 0; y < videoHeight; y++) {
            for (let x = 0; x < videoWidth; x++) {
                const i = (y * videoWidth + x) * 3;
                dummyFrame[i] = (x * 255 / videoWidth);     // R increases from left to right
                dummyFrame[i + 1] = (y * 255 / videoHeight); // G increases from top to bottom
                dummyFrame[i + 2] = 128;                    // B is constant
            }
        }
        
        convertFramesToASCII([dummyFrame], videoWidth, videoHeight);
    };
}

function updateVideoContainerSize(width, height) {
    const videoContainer = document.getElementById('video-container');
    
    // Limit size for very large videos
    const maxWidth = Math.min(window.innerWidth * 0.9, 1280);
    const maxHeight = Math.min(window.innerHeight * 0.7, 720);
    
    // Calculate aspect ratio
    const aspectRatio = width / height;
    
    // Determine new dimensions that fit within max bounds while preserving aspect ratio
    let newWidth = width;
    let newHeight = height;
    
    if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = newWidth / aspectRatio;
    }
    
    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
    }
    
    // Update container size
    videoContainer.style.width = `${newWidth}px`;
    videoContainer.style.height = `${newHeight}px`;
    
    // Store dimensions for use in other functions
    videoContainer.dataset.width = width;
    videoContainer.dataset.height = height;
}

function processImage(img) {
    // Get image dimensions
    const imgWidth = img.width;
    const imgHeight = img.height;
    
    // Update container size
    updateVideoContainerSize(imgWidth, imgHeight);
    
    // Create a canvas to extract pixel data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    
    // Draw image to canvas
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
    const rgbData = new Uint8Array(imgWidth * imgHeight * 3);
    
    // Convert RGBA to RGB
    for (let i = 0, j = 0; i < imageData.data.length; i += 4, j += 3) {
        rgbData[j] = imageData.data[i];       // R
        rgbData[j + 1] = imageData.data[i + 1]; // G
        rgbData[j + 2] = imageData.data[i + 2]; // B
    }
    
    // Convert to ASCII
    convertFramesToASCII([rgbData], imgWidth, imgHeight);
}

function convertFramesToASCII(frames, width, height) {
    // Determine optimal pixel sampling rate based on video size
    // For larger videos, we sample more pixels to keep the ASCII art at a reasonable size
    let pixelsPerCharX, pixelsPerCharY;
    
    if (width > 1280 || height > 720) {
        pixelsPerCharX = 8; // Large videos - horizontal sampling
        pixelsPerCharY = 16; // Large videos - vertical sampling (2:1 ratio to compensate for character aspect ratio)
    } else if (width > 640 || height > 480) {
        pixelsPerCharX = 6; // Medium videos - horizontal sampling
        pixelsPerCharY = 12; // Medium videos - vertical sampling (2:1 ratio)
    } else {
        pixelsPerCharX = 4; // Small videos - horizontal sampling
        pixelsPerCharY = 8; // Small videos - vertical sampling (2:1 ratio)
    }
    
    // Calculate the number of ASCII characters in width and height
    const charWidth = Math.floor(width / pixelsPerCharX);
    const charHeight = Math.floor(height / pixelsPerCharY);
    
    const asciiFrames = frames.map(frame => {
        let asciiFrame = [];
        for (let y = 0; y < charHeight; y++) {
            let row = [];
            for (let x = 0; x < charWidth; x++) {
                // Calculate the pixel index in the source frame with proper aspect ratio correction
                const pixelX = Math.floor(x * pixelsPerCharX);
                const pixelY = Math.floor(y * pixelsPerCharY);
                const pixelIndex = (pixelY * width + pixelX) * 3;
                
                if (pixelIndex + 2 < frame.length) {
                    // For better color representation, we'll average the colors in the block
                    let totalR = 0, totalG = 0, totalB = 0, sampleCount = 0;
                    
                    // Sample multiple pixels in the block for better color averaging
                    for (let dy = 0; dy < pixelsPerCharY && (pixelY + dy) < height; dy += 2) {
                        for (let dx = 0; dx < pixelsPerCharX && (pixelX + dx) < width; dx += 2) {
                            const idx = ((pixelY + dy) * width + (pixelX + dx)) * 3;
                            if (idx + 2 < frame.length) {
                                totalR += frame[idx];
                                totalG += frame[idx + 1];
                                totalB += frame[idx + 2];
                                sampleCount++;
                            }
                        }
                    }
                    
                    // Calculate average colors
                    const r = Math.floor(totalR / sampleCount);
                    const g = Math.floor(totalG / sampleCount);
                    const b = Math.floor(totalB / sampleCount);
                    
                    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    const asciiChar = getASCIIChar(luminance);
                    row.push({char: asciiChar, color: `rgb(${r}, ${g}, ${b})`});
                }
            }
            asciiFrame.push(row);
        }
        return asciiFrame;
    });
    
    // Pass video dimensions to display function
    displayASCIIFrames(asciiFrames, width, height, { pixelsPerCharX, pixelsPerCharY });
}

function getASCIIChar(luminance) {
    // Use a more calibrated character set for better gradation
    // These characters are ordered from darkest (most dense) to lightest (least dense)
    // and selected based on perceived visual weight when rendered in a monospace font
    const asciiChars = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
    
    // Map luminance to the array index, clamping to the valid range
    // Lower luminance (darker) maps to earlier indices (denser characters)
    // Higher luminance (brighter) maps to later indices (lighter characters)
    const index = Math.min(
        asciiChars.length - 1,
        Math.max(0, Math.floor((luminance / 255) * (asciiChars.length - 1)))
    );
    
    return asciiChars[index];
}

function displayASCIIFrames(asciiFrames, videoWidth, videoHeight, pixelSampling) {
    // Hide processing message
    document.getElementById('processing-message').style.display = 'none';
    
    const videoContainer = document.getElementById('video-container');
    videoContainer.innerHTML = ''; // Clear previous content
    
    // Calculate optimal font size based on container dimensions
    const containerWidth = parseInt(videoContainer.style.width);
    const containerHeight = parseInt(videoContainer.style.height);
    
    // Number of ASCII characters in width and height
    const charColumns = Math.floor(videoWidth / pixelSampling.pixelsPerCharX);
    const charRows = Math.floor(videoHeight / pixelSampling.pixelsPerCharY);
    
    // Calculate font size that will fit the container
    const fontWidth = containerWidth / charColumns;
    const fontHeight = containerHeight / charRows;
    
    // Base font size on height to ensure consistent vertical spacing
    const fontSize = fontHeight * 0.95; // Slight adjustment to avoid overflow
    
    let frameIndex = 0;
    const frameRate = 30; // 30 frames per second
    
    // Create a pre element to hold the ASCII art
    const preElement = document.createElement('pre');
    preElement.className = 'ascii-frame';
    preElement.style.fontSize = `${fontSize}px`;
    preElement.style.lineHeight = `${fontSize}px`;
    videoContainer.appendChild(preElement);
    
    // Display frame count info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'video-info';
    infoDiv.textContent = `${asciiFrames.length} frame(s) loaded`;
    infoDiv.style.position = 'absolute';
    infoDiv.style.top = '10px';
    infoDiv.style.right = '10px';
    infoDiv.style.color = '#fff';
    infoDiv.style.background = 'rgba(0,0,0,0.5)';
    infoDiv.style.padding = '5px';
    infoDiv.style.borderRadius = '3px';
    infoDiv.style.fontSize = '12px';
    infoDiv.style.zIndex = '10';
    videoContainer.style.position = 'relative';
    videoContainer.appendChild(infoDiv);
    
    // Display video dimensions info
    const dimensionsDiv = document.createElement('div');
    dimensionsDiv.className = 'video-dimensions';
    dimensionsDiv.textContent = `${videoWidth}x${videoHeight}`;
    dimensionsDiv.style.position = 'absolute';
    dimensionsDiv.style.bottom = '10px';
    dimensionsDiv.style.left = '10px';
    dimensionsDiv.style.color = '#fff';
    dimensionsDiv.style.background = 'rgba(0,0,0,0.5)';
    dimensionsDiv.style.padding = '5px';
    dimensionsDiv.style.borderRadius = '3px';
    dimensionsDiv.style.fontSize = '12px';
    dimensionsDiv.style.zIndex = '10';
    videoContainer.appendChild(dimensionsDiv);
    
    // Calculate character aspect ratio (width:height)
    // A typical monospace character is about 0.6 times as wide as it is tall
    const charAspectRatio = 0.6;
    
    // Calculate the width needed for each character to maintain proper aspect ratio
    const spanWidth = fontSize * charAspectRatio;
    
    // Add custom CSS for the ASCII frame
    const cssStyle = document.createElement('style');
    cssStyle.textContent = `
        .ascii-frame span {
            display: inline-block;
            width: ${spanWidth}px;
        }
        .ascii-frame div {
            height: ${fontSize}px;
            line-height: ${fontSize}px;
        }
    `;
    document.head.appendChild(cssStyle);
    
    // Animation loop
    const renderFrame = (frame) => {
        preElement.innerHTML = ''; // Clear previous frame
        
        // Build the colored ASCII frame
        frame.forEach(row => {
            const rowDiv = document.createElement('div');
            row.forEach(pixel => {
                const span = document.createElement('span');
                span.textContent = pixel.char;
                span.style.color = pixel.color;
                rowDiv.appendChild(span);
            });
            preElement.appendChild(rowDiv);
        });
    };
    
    // Render the first frame immediately
    if (asciiFrames.length > 0) {
        renderFrame(asciiFrames[0]);
    }
    
    // If we only have one frame (e.g., for images), no need for animation
    let interval = null;
    if (asciiFrames.length > 1) {
        interval = setInterval(() => {
            if (frameIndex < asciiFrames.length) {
                renderFrame(asciiFrames[frameIndex]);
                
                frameIndex = (frameIndex + 1) % asciiFrames.length;
                
                // Update current frame info
                infoDiv.textContent = `Frame ${frameIndex}/${asciiFrames.length}`;
            }
        }, 1000 / frameRate);
    } else {
        // For static image, just update the info text appropriately
        infoDiv.textContent = 'Static Image';
    }
    
    // Add to videoContainer so we can clear it later (if it exists)
    videoContainer.frameInterval = interval;
}
