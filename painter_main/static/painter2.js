var paintTool;
var paintTools = Object.create(null);
var controls = Object.create(null);
var colorInput;
var data_for_submit = {};
var count_for_submit = 0;

paintTools.brush = function(e, ctx) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var img = ctx.getImageData(0,0,ctx.canvas.width, ctx.canvas.height);
    var p = relativePosition(e, ctx.canvas);

    data_for_submit[count_for_submit] = p;
    count_for_submit += 1;

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    setDragListeners(ctx, img, function(q){
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
    });
}

controls.painter = function(ctx) {
    var DEFAULT_TOOL = 0;
    var select = elt('select',null);
    var label = elt('label',null,'그리기 도구 : ', select);
    for(var name in paintTools) {
        select.appendChild(elt('option',{value : name}, name));
    }
    select.selectedIndex = DEFAULT_TOOL;
    paintTool = select.children[DEFAULT_TOOL].value;
    select.addEventListener('change',function(e){
        paintTool = this.children[this.selectedIndex].value;
    },false);
    return label;
}

controls.color = function(ctx) {
    var input = colorInput = elt('input',{type:'color'});
    var label = elt('label',null,' 색 : ', input);
    input.addEventListener('change', function(e) {
        ctx.strokeStyle = this.value;
        ctx.fillStyle = this.value;
    },false);
    return label;
};

controls.brushsize = function(ctx) {
    var size = [1,2,3,4,5,6,7,8,9,10,12,14,16,18,20,24,28];
    var select = elt('select',null);
    for(var i=0;i<size.length;i++) {
        select.appendChild(elt('option',{value:size[i].toString()},size[i].toString()));
    }
    select.selectedIndex = 2;
    ctx.lineWidth = size[select.selectedIndex];
    var label = elt('label',null,' 선의 너비 : ',select);
    select.addEventListener('change',function(e){
        ctx.lineWidth = this.value;
    },false);
    return label;
};

controls.recover = function(ctx) {
    var button = elt('button',{style: "width : 30px; height : 30px"});
    var label = elt('label',null,' 되돌리기 : ',button);
    button.addEventListener('click',function(e){
        socket.emit('recover',{});
    },false);
    return label;
}

controls.reset = function(ctx) {
    var button = elt('button',{style: "width : 30px; height : 30px"});
    var label = elt('label',null,' 초기화 : ',button);
    button.addEventListener('click',function(e){
        socket.emit('reset',{});
    },false);
    return label;
}

function relativePosition(event, element){
    var rect = element.getBoundingClientRect();
    return {x: Math.floor(event.clientX - rect.left),
            y: Math.floor(event.clientY - rect.top)};
}

