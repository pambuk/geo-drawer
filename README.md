# Geo Polygon Drawer

A simple web application that allows users to draw polygons based on geographic coordinates and check if a point is inside the polygon.

## Features

- Draw polygons by entering coordinate points (latitude, longitude)
- Visual representation of the polygon on a canvas
- Check if a specified point is inside or outside the polygon
- Responsive design

## Usage

1. Open `index.html` in a web browser
2. Enter polygon coordinates in the textarea (one coordinate pair per line in format `latitude,longitude`)
3. Click "Draw Polygon" to visualize the shape
4. Enter a test point in the format `latitude,longitude`
5. Click "Check Point" to determine if the point is inside or outside the polygon

## Example Coordinates

Try these sample coordinates to draw a polygon:

```
41.12,-71.34
41.15,-71.30
41.18,-71.35
41.15,-71.40
```

Then check if a point is inside the polygon:
```
41.15,-71.35
```

## How It Works

The application uses the ray-casting algorithm to determine if a point is inside a polygon. This algorithm works by counting the number of times a ray starting from the point and going in any fixed direction intersects with the polygon's edges. If the number of intersections is odd, the point is inside; if it's even, the point is outside.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- HTML5 Canvas for drawing

## License

This project is open source and available under the MIT License.