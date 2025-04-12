# ASCII Video Player

## Description
This project decodes a video file and converts it to raw RGB pixel data. It then converts each RGB pixel to an ASCII character based on its luminance (brightness) and colors the characters to match the original video colors. Finally, it outputs the frames at the original video's frame rate.

## Features
- Takes a video file that the user uploads
- Gets video dimensions and frame rate
- Calculates an appropriate size for the video
- Decodes the video
- Reads raw RGB frames
- Converts each frame to colored ASCII art
- Displays frames at the correct timing

## Instructions
1. Open the `index.html` file in a web browser.
2. Click the "Upload Video" button to select a video file.
3. The video will be processed and displayed as ASCII art in the browser.

## Notes
- The title element with the text "ASCII Video Player" has been added.
- A file input element with an id of "video-upload" has been added.
- A button element with an id of "upload-button" and text "Upload Video" has been added.
