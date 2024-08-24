(function () {
  let startX, startY, endX, endY;
  let selectionBox = document.createElement('div');
  let overlay = document.createElement('div');

  // 오버레이 스타일 설정
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.border = 'none';
  overlay.style.outline = 'none';
  overlay.style.zIndex = '9999';
  overlay.style.cursor = 'crosshair';
  overlay.tabIndex = 0; // 오버레이가 키보드 이벤트를 받을 수 있도록 설정
  document.body.appendChild(overlay);

  // 선택 박스 스타일 설정
  selectionBox.style.position = 'absolute';
  selectionBox.style.display = 'none';
  selectionBox.style.border = '2px dashed red';
  selectionBox.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
  overlay.appendChild(selectionBox);

  function onMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    startX = e.clientX;
    startY = e.clientY;

    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    
    overlay.addEventListener('mousemove', onMouseMove);
  }

  function onMouseMove(e) {
    e.preventDefault();
    e.stopPropagation();

    selectionBox.style.display = 'block';

    endX = e.clientX;
    endY = e.clientY;

    selectionBox.style.left = `${Math.min(startX, endX)}px`;
    selectionBox.style.top = `${Math.min(startY, endY)}px`;
    selectionBox.style.width = `${Math.abs(startX - endX)}px`;
    selectionBox.style.height = `${Math.abs(startY - endY)}px`;
  }

  function onMouseUp() {
    overlay.removeEventListener('mousemove', onMouseMove);
    overlay.removeEventListener('mousedown', onMouseDown);
    overlay.removeEventListener('mouseup', onMouseUp);
    overlay.removeEventListener('keydown', onKeyDown);

    selectionBox.remove();
    overlay.remove();

    requestAnimationFrame(() => {
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'capture',
          area: {
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            width: Math.abs(startX - endX),
            height: Math.abs(startY - endY)
          },
          devicePixelRatio: window.devicePixelRatio
        });
      }, 50);
    });
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancelCaptureMode();
    }
  }

  function cancelCaptureMode() {
    overlay.removeEventListener('mousemove', onMouseMove);
    overlay.removeEventListener('mousedown', onMouseDown);
    overlay.removeEventListener('mouseup', onMouseUp);
    overlay.removeEventListener('keydown', onKeyDown);

    selectionBox.remove();
    overlay.remove();
  }

  overlay.addEventListener('mousedown', onMouseDown);
  overlay.addEventListener('mouseup', onMouseUp);
  overlay.addEventListener('keydown', onKeyDown);
  overlay.focus(); // 오버레이가 키보드 이벤트를 받을 수 있도록 포커스 설정
})();