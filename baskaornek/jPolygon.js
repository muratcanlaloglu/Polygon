
var complete = false;
// Canvas nesnesi ve 2D context
const canvas = document.getElementById('yourCanvasID'); // HTML'deki Canvas ID'sini doğru kullanın
const ctx = canvas.getContext('2d'); // 2D çizim bağlamını alın
let perimeter = []; // Çizilen noktaların koordinatlarını saklar
let currentImage = null; // Global olarak tanımlayın



/* line_intersects fonksiyonu iki doğrunun kesişip kesişmediğini kontrol ediyor. Kesişim varsa true yoksa false dönüyor.  */
function line_intersects(p0, p1, p2, p3) {
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1['x'] - p0['x'];
    s1_y = p1['y'] - p0['y'];
    s2_x = p3['x'] - p2['x'];
    s2_y = p3['y'] - p2['y'];

    var s, t;
    s = (-s1_y * (p0['x'] - p2['x']) + s1_x * (p0['y'] - p2['y'])) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0['y'] - p2['y']) - s2_y * (p0['x'] - p2['x'])) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return true;
    }
    return false; // No collision
}

/* resim üzerinde tıklandığında çıkan noktalar 4 e 4 kare oluşturuyor.*/
function point(x, y){
    ctx.fillStyle="white"; // noktaların rengi
    ctx.strokeStyle = "white"; // çizgilerin rengi
    ctx.fillRect(x-2,y-2,4,4);
    ctx.moveTo(x,y);
}

function undo() {
    if (perimeter.length > 0) {
        perimeter.pop(); // Son noktayı kaldır
        redrawCanvas();
    } else {
        console.log("Geri alacak bir nokta yok!");
    }
}


function clear_canvas() {
    perimeter = []; // Tüm noktaları temizle
    complete = false;
    redrawCanvas();
    document.getElementById('coordinates').value = ''; // Koordinatları sıfırla
}


function redrawCanvas() {
    // Canvas'ı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Yüklenen resmi yeniden çiz
    if (currentImage) {
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Perimeter'daki noktaları yeniden çiz
    if (perimeter.length > 0) {
        ctx.beginPath();
        ctx.moveTo(perimeter[0].x, perimeter[0].y);
        for (let i = 1; i < perimeter.length; i++) {
            ctx.lineTo(perimeter[i].x, perimeter[i].y);
        }
        ctx.stroke();
    }
}



/* poligonun çizimini yapar. end == true olduğunda poligon kapanır. yani iki nokta birleştiğinde*/
function draw(end){
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.lineCap = "square";
    ctx.beginPath();

    for(var i=0; i<perimeter.length; i++){
        if(i==0){
            ctx.moveTo(perimeter[i]['x'],perimeter[i]['y']);
            end || point(perimeter[i]['x'],perimeter[i]['y']);
        } else {
            ctx.lineTo(perimeter[i]['x'],perimeter[i]['y']);
            end || point(perimeter[i]['x'],perimeter[i]['y']);
        }
    }
    if(end){
        ctx.lineTo(perimeter[0]['x'],perimeter[0]['y']);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fill();
        ctx.strokeStyle = 'blue';
        complete = true;
    }
    ctx.stroke();

    // print coordinates
    if(perimeter.length == 0){
        document.getElementById('coordinates').value = '';
    } else {
        document.getElementById('coordinates').value = JSON.stringify(perimeter);
    }
}

//yeni eklenen noktanın mevcut kenarlarla kesişip kesişmediğini kontrol eder. Kesişim varsa, yeni nokta eklenmez.
function check_intersect(x,y){
    if(perimeter.length < 4){
        return false;
    }
    var p0 = new Array();
    var p1 = new Array();
    var p2 = new Array();
    var p3 = new Array();

    p2['x'] = perimeter[perimeter.length-1]['x'];
    p2['y'] = perimeter[perimeter.length-1]['y'];
    p3['x'] = x;
    p3['y'] = y;

    for(var i=0; i<perimeter.length-1; i++){
        p0['x'] = perimeter[i]['x'];
        p0['y'] = perimeter[i]['y'];
        p1['x'] = perimeter[i+1]['x'];
        p1['y'] = perimeter[i+1]['y'];
        if(p1['x'] == p2['x'] && p1['y'] == p2['y']){ continue; }
        if(p0['x'] == p3['x'] && p0['y'] == p3['y']){ continue; }
        if(line_intersects(p0,p1,p2,p3)==true){
            return true;
        }
    }
    return false;
}

//kullanıcının mouse ile canvas üzerine tıkladığı zaman çalışır. Eğer poligon tamamlanmamışsa, yeni bir nokta ekler.
//Eğer sağ tıklama yapılırsa (ctrl veya sağ fare butonu ile), poligon kendiliğinden kapatılır.
function point_it(event) {
    if(complete){
        alert('Polygon already created');
        return false;
    }
    var rect, x, y;

    if(event.ctrlKey || event.which === 3 || event.button === 2){
        if(perimeter.length==2){
            alert('You need at least three points for a polygon');
            return false;
        }
        x = perimeter[0]['x'];
        y = perimeter[0]['y'];
        if(check_intersect(x,y)){
            alert('The line you are drowing intersect another line');
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
        if (perimeter.length>0 && x == perimeter[perimeter.length-1]['x'] && y == perimeter[perimeter.length-1]['y']){
            // same point - double click
            return false;
        }
        if(check_intersect(x,y)){
            alert('The line you are drowing intersect another line');
            return false;
        }
        perimeter.push({'x':x,'y':y});
        draw(false);
        return false;
    }
}

// loadImage fonksiyonu, kullanıcı tarafından seçilen resmi yükler ve canvas üzerine çizer.
function loadImage(input) {
    const file = input.files[0];
    if (file) {
        const img = new Image();
        img.onload = function () {
            currentImage = img; // Mevcut resim olarak ayarla
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas'ı temizle
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Yeni resmi çiz
        };
        img.src = URL.createObjectURL(file); // Resmi yükle
    }
}
