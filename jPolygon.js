var complete = false;
// Canvas nesnesi ve 2D context
const canvas = document.getElementById('yourCanvasID');
const ctx = canvas.getContext('2d');
let perimeter = [];
let currentImage = null;

// İki doğrunun kesişip kesişmediğini kontrol eder
function line_intersects(p0, p1, p2, p3) {
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1['x'] - p0['x'];
    s1_y = p1['y'] - p0['y'];
    s2_x = p3['x'] - p2['x'];
    s2_y = p3['y'] - p2['y'];

    var s, t;
    s = (-s1_y * (p0['x'] - p2['x']) + s1_x * (p0['y'] - p2['y'])) / (-s2_x * s1_y + s1_x * s2_y);
    t = (s2_x * (p0['y'] - p2['y']) - s2_y * (p0['x'] - p2['x'])) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        return true;
    }
    return false;
}

// Canvas üzerine nokta çizimi
function point(x, y) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.fillRect(x - 2, y - 2, 4, 4);
    ctx.moveTo(x, y);
}

// Geri alma işlemi
function undo() {
    if (perimeter.length > 0) {
        perimeter.pop();
        redrawCanvas();
    } else {
        console.log("Geri alacak bir nokta yok!");
    }
}

// Canvas'ı temizleme
function clear_canvas() {
    perimeter = [];
    complete = false;
    redrawCanvas();
    document.getElementById('coordinates').value = '';
}

// Canvas'ı ve resmi yeniden çizme
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (currentImage) {
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    }
    if (perimeter.length > 0) {
        ctx.beginPath();
        ctx.moveTo(perimeter[0].x, perimeter[0].y);
        for (let i = 1; i < perimeter.length; i++) {
            ctx.lineTo(perimeter[i].x, perimeter[i].y);
        }
        ctx.stroke();
    }
}

// Poligon çizimi
function draw(end) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.lineCap = "square";
    ctx.beginPath();

    for (var i = 0; i < perimeter.length; i++) {
        if (i == 0) {
            ctx.moveTo(perimeter[i]['x'], perimeter[i]['y']);
            end || point(perimeter[i]['x'], perimeter[i]['y']);
        } else {
            ctx.lineTo(perimeter[i]['x'], perimeter[i]['y']);
            end || point(perimeter[i]['x'], perimeter[i]['y']);
        }
    }
    if (end) {
        ctx.lineTo(perimeter[0]['x'], perimeter[0]['y']);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fill();
        ctx.strokeStyle = 'blue';
        complete = true;
    }
    ctx.stroke();

    if (perimeter.length == 0) {
        document.getElementById('coordinates').value = '';
    } else {
        document.getElementById('coordinates').value = JSON.stringify(perimeter);
    }
}

// Çizilen noktaların kesişip kesişmediğini kontrol eder
function check_intersect(x, y) {
    if (perimeter.length < 4) {
        return false;
    }
    var p0 = new Array();
    var p1 = new Array();
    var p2 = new Array();
    var p3 = new Array();

    p2['x'] = perimeter[perimeter.length - 1]['x'];
    p2['y'] = perimeter[perimeter.length - 1]['y'];
    p3['x'] = x;
    p3['y'] = y;

    for (var i = 0; i < perimeter.length - 1; i++) {
        p0['x'] = perimeter[i]['x'];
        p0['y'] = perimeter[i]['y'];
        p1['x'] = perimeter[i + 1]['x'];
        p1['y'] = perimeter[i + 1]['y'];
        if (p1['x'] == p2['x'] && p1['y'] == p2['y']) { continue; }
        if (p0['x'] == p3['x'] && p0['y'] == p3['y']) { continue; }
        if (line_intersects(p0, p1, p2, p3) == true) {
            return true;
        }
    }
    return false;
}

// Canvas üzerinde tıklama ile nokta ekleme
function point_it(event) {
    if (complete) {
        alert('Polygon already created');
        return false;
    }
    var rect, x, y;

    if (event.which === 3 || event.button === 2 || event === true) {
        if (perimeter.length == 2) {
            alert('You need at least three points for a polygon');
            return false;
        }
        x = perimeter[0]['x'];
        y = perimeter[0]['y'];
        if (check_intersect(x, y)) {
            alert('The line you are drawing intersects another line');
            return false;
        }
        draw(true);
        alert('Polygon successfully closed. You can now clear or start a new drawing.');
        event.preventDefault();
        return false;
    } else {
        rect = canvas.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        if (perimeter.length > 0 && x == perimeter[perimeter.length - 1]['x'] && y == perimeter[perimeter.length - 1]['y']) {
            return false;
        }
        if (check_intersect(x, y)) {
            alert('The line you are drawing intersects another line');
            return false;
        }
        perimeter.push({ 'x': x, 'y': y });
        draw(false);
        return false;
    }
}

// Görseli yükler ve orijinal boyutta canvas'a çizer
function loadImage(input) {
    const file = input.files[0];
    if (file) {
        const img = new Image();
        img.onload = function () {
            currentImage = img;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = URL.createObjectURL(file);
    }
}
