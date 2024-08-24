chrome.commands.onCommand.addListener((command) => {
    if (command === 'capture_screen') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['contentScript.js']
            });
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'capture') {
        chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, async (dataUrl) => {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob);

            const img = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
            const ctx = img.getContext('2d');
            ctx.drawImage(imageBitmap, 0, 0);

            const canvas = new OffscreenCanvas(message.area.width, message.area.height);
            const canvasCtx = canvas.getContext('2d');
            canvasCtx.drawImage(img, message.area.x, message.area.y, message.area.width, message.area.height, 0, 0, message.area.width, message.area.height);

            // 캡처한 영역의 이미지를 새로운 탭에 열기
            const capturedBlob = await canvas.convertToBlob({ type: 'image/png' });
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result;
                chrome.tabs.create({ url: base64data });
            };
            reader.readAsDataURL(capturedBlob);
        });
    }
});