/**
 * a tool for manipulating the areas of an html MAP element
 * 
 * by @qubecity
 * 
 */

var imgMapTool = {};

imgMapTool.setup = function () {
  
  var canvas = document.getElementById('canvas'),
      context = canvas.getContext('2d'),
      mouse = mouseUtils.captureMouse(canvas);
  
  var codebox = document.getElementById('imgmapcode');
  var livemap = document.getElementById('imgmap');
  codebox.innerText = livemap.innerHTML;
  
  var areas = livemap.getElementsByTagName('area'),
      selectedA = areas.length,
      pointA = [],
      lockedPoint = 2,
      editMode = 0; // 0 = select, 1 = edit, 2 = new

  var newbutton = document.getElementById('new-button'), 
      selectbutton = document.getElementById('select-button'),
      savebutton = document.getElementById('save-button'),
      removebutton = document.getElementById('remove-button'),
      hrefbox = document.getElementById('href-box'),
      altbox = document.getElementById('alt-box'),
      areatable = document.getElementById('areatable');
  
  newbutton.addEventListener('click', function (e){
    editMode = 2;
    selectedA = areas.length;
    hrefbox.value = "";
    altbox.value = "";
    areatable.style.display = 'table';
    pointA = [{x: canvas.width*.25, y: canvas.height*.25},{x: canvas.width*.75, y: canvas.height*.75}];
    drawAreas();
  }, false);
  
  selectbutton.addEventListener('click', function (e){
    editMode = 0;
    selectedA = areas.length;
    areatable.style.display = 'none';
    pointA = [];
    drawAreas();
  }, false);
  
  savebutton.addEventListener('click', function (e){
    if (editMode) {
      var nc = [];
      if (editMode == 2) {
        areas[selectedA] = document.createElement('area');
        areas[selectedA].shape = 'rect';
        livemap.appendChild(areas[selectedA]);
      }
      areas[selectedA].href = (hrefbox.value == "") ? "javascript:void(0)" : hrefbox.value;
      areas[selectedA].alt = altbox.value;
      areas[selectedA].title = altbox.value;
      nc[0] = Math.round((pointA[0].x < pointA[1].x) ? pointA[0].x : pointA[1].x);
      nc[1] = Math.round((pointA[0].y < pointA[1].y) ? pointA[0].y : pointA[1].y);
      nc[2] = Math.round((pointA[0].x >= pointA[1].x) ? pointA[0].x : pointA[1].x);
      nc[3] = Math.round((pointA[0].y >= pointA[1].y) ? pointA[0].y : pointA[1].y);
      areas[selectedA].coords = nc.join(',');
      codebox.innerText = livemap.innerHTML;
      
      editMode = 0;
      selectedA = areas.length;
      areatable.style.display = 'none';
      pointA = [];
      drawAreas();          
    }
  }, false);
  
  removebutton.addEventListener('click', function (e){
    if(editMode == 1){
      livemap.removeChild(areas[selectedA]);
      areas = livemap.getElementsByTagName('area');
      codebox.innerText = livemap.innerHTML;
    }
    editMode = 0;
    selectedA = areas.length;
    hrefbox.value = "";
    altbox.value = "";
    areatable.style.display = 'none';
    pointA = [];
    drawAreas();
  }, false);
  
  canvas.addEventListener('mousedown', function (e){
    if(editMode){
      for(var p = 0; p < pointA.length; p++) {
        if((mouse.x > (pointA[p].x - 8)) && (mouse.x < (pointA[p].x + 8)) && (mouse.y > (pointA[p].y - 8)) && (mouse.y < (pointA[p].y + 8))){
          lockedPoint = p;
          canvas.style.cursor = 'pointer';
          mouseUtils.dragFunction = function (){
            pointA[lockedPoint].x = mouse.x;
            pointA[lockedPoint].y = mouse.y;
            drawAreas();
          }
          break;
        }
      }
    }
    e.preventDefault();
  }, false);
  
  canvas.addEventListener('mouseup', function (e){
    if (!editMode) {
      for (var a = 0; a < areas.length; a++) {
        var sc = areas[a].coords.split(',');
        if (mouse.x > sc[0] && mouse.y > sc[1] && mouse.x < sc[2] && mouse.y < sc[3]) {
          selectedA = a;
          editMode = 1;
          hrefbox.value = areas[a].href;
          altbox.value = areas[a].alt;
          areatable.style.display = 'table';
          pointA = [{x: sc[0], y: sc[1]},{x: sc[2], y: sc[3]}];
          break;
        }
      }          
    } else {
      mouseUtils.dragFunction = false;
      canvas.style.cursor = 'default';
      lockedPoint = 2;
    }
    drawAreas();
  }, false);
  
  var mappedimg = document.getElementById('mappedimg');
  if(mappedimg.complete){
    mappedimgloaded();
  }else{
     mappedimg.onload = mappedimgloaded;
  }
  function mappedimgloaded (){
    canvas.width = mappedimg.width;
    canvas.height = mappedimg.height;
    drawAreas();
  }
  
  function drawAreas () {
    context.drawImage(mappedimg, 0, 0);
    context.strokeStyle = (!editMode) ? 'blue' : 'red';
    for(var a = 0; a < areas.length; a++){
      //console.log(areas[a].coords);
      if(a != selectedA){
        var rc = areas[a].coords.split(',');
        context.strokeRect(rc[0], rc[1], rc[2] - rc[0], rc[3] - rc[1]);
      }
    }
    if (pointA.length) {
      context.strokeStyle = 'green';
      context.strokeRect(pointA[0].x, pointA[0].y, pointA[1].x - pointA[0].x, pointA[1].y - pointA[0].y);
      context.strokeRect(pointA[0].x - 8, pointA[0].y - 8, 16, 16);
      context.strokeRect(pointA[1].x - 8, pointA[1].y - 8, 16, 16);
    }
  }

};

var mouseUtils = {};

mouseUtils.dragFunction = false;

mouseUtils.captureMouse = function (element) {
  
  var mouse = {x: 0, y: 0, event: null},
      body_scrollLeft = document.body.scrollLeft,
      element_scrollLeft = document.documentElement.scrollLeft,
      body_scrollTop = document.body.scrollTop,
      element_scrollTop = document.documentElement.scrollTop,
      offsetLeft = element.offsetLeft,
      offsetTop = element.offsetTop;
  
  element.addEventListener('mousemove', function (e) {
    var x, y;
    
    if (e.pageX || e.pageY) {
      x = e.pageX;
      y = e.pageY;
    } else {
      x = e.clientX + body_scrollLeft + element_scrollLeft;
      y = e.clientY + body_scrollTop + element_scrollTop;
    }
    x -= offsetLeft;
    y -= offsetTop;
    
    mouse.x = x;
    mouse.y = y;
    mouse.event = e;
    
    if(mouseUtils.dragFunction){
      mouseUtils.dragFunction();
    }
    
    e.preventDefault();
    
  }, false);
  
  return mouse;
};