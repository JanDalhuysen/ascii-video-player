# ASCII Media Player

## Description
This project converts videos and images to colored ASCII art. It decodes media files and converts them to raw RGB pixel data. Each RGB pixel is then converted to an ASCII character based on its luminance (brightness) and colored to match the original media. For videos, it outputs the frames at the original video's frame rate.

## Features
- Supports both video and image files
- Automatically adapts to the media dimensions
- Calculates an appropriate size for display
- Decodes videos and images to RGB data
- Converts each frame/image to colored ASCII art
- Displays videos at the correct frame rate
- Provides information about frames and dimensions

## Instructions
1. Open the `index.html` file in a web browser.
2. Choose one of the following options:
   - Click the "Upload Video" button to select a video file.
   - Click the "Upload Image" button to select an image file.
3. The media will be processed and displayed as ASCII art in the browser.

## Technical Details
- Uses HTML5 video and canvas API for media processing
- Calculates luminance using the standard formula: 0.2126*R + 0.7152*G + 0.0722*B
- Uses a carefully calibrated ASCII character set based on visual density
- Corrects for the rectangular nature of ASCII characters vs square pixels
- Employs different horizontal and vertical sampling rates to maintain proper aspect ratio
- Dynamically adjusts font size and character spacing based on media dimensions
- Maintains aspect ratio when resizing
- Averages color values in each block for more accurate color representation
- Uses CSS for styled buttons and responsive layout
