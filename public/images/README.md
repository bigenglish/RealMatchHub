# Image Directory Structure

This directory contains all images used in the real estate platform.

## Directory Structure

- **properties/** - Property listing images
- **banners/** - Banner images for homepage and section headers
- **logos/** - Company and partner logos
- **icons/** - UI icons and smaller graphical elements
- **backgrounds/** - Background images for various sections

## Usage Guidelines

1. Keep image sizes reasonable (ideally under 500KB)
2. Use descriptive filenames (e.g., `modern-condo-living-room.jpg`)
3. Property images should follow naming convention: `property-[id]-[room/feature].jpg`

## How to Add Images

You can upload images directly to these folders using Replit's file upload feature:
1. Click the three dots menu next to the folder
2. Select "Upload file"
3. Choose your image file

After uploading, you can reference them in the components like:
```jsx
<img src="/images/properties/modern-home.jpg" alt="Modern Home" />
```