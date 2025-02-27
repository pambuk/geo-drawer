document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const pointsInput = document.getElementById('pointsInput');
    const drawPolygonBtn = document.getElementById('drawPolygon');
    const checkPointInput = document.getElementById('checkPointInput');
    const checkPointBtn = document.getElementById('checkPoint');
    const resultDiv = document.getElementById('result');
    const mapDiv = document.getElementById('map');

    // Canvas setup
    const canvas = document.createElement('canvas');
    canvas.width = mapDiv.clientWidth;
    canvas.height = mapDiv.clientHeight;
    mapDiv.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // State
    let polygon = [];
    let bounds = {
        minLat: Infinity,
        maxLat: -Infinity,
        minLng: Infinity,
        maxLng: -Infinity
    };

    // Event listeners
    drawPolygonBtn.addEventListener('click', handleDrawPolygon);
    checkPointBtn.addEventListener('click', handleCheckPoint);
    window.addEventListener('resize', handleResize);

    // Initial setup
    clearCanvas();

    function handleDrawPolygon() {
        try {
            parsePolygonPoints();
            calculateBounds();
            drawMap();
            resultDiv.textContent = '';
            resultDiv.className = '';
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    function handleCheckPoint() {
        if (polygon.length < 3) {
            alert('Please draw a polygon first.');
            return;
        }

        try {
            const pointText = checkPointInput.value.trim();
            const [lat, lng] = pointText.split(',').map(coord => parseFloat(coord.trim()));
            
            if (isNaN(lat) || isNaN(lng)) {
                throw new Error('Invalid coordinates format');
            }

            const isInside = isPointInPolygon([lat, lng], polygon);
            displayResult(isInside, [lat, lng]);
            drawPoint([lat, lng], isInside);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    function parsePolygonPoints() {
        const text = pointsInput.value.trim();
        if (!text) {
            throw new Error('Please enter polygon coordinates');
        }

        const lines = text.split('\n');
        if (lines.length < 3) {
            throw new Error('A polygon requires at least 3 points');
        }

        polygon = lines.map(line => {
            const [lat, lng] = line.split(',').map(coord => parseFloat(coord.trim()));
            if (isNaN(lat) || isNaN(lng)) {
                throw new Error(`Invalid coordinates format: ${line}`);
            }
            return [lat, lng];
        });
    }

    function calculateBounds() {
        bounds = {
            minLat: Infinity,
            maxLat: -Infinity,
            minLng: Infinity,
            maxLng: -Infinity
        };

        polygon.forEach(([lat, lng]) => {
            bounds.minLat = Math.min(bounds.minLat, lat);
            bounds.maxLat = Math.max(bounds.maxLat, lat);
            bounds.minLng = Math.min(bounds.minLng, lng);
            bounds.maxLng = Math.max(bounds.maxLng, lng);
        });

        // Add padding to bounds
        const latPadding = (bounds.maxLat - bounds.minLat) * 0.1;
        const lngPadding = (bounds.maxLng - bounds.minLng) * 0.1;
        
        bounds.minLat -= latPadding;
        bounds.maxLat += latPadding;
        bounds.minLng -= lngPadding;
        bounds.maxLng += lngPadding;
    }

    function drawMap() {
        clearCanvas();
        
        if (polygon.length < 3) return;

        // Draw polygon
        ctx.beginPath();
        polygon.forEach(([lat, lng], index) => {
            const [x, y] = geoToPixel(lat, lng);
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        // Close the polygon
        const [firstLat, firstLng] = polygon[0];
        const [x, y] = geoToPixel(firstLat, firstLng);
        ctx.lineTo(x, y);
        
        // Fill and stroke
        ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw vertices
        polygon.forEach(([lat, lng]) => {
            const [x, y] = geoToPixel(lat, lng);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#2c3e50';
            ctx.fill();
        });
    }

    function drawPoint([lat, lng], isInside) {
        const [x, y] = geoToPixel(lat, lng);
        
        // Draw point
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = isInside ? '#27ae60' : '#e74c3c';
        ctx.fill();
        
        // Draw crosshair
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x + 10, y);
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x, y + 10);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function geoToPixel(lat, lng) {
        const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * canvas.width;
        const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * canvas.height;
        return [x, y];
    }

    function pixelToGeo(x, y) {
        const lng = bounds.minLng + (x / canvas.width) * (bounds.maxLng - bounds.minLng);
        const lat = bounds.maxLat - (y / canvas.height) * (bounds.maxLat - bounds.minLat);
        return [lat, lng];
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = (canvas.width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= 10; i++) {
            const y = (canvas.height / 10) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function isPointInPolygon(point, polygon) {
        // Ray casting algorithm
        const [lat, lng] = point;
        let inside = false;
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [lat1, lng1] = polygon[i];
            const [lat2, lng2] = polygon[j];
            
            const intersect = ((lat1 > lat) !== (lat2 > lat)) &&
                (lng < (lng2 - lng1) * (lat - lat1) / (lat2 - lat1) + lng1);
                
            if (intersect) inside = !inside;
        }
        
        return inside;
    }

    function displayResult(isInside, [lat, lng]) {
        resultDiv.textContent = isInside
            ? `✓ Point (${lat.toFixed(6)}, ${lng.toFixed(6)}) is INSIDE the polygon`
            : `✗ Point (${lat.toFixed(6)}, ${lng.toFixed(6)}) is OUTSIDE the polygon`;
        
        resultDiv.className = isInside ? 'inside' : 'outside';
    }

    function handleResize() {
        canvas.width = mapDiv.clientWidth;
        canvas.height = mapDiv.clientHeight;
        drawMap();
    }
});