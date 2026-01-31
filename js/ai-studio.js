// AI Studio Logic - Integrating with Hugging Face Inference API

// Default to a high-quality architectural model (Flux or SDXL)
const DEFAULT_MODEL = "black-forest-labs/FLUX.1-dev";
// Note: FLUX.1-dev usually requires a Pro subscription or Key on HF. 
// Fallback to SDXL-Lightning which is often free/fast: "ByteDance/SDXL-Lightning"
const FALLBACK_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

// DOM Elements
const elements = {
    generateBtn: document.getElementById('generateBtn'),
    promptInput: document.getElementById('promptInput'),
    negativePrompt: document.getElementById('negativePrompt'),
    stylePreset: document.getElementById('stylePreset'),
    modelSelect: document.getElementById('modelSelect'),
    geminiApiKey: document.getElementById('geminiApiKey'),
    hfApiKey: document.getElementById('hfApiKey'),
    outputPlaceholder: document.getElementById('outputPlaceholder'),
    loadingState: document.getElementById('loadingState'),
    resultContainer: document.getElementById('resultContainer'),
    generatedImage: document.getElementById('generatedImage'),
    downloadBtn: document.getElementById('downloadBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    toggleSettings: document.getElementById('toggleSettings'),
    advancedSettings: document.getElementById('advancedSettings'),
    ratioBtns: document.querySelectorAll('.ratio-btn'),
    historyGrid: document.getElementById('historyGrid'),
    loadingText: document.getElementById('loadingText'),
    modelName: document.getElementById('modelName'),
    resultSeed: document.getElementById('resultSeed')
};

// State
let currentRatio = "1:1";
const history = JSON.parse(localStorage.getItem('bam_ai_history') || '[]');

// Init
function init() {
    loadSettings();
    renderHistory();
    setupEventListeners();

    // Set initial model name
    elements.modelName.innerText = "SDXL 1.0"; // Using SDXL as safer free default
}

function setupEventListeners() {
    elements.generateBtn.addEventListener('click', generateImage);

    elements.ratioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.ratioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRatio = btn.dataset.ratio;
        });
    });

    elements.toggleSettings.addEventListener('click', () => {
        elements.advancedSettings.classList.toggle('hidden');
        const arrow = elements.toggleSettings.querySelector('.arrow');
        arrow.innerText = elements.advancedSettings.classList.contains('hidden') ? '▼' : '▲';
    });

    elements.geminiApiKey.addEventListener('change', () => {
        localStorage.setItem('bam_gemini_key', elements.geminiApiKey.value);
    });

    if (elements.hfApiKey) {
        elements.hfApiKey.addEventListener('change', () => {
            localStorage.setItem('bam_hf_key', elements.hfApiKey.value);
        });
    }

    elements.modelSelect.addEventListener('change', () => {
        const model = elements.modelSelect.value;
        if (model === 'gemini') {
            elements.modelName.innerText = "Nano Banana";
            if (!elements.geminiApiKey.value) elements.advancedSettings.classList.remove('hidden');
        } else if (model === 'flux') {
            elements.modelName.innerText = "Flux (Free)";
            elements.advancedSettings.classList.add('hidden');
        } else {
            elements.modelName.innerText = "Turbo (Free)";
            elements.advancedSettings.classList.add('hidden');
        }
    });

    elements.downloadBtn.addEventListener('click', downloadImage);
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
}

function loadSettings() {
    const savedGeminiKey = localStorage.getItem('bam_gemini_key');
    if (savedGeminiKey) elements.geminiApiKey.value = savedGeminiKey;

    const savedHfKey = localStorage.getItem('bam_hf_key');
    if (savedHfKey && elements.hfApiKey) elements.hfApiKey.value = savedHfKey;
}

