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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'capture') {
        chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, async (dataUrl) => {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();

                // NOTE: 'window.devicePixelRatio'가 이미 적용된(곱해진) 크기의 이미지 비트맵이 생성됨.
                const imageBitmap = await createImageBitmap(blob);

                const img = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
                const ctx = img.getContext('2d');
                ctx.drawImage(imageBitmap, 0, 0);

                const x = message.area.x * message.devicePixelRatio;
                const y = message.area.y * message.devicePixelRatio;
                const width = message.area.width * message.devicePixelRatio;
                const height = message.area.height * message.devicePixelRatio;
                const canvas = new OffscreenCanvas(width, height);
                const canvasCtx = canvas.getContext('2d');
                canvasCtx.drawImage(
                    img,
                    x,
                    y,
                    width,
                    height,
                    0,
                    0,
                    width,
                    height
                );

                // 캡처한 영역의 이미지를 새로운 탭에 열기
                const capturedBlob = await canvas.convertToBlob({ type: 'image/png' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    chrome.tabs.create({ url: base64data });
                };
                reader.readAsDataURL(capturedBlob);

                sendResponse({ success: true });
            } catch (error) {
                console.error('Error capturing tab:', error);
                sendResponse({ success: false, error: error.message });
            }
        });

        // 비동기 응답을 위해 true 반환
        return true;
    }
});
