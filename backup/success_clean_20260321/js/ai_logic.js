/**
 * AI Logic for Bam Architecture Mixboard
 * Handles: Canvas (Fabric.js), Model selection, UI interactions, and API simulations.
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('mixboard-canvas');
    const container = document.querySelector('.ai-canvas-container');
    
    // Initialize Fabric.js Canvas
    const canvas = new fabric.Canvas('mixboard-canvas', {
        width: container.clientWidth * 0.8,
        height: container.clientHeight * 0.8,
        backgroundColor: '#111',
        preserveObjectStacking: true
    });

    // --- Accordion Logic ---
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });

    // --- State Management ---
    let currentMode = 'select';
    let brushSize = 30;
    
    const loader = document.getElementById('ai-loader');
    const loaderText = document.getElementById('loader-text');
    const jsonDisplay = document.getElementById('json-display');
    const promptInput = document.getElementById('ai-prompt');
    const historyList = document.getElementById('history-list');

    // --- Canvas resizing & Responsive ---
    const resizeCanvas = () => {
        canvas.setDimensions({
            width: container.clientWidth * 0.95,
            height: container.clientHeight * 0.9
        });
        canvas.renderAll();
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- Tool Functions ---
    const updateTool = (mode) => {
        currentMode = mode;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        
        canvas.isDrawingMode = (mode === 'brush' || mode === 'erase');
        
        if (mode === 'select') {
            document.getElementById('tool-select').classList.add('active');
        } else if (mode === 'brush') {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = 'rgba(123, 151, 170, 0.4)'; // Theme-consistent mask
            canvas.freeDrawingBrush.width = brushSize;
            document.getElementById('tool-brush').classList.add('active');
        } else if (mode === 'erase') {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = '#111'; 
            canvas.freeDrawingBrush.width = brushSize * 1.5;
            document.getElementById('tool-erase').classList.add('active');
        }
    };

    // --- UI Listeners ---
    document.getElementById('tool-select').onclick = () => updateTool('select');
    document.getElementById('tool-brush').onclick = () => updateTool('brush');
    document.getElementById('tool-erase').onclick = () => updateTool('erase');
    
    document.getElementById('brush-size').oninput = (e) => {
        brushSize = parseInt(e.target.value);
        if (canvas.freeDrawingBrush) canvas.freeDrawingBrush.width = brushSize;
    };

    // --- JSON Extraction & Intelligence ---
    const updateJSON = (obj) => {
        if (!obj) {
            jsonDisplay.value = JSON.stringify({ "ready": true, "selection": null }, null, 4);
            return;
        }

        const analysisPhrases = [
            "Brutalist concrete texture with sharp shadow play.",
            "Minimalist glass facade emphasizing transparency.",
            "Structural wooden elements with organic flow.",
            "Post-modern geometric complexity in facade detail."
        ];

        const data = {
            id: `bam_ia_${Math.floor(Math.random() * 10000)}`,
            element: obj.type,
            transform: {
                scale: obj.scaleX.toFixed(2),
                rotate: obj.angle + "°",
                pos: [Math.round(obj.left), Math.round(obj.top)]
            },
            vision_intelligence: {
                detected_style: analysisPhrases[Math.floor(Math.random() * analysisPhrases.length)],
                composition_score: 0.92,
                architectural_keywords: ["Materiality", "Volume", "Void", "Light"]
            },
            model_info: {
                engine: document.getElementById('model-selector').value,
                timestamp: new Date().toLocaleTimeString()
            }
        };

        jsonDisplay.value = JSON.stringify(data, null, 4);
    };

    // --- API Configuration & Fetching ---
    const getKeys = () => ({
        gemini: localStorage.getItem('api_gemini') || '',
        flux: localStorage.getItem('api_flux') || ''
    });

    const performAIGeneration = async () => {
        const prompt = promptInput.value || "Architectural conceptually sketch";
        const model = document.getElementById('model-selector').value;
        const keys = getKeys();
        
        let imageUrl = '';

        try {
            if (model === 'flux-2-klein') {
                if (!keys.flux) throw new Error("Flux API Key (Fal.ai) is missing. Please set it in API Settings.");
                
                showLoader("Generating via Flux 2 Klein...");
                const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Key ${keys.flux}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        image_size: "landscape_4_3",
                        num_inference_steps: 4
                    })
                });
                
                if (!response.ok) throw new Error(`Flux API Error: ${response.statusText}`);
                const data = await response.json();
                imageUrl = data.images[0].url;

            } else if (model.includes('gemini') || model.includes('nanobanana')) {
                if (!keys.gemini) throw new Error("Gemini API Key is missing. Please set it in API Settings.");

                const isFlash = model.includes('flash') || model.includes('lite');
                const tier = isFlash ? "Gemini 3.1 Flash" : "Gemini 3.1 Pro";
                const targetModel = 'imagen-3.0-generate-001';
                
                showLoader(`Generating via Google Imagen 3 (${tier})...`);
                
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:predict?key=${keys.gemini}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt: prompt }],
                        parameters: { sampleCount: 1 }
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || "Google AI API connection failed.");
                }

                const data = await response.json();
                imageUrl = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
            }

            if (imageUrl) {
                fabric.Image.fromURL(imageUrl, (img) => {
                    img.scaleToWidth(450);
                    canvas.add(img);
                    canvas.centerObject(img);
                    canvas.setActiveObject(img);
                    updateJSON(img);
                    addToHistory(imageUrl);
                    hideLoader();
                }, { crossOrigin: 'anonymous' });
            }
        } catch (err) {
            console.error("AI Generation Failed:", err);
            hideLoader();
            alert(`AI Generation Failed: ${err.message}`);
        }
    };

    document.getElementById('btn-generate').onclick = performAIGeneration;
    document.getElementById('tool-upload').onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const reader = new FileReader();
            reader.onload = (f) => {
                fabric.Image.fromURL(f.target.result, (img) => {
                    img.scaleToWidth(400);
                    canvas.add(img);
                    canvas.setActiveObject(img);
                });
            };
            reader.readAsDataURL(e.target.files[0]);
        };
        input.click();
    };

    // --- Misc ---
    document.getElementById('btn-config').onclick = () => {
        document.getElementById('config-modal').classList.remove('hidden');
    };

    canvas.on('selection:created', (e) => updateJSON(e.selected[0]));
    canvas.on('selection:updated', (e) => updateJSON(e.selected[0]));
    canvas.on('selection:cleared', () => updateJSON(null));
    canvas.on('object:modified', (e) => updateJSON(e.target));

    const showLoader = (t) => { loaderText.textContent = t; loader.classList.remove('hidden'); };
    const hideLoader = () => loader.classList.add('hidden');
    const addToHistory = (u) => {
        const it = document.createElement('div');
        it.className = 'history-item';
        it.innerHTML = `<img src="${u}">`;
        it.onclick = () => fabric.Image.fromURL(u, img => canvas.add(img.scaleToWidth(200)), {crossOrigin: 'anonymous'});
        historyList.prepend(it);
    };
    // --- Zoom/View Helpers ---
    const zoomToRect = (rect) => {
        const padding = 100;
        const width = rect.width;
        const height = rect.height;
        const centerX = rect.left + width / 2;
        const centerY = rect.top + height / 2;

        // Calculate best zoom factor
        let zoom = Math.min(
            (canvas.width - padding) / width,
            (canvas.height - padding) / height
        );
        zoom = Math.min(Math.max(zoom, 0.05), 5); // Practical limits

        canvas.setZoom(zoom);
        const vpt = canvas.viewportTransform;
        vpt[4] = canvas.width / 2 - centerX * zoom;
        vpt[5] = canvas.height / 2 - centerY * zoom;
        canvas.requestRenderAll();
    };

    document.getElementById('zoom-selection').onclick = () => {
        const active = canvas.getActiveObject();
        if (active) {
            zoomToRect(active.getBoundingRect());
        } else {
            alert("먼저 객체를 선택해 주세요.");
        }
    };

    document.getElementById('zoom-fit').onclick = () => {
        const objects = canvas.getObjects();
        if (objects.length === 0) {
            document.getElementById('reset-canvas').click();
            return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        objects.forEach(obj => {
            const rect = obj.getBoundingRect();
            minX = Math.min(minX, rect.left);
            minY = Math.min(minY, rect.top);
            maxX = Math.max(maxX, rect.left + rect.width);
            maxY = Math.max(maxY, rect.top + rect.height);
        });

        zoomToRect({
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY
        });
    };

    // --- Zoom/Reset ---
    document.getElementById('zoom-in').onclick = () => {
        canvas.setZoom(canvas.getZoom() * 1.2);
    };
    document.getElementById('zoom-out').onclick = () => {
        canvas.setZoom(canvas.getZoom() / 1.2);
    };
    document.getElementById('reset-canvas').onclick = () => {
        canvas.setZoom(1);
        canvas.setViewportTransform([1,0,0,1,0,0]);
        canvas.renderAll();
    };

    // --- Mouse Wheel Zoom ---
    canvas.on('mouse:wheel', function(opt) {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        zoom = Math.min(Math.max(zoom, 0.05), 20);
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    });

    // --- Middle Click Pan (Strictly while held) ---
    let isDragging = false;
    let lastPosX, lastPosY;

    const wrapper = document.querySelector('.canvas-wrapper');
    
    wrapper.addEventListener('mousedown', (e) => {
        if (e.button === 1) { 
            isDragging = true;
            canvas.selection = false;
            canvas.defaultCursor = 'grabbing';
            wrapper.style.cursor = 'grabbing';
            lastPosX = e.clientX;
            lastPosY = e.clientY;
            e.preventDefault();
        }
    }, true);

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const vpt = canvas.viewportTransform;
            vpt[4] += e.clientX - lastPosX;
            vpt[5] += e.clientY - lastPosY;
            canvas.requestRenderAll();
            lastPosX = e.clientX;
            lastPosY = e.clientY;
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (e.button === 1 && isDragging) {
            isDragging = false;
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            wrapper.style.cursor = 'default';
            canvas.setViewportTransform(canvas.viewportTransform);
        }
    });

    // Backup Alt+Left Pan via Fabric
    canvas.on('mouse:down', function(opt) {
        const evt = opt.e;
        if (evt.altKey && evt.button === 0) {
            isDragging = true;
            canvas.selection = false;
            lastPosX = evt.clientX;
            lastPosY = evt.clientY;
        }
    });


    // Prevent default middle click behavior on the entire window to be safe
    window.addEventListener('mousedown', (e) => {
        if (e.button === 1) {
            // Check if we are over the canvas container
            if (e.target.closest('.ai-canvas-container')) {
                e.preventDefault();
            }
        }
    }, { passive: false });


    // --- Keyboard Delete ---
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || (e.key === 'Backspace' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))) {
            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length > 0) {
                canvas.remove(...activeObjects);
                canvas.discardActiveObject().renderAll();
            }
        }
    });

    // --- Edit Modal Logic ---
    const editModal = document.getElementById('edit-modal');
    const editPreviewCanvas = new fabric.Canvas('edit-preview-canvas', {
        width: 600,
        height: 300,
        backgroundColor: '#000',
        isDrawingMode: true
    });

    // Default brush setup
    editPreviewCanvas.freeDrawingBrush = new fabric.PencilBrush(editPreviewCanvas);
    editPreviewCanvas.freeDrawingBrush.color = 'rgba(255, 0, 0, 0.4)';
    editPreviewCanvas.freeDrawingBrush.width = 40;

    let currentEditMode = 'inpaint';

    document.getElementById('edit-mode-inpaint').onclick = () => {
        currentEditMode = 'inpaint';
        document.getElementById('edit-mode-inpaint').classList.add('active');
        document.getElementById('edit-mode-outpaint').classList.remove('active');
        editPreviewCanvas.isDrawingMode = true;
    };

    document.getElementById('edit-mode-outpaint').onclick = () => {
        currentEditMode = 'outpaint';
        document.getElementById('edit-mode-outpaint').classList.add('active');
        document.getElementById('edit-mode-inpaint').classList.remove('active');
        editPreviewCanvas.isDrawingMode = false;
    };

    document.getElementById('edit-brush-size').oninput = (e) => {
        editPreviewCanvas.freeDrawingBrush.width = parseInt(e.target.value, 10);
    };

    document.getElementById('btn-clear-mask').onclick = () => {
        const objects = editPreviewCanvas.getObjects('path');
        editPreviewCanvas.remove(...objects);
    };

    document.getElementById('btn-show-edit').onclick = () => {
        const active = canvas.getActiveObject();
        if (!active || active.type !== 'image') {
            alert("수정할 이미지를 먼저 선택해 주세요.");
            return;
        }

        editModal.classList.remove('hidden');
        
        // Show preview of the selected image in the modal
        editPreviewCanvas.clear();
        active.clone((cloned) => {
            cloned.scaleToHeight(250);
            cloned.selectable = false;
            editPreviewCanvas.add(cloned);
            editPreviewCanvas.centerObject(cloned);
            editPreviewCanvas.renderAll();
        });
        
        // Re-enable drawing mode by default when modal opens
        editPreviewCanvas.isDrawingMode = true;
    };

    const closeModals = () => {
        editModal.classList.add('hidden');
        document.getElementById('config-modal').classList.add('hidden');
    };

    document.getElementById('close-edit').onclick = closeModals;
    document.getElementById('cancel-edit').onclick = closeModals;
    document.getElementById('save-config').onclick = () => {
        localStorage.setItem('api_gemini', document.getElementById('api-key-gemini').value);
        localStorage.setItem('api_flux', document.getElementById('api-key-flux').value);
        closeModals();
    };

    document.getElementById('confirm-edit').onclick = () => {
        const prompt = document.getElementById('edit-prompt').value;
        if (!prompt) {
            alert("변경할 내용을 설명해 주세요.");
            return;
        }

        showLoader(`Applying AI ${currentEditMode}...`);
        
        setTimeout(() => {
            hideLoader();
            closeModals();
            alert(`AI Transformation Applied: ${currentEditMode} 완료 (Simulation)`);
        }, 2500);
    };

    document.getElementById('btn-extract').onclick = () => updateJSON(canvas.getActiveObject());
    document.getElementById('btn-copy-json').onclick = () => {
        navigator.clipboard.writeText(jsonDisplay.value);
        alert('Copied to clipboard');
    };

    // --- Clipboard Paste Support ---
    window.addEventListener('paste', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    fabric.Image.fromURL(event.target.result, (img) => {
                        img.scaleToWidth(300);
                        canvas.add(img);
                        canvas.setActiveObject(img);
                    }, { crossOrigin: 'anonymous' });
                };
                reader.readAsDataURL(blob);
            }
        }
    });

    // --- JSON Apply (Regeneration) ---
    document.getElementById('btn-apply-json').onclick = async () => {
        try {
            const data = JSON.parse(jsonDisplay.value);
            const activeObj = canvas.getActiveObject();
            
            showLoader("Regenerating based on JSON parameters...");
            
            if (activeObj) {
                if (data.transform) {
                    activeObj.set({
                        left: data.transform.pos[0],
                        top: data.transform.pos[1],
                        angle: parseInt(data.transform.rotate)
                    });
                    activeObj.scale(parseFloat(data.transform.scale));
                }
            }

            await new Promise(r => setTimeout(r, 1500));
            
            if (data.vision_intelligence && data.vision_intelligence.detected_style) {
                promptInput.value = data.vision_intelligence.detected_style;
            }

            canvas.renderAll();
            hideLoader();
        } catch (err) {
            alert("Invalid JSON format.");
            console.error(err);
        }
    };
});