async function generateImage() {
    const prompt = elements.promptInput.value.trim();
    if (!prompt) {
        alert("Please describe your vision first.");
        elements.promptInput.focus();
        return;
    }

    setLoading(true);

    try {
        const currentModel = elements.modelSelect.value;
        const dimensions = getDimensions(currentRatio);
        const fullPrompt = constructPrompt(prompt, elements.stylePreset.value);

        let imageUrl = null;

        if (currentModel === 'gemini') {
            // Gemini Logic
            const geminiKey = elements.geminiApiKey.value.trim();
            if (!geminiKey) {
                alert("Please enter a Google Gemini API Key in 'Advanced Settings'.");
                setLoading(false);
                return;
            }
            imageUrl = await queryGemini(fullPrompt, geminiKey, currentRatio);

        } else if (currentModel === 'flux' || currentModel === 'sdxl') {
            // Hugging Face models via proxy
            imageUrl = await queryHuggingFace(fullPrompt, currentModel, dimensions);

        } else {
            // AI Horde (free, anonymous) via proxy
            const seed = Math.floor(Math.random() * 1000000);
            const ANONYMOUS_KEY = '0000000000';

            try {
                // Step 1: Submit generation request via proxy
                const submitResponse = await fetch('/api/horde/api/v2/generate/async', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': ANONYMOUS_KEY
                    },
                    body: JSON.stringify({
                        prompt: fullPrompt,
                        params: {
                            width: dimensions.width,
                            height: dimensions.height,
                            steps: 20,
                            sampler_name: 'k_euler',
                            cfg_scale: 7,
                            seed: seed.toString()
                        },
                        nsfw: false,
                        models: ['stable_diffusion']
                    })
                });

                if (!submitResponse.ok) {
                    throw new Error('Failed to submit request');
                }

                const submitData = await submitResponse.json();
                const requestId = submitData.id;

                // Step 2: Poll for completion
                let imageUrl = null;
                let attempts = 0;
                const maxAttempts = 60; // 2 minutes max

                while (!imageUrl && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                    attempts++;

                    // Update loading text
                    if (elements.loadingText) {
                        elements.loadingText.innerText = `Generating... (${attempts * 2}s)`;
                    }

                    const checkResponse = await fetch(`/api/horde/api/v2/generate/check/${requestId}`);
                    const checkData = await checkResponse.json();

                    if (checkData.done) {
                        // Get the result
                        const resultResponse = await fetch(`/api/horde/api/v2/generate/status/${requestId}`);
                        const resultData = await resultResponse.json();

                        if (resultData.generations && resultData.generations.length > 0) {
                            imageUrl = resultData.generations[0].img;
                            // AI Horde returns base64 or URL
                            if (!imageUrl.startsWith('http')) {
                                imageUrl = 'data:image/webp;base64,' + imageUrl;
                            }
                        }
                        break;
                    }
                }

                if (!imageUrl) {
                    throw new Error('Generation timed out. Please try again.');
                }

                // Update seed display
                if (elements.resultSeed) elements.resultSeed.innerText = seed;

                displayResult(imageUrl);
                saveToHistory(imageUrl, prompt);
                return; // Exit early since we already called displayResult

            } catch (hordeError) {
                console.error("AI Horde error:", hordeError);
                throw new Error("Image generation failed: " + hordeError.message);
            }
        }

        displayResult(imageUrl);
        saveToHistory(imageUrl, prompt);

    } catch (error) {
        console.error("Generation failed:", error);
        alert("Generation failed: " + error.message);
    } finally {
        setLoading(false);
    }
}

// Hugging Face API via proxy
async function queryHuggingFace(prompt, modelType, dimensions) {
    // Model mapping
    const models = {
        'flux': 'black-forest-labs/FLUX.1-schnell', // Free fast Flux model
        'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0'
    };

    const modelId = models[modelType] || models['sdxl'];
    const url = `/api/huggingface/models/${modelId}`;

    // Get HF API key from localStorage or use empty for free tier
    const hfKey = localStorage.getItem('bam_hf_key') || '';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(hfKey && { 'Authorization': `Bearer ${hfKey}` })
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                width: dimensions.width,
                height: dimensions.height
            }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Hugging Face Error: ${response.status} - ${errText}`);
    }

    // HF returns image blob directly
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}


async function queryGemini(prompt, key, ratio) {
    // Imagen 3 API via proxy
    const url = `/api/google/v1beta/models/imagen-3.0-generate-002:generateImages?key=${key}`;

    // Map ratio to API format
    let aspectRatio = "1:1";
    if (ratio === "16:9") aspectRatio = "16:9";
    else if (ratio === "9:16") aspectRatio = "9:16";

    const requestBody = {
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio,
            personGeneration: "DONT_ALLOW" // Safe option
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${response.status}`;
        throw new Error(`Imagen 3 Error: ${errMsg}`);
    }

    const data = await response.json();

    // Parse Imagen 3 response
    if (data.generatedImages && data.generatedImages.length > 0) {
        const img = data.generatedImages[0];
        if (img.image?.imageBytes) {
            return `data:image/png;base64,${img.image.imageBytes}`;
        }
    }

    // Alternative response formats
    if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
        return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
    }

    throw new Error("No image generated. Check your API key permissions.");
}

