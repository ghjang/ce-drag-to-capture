(function () {
  let startX, startY, endX, endY;
  let selectionBox = document.createElement('div');

  selectionBox.style.position = 'absolute';
  selectionBox.style.border = '2px dashed red';
  selectionBox.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
  document.body.appendChild(selectionBox);

  function onMouseMove(e) {
    endX = e.clientX;
    endY = e.clientY;
    selectionBox.style.left = Math.min(startX, endX) + 'px';
    selectionBox.style.top = Math.min(startY, endY) + 'px';
    selectionBox.style.width = Math.abs(startX - endX) + 'px';
    selectionBox.style.height = Math.abs(startY - endY) + 'px';
  }

  function onMouseDown(e) {
    startX = e.clientX;
    startY = e.clientY;
    document.addEventListener('mousemove', onMouseMove);
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mouseup', onMouseUp);

    chrome.runtime.sendMessage({
      type: 'capture',
      area: {
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(startX - endX),
        height: Math.abs(startY - endY)
      }
    });

    selectionBox.remove();
  }

  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
})();
