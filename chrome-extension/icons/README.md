# Extension Icons

This directory contains the extension icons in various sizes.

## Required Sizes

- `icon16.png` - 16x16px - Toolbar icon
- `icon48.png` - 48x48px - Extension management page
- `icon128.png` - 128x128px - Chrome Web Store

## Creating Icons

You can create icons using any image editor. The icons should:

1. Use the recruiting platform brand colors (purple gradient: #667eea to #764ba2)
2. Be simple and recognizable at small sizes
3. Have a transparent background
4. Follow Chrome's icon design guidelines

## Placeholder Icons

For development, you can use simple colored squares:

### Using ImageMagick (if installed):

```bash
# Create 16x16 icon
convert -size 16x16 xc:"#667eea" icon16.png

# Create 48x48 icon
convert -size 48x48 xc:"#667eea" icon48.png

# Create 128x128 icon
convert -size 128x128 xc:"#667eea" icon128.png
```

### Using Online Tools:

1. Go to https://www.favicon-generator.org/
2. Upload your logo or design
3. Download the generated icons
4. Rename them to match the required filenames

### Using Design Tools:

1. Create a 128x128px canvas in Figma, Sketch, or Photoshop
2. Design your icon with the brand colors
3. Export at 1x (128px), 0.375x (48px), and 0.125x (16px)
4. Save as PNG with transparency

## Temporary Solution

If you don't have icons yet, create simple colored squares as placeholders. The extension will still work, just with basic icons.