function constructPrompt(userPrompt, style) {
    let styleKeywords = "";
    switch (style) {
        case 'photorealistic': styleKeywords = ", 8k resolution, photorealistic, highly detailed, architectural photography, cinematic lighting"; break;
        case 'architectural_sketch': styleKeywords = ", architectural sketch, pencil drawing, blueprint style, loose lines, white paper"; break;
        case 'cyberpunk': styleKeywords = ", cyberpunk, neon lights, futuristic city, high tech, night scape"; break;
        case 'minimalist': styleKeywords = ", minimalist architecture, white concrete, clean lines, blue sky, soft shadows"; break;
        default: styleKeywords = "";
    }
    return `${userPrompt}${styleKeywords}`;
}

function getDimensions(ratio) {
    // SDXL preferred: 1024x1024 base
    if (ratio === '16:9') return { width: 1216, height: 832 }; // Approx
    if (ratio === '9:16') return { width: 832, height: 1216 };
    return { width: 1024, height: 1024 };
}

function setLoading(isLoading) {
    if (isLoading) {
        elements.outputPlaceholder.classList.add('hidden');
        elements.resultContainer.classList.add('hidden');
        elements.loadingState.classList.remove('hidden');
        elements.generateBtn.disabled = true;
        elements.generateBtn.querySelector('.btn-text').innerText = "Generating...";

        const messages = ["Analyzing prompts...", "Sketching structure...", "Rendering lighting...", "Polishing details..."];
        let i = 0;
        elements.loadingText.innerText = messages[0];
        window.loadingInterval = setInterval(() => {
            i = (i + 1) % messages.length;
            elements.loadingText.innerText = messages[i];
        }, 3000);

    } else {
        clearInterval(window.loadingInterval);
        elements.loadingState.classList.add('hidden');
        elements.generateBtn.disabled = false;
        elements.generateBtn.querySelector('.btn-text').innerText = "Generate Visual";
    }
}

function displayResult(url) {
    elements.generatedImage.src = url;
    elements.resultContainer.classList.remove('hidden');
    elements.outputPlaceholder.classList.add('hidden');
}

function saveToHistory(url, prompt) {
    // Ideally we convert blob URL to base64 to save to local storage (limit size)
    // For now, simpler approach: just don't persist blobs across reload effectively without IndexedDB.
    // Let's try to base64 it.

    fetch(url)
        .then(r => r.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = function () {
                const base64data = reader.result;
                const item = {
                    id: Date.now(),
                    image: base64data,
                    prompt: prompt,
                    date: new Date().toLocaleDateString()
                };

                history.unshift(item);
                if (history.length > 10) history.pop();

                localStorage.setItem('bam_ai_history', JSON.stringify(history));
                renderHistory();
            }
            reader.readAsDataURL(blob);
        });
}

function renderHistory() {
    elements.historyGrid.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.style = `
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #333;
            cursor: pointer;
            position: relative;
            aspect-ratio: 1;
        `;
        div.innerHTML = `
            <img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">
            <div style="position:absolute; bottom:0; left:0; width:100%; background:rgba(0,0,0,0.7); color:white; padding:4px; font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.prompt}</div>
        `;
        div.onclick = () => {
            elements.generatedImage.src = item.image;
            elements.resultContainer.classList.remove('hidden');
            elements.outputPlaceholder.classList.add('hidden');
            elements.promptInput.value = item.prompt;
        };
        elements.historyGrid.appendChild(div);
    });
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = `bam-ai-${Date.now()}.png`;
    link.href = elements.generatedImage.src;
    link.click();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        elements.generatedImage.requestFullscreen().catch(err => {
            alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Start
init();