function setDragListeners(ctx, img, draw){
    var mousemoveEventListener = function(e) {
        if (e.pointerType == 'pen') {
            h1 = document.getElementById('h1h1');
            h1.innerHTML = e.pressure;

            if (e.pressure == 0) {
                // 이벤트 취소
                ctx.putImageData(img,0,0);
                draw(relativePosition(e, ctx.canvas));
                data_for_submit.length = count_for_submit;
                data_for_submit.brush_color = ctx.strokeStyle;
                data_for_submit.brush_size = ctx.lineWidth;
                //socket을 통해 전달
                socket.emit('data submit',data_for_submit);
                canvas.removeEventListener('pointermove',mousemoveEventListener,false); // 이렇게 지정해도 되나? mousemoveEvent 안에서 이걸 다시 이름으로 참조 가능??

                data_for_submit = {};
                count_for_submit = 0;
            }
            else {
                ctx.putImageData(img, 0, 0);
                coordinates = relativePosition(e, ctx.canvas);
                data_for_submit[count_for_submit] = coordinates;
                count_for_submit += 1;
                draw(coordinates);
            }
        }
        e.preventDefault(); // 이벤트 기본 동작 취소
        e.stopPropagation();
//        e.preventDefault();
    };

//    document.addEventListener('mousemove',mousemoveEventListener, false);
    canvas.addEventListener('pointermove',mousemoveEventListener, false);
//    document.addEventListener('mouseup', function(e){
//        ctx.putImageData(img,0,0);
//        draw(relativePosition(e, ctx.canvas));
//        data_for_submit.length = count_for_submit;
//        data_for_submit.brush_color = ctx.strokeStyle;
//        data_for_submit.brush_size = ctx.lineWidth;
//        //socket을 통해 전달
//        socket.emit('data submit',data_for_submit);
//        document.removeEventListener('mousemove',mousemoveEventListener,false);
//        document.removeEventListener('mouseup',arguments.callee, false);
//        data_for_submit = {};
//        count_for_submit = 0;
//    }, false);

//    document.addEventListener('pointerup', function(e){
//        ctx.putImageData(img,0,0);
//        draw(relativePosition(e, ctx.canvas));
//        data_for_submit.length = count_for_submit;
//        data_for_submit.brush_color = ctx.strokeStyle;
//        data_for_submit.brush_size = ctx.lineWidth;
//        //socket을 통해 전달
//        socket.emit('data submit',data_for_submit);
//        document.removeEventListener('pointermove',mousemoveEventListener,false);
//        document.removeEventListener('pointerup',arguments.callee, false);
//        data_for_submit = {};
//        count_for_submit = 0;
//    }, false);
}

var canvas = elt('canvas', {width : 2000, height : 2000});
var ctx = canvas.getContext('2d');
canvas.style.border = '1px solid gray';
canvas.style.cursor = 'pointer';

//canvas.addEventListener('mousedown', function(e){
canvas.addEventListener('pointerdown', function(e){
    if (e.pointerType == 'pen') {
        h1 = document.getElementById('h1h1');
        h1.innerHTML = e.pressure;

        var event = document.createEvent('HTMLEvents');
        event.initEvent('change',false, true);
        colorInput.dispatchEvent(event);
        paintTools[paintTool](e,ctx);
    }
//    var event = document.createEvent('HTMLEvents');
//    event.initEvent('change',false, true);
//    colorInput.dispatchEvent(event);
//    paintTools[paintTool](e,ctx);
    e.preventDefault(); // 이벤트 기본 동작 취소
    e.stopPropagation(); // 이벤트 전파 취소
//    e.preventDefault(); // 이벤트 기본 동작 취소
}, false);

var toolbar = elt('div',null);
for(var name in controls) {
    toolbar.appendChild(controls[name](ctx));
}
toolbar.style.fontSize = 'small';
toolbar.style.marginBottom = '3px';
document.body.appendChild(elt('div',null,toolbar,canvas));

socket.on('data from server',function(data){
    var original_color = ctx.strokeStyle;
    var original_size = ctx.lineWidth;

    ctx.strokeStyle = data.brush_color;
    ctx.lineWidth = data.brush_size;

    ctx.beginPath();
    ctx.moveTo(data[0].x, data[0].y);
    for(var i=1; i<data.length; i++){
        ctx.lineTo(data[i].x, data[i].y)
    }
    ctx.stroke();

    ctx.strokeStyle = original_color;
    ctx.lineWidth = original_size;
});

socket.on('recover command',function(data){
    if(data.no_data) { // 되돌릴게 없을 때에는 아무것도 하지 않음

    }
    else {
        var original_color = ctx.strokeStyle;
        var original_size = ctx.lineWidth;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = data.brush_size;

        for(var j=0; j<10; j++){ // 1번만 하면 경계선은 안지워져서 그냥 10번 덧붙이게끔 했음
            ctx.beginPath();
            ctx.moveTo(data[0].x, data[0].y);
            for(var i=1; i<data.length; i++){
                ctx.lineTo(data[i].x, data[i].y)
            }
            ctx.stroke();
        }

        ctx.strokeStyle = original_color;
        ctx.lineWidth = original_size;
    }
});

socket.on('reset command',function(data){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
});


