document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation ---
    const links = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

    function showSection(id) {
        sections.forEach(section => {
            section.style.display = section.id === id ? 'block' : 'none';
        });
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            window.location.hash = sectionId;
        });
    });

    function handleHashChange() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        links.forEach(l => {
            if (l.getAttribute('href').substring(1) === hash) {
                l.classList.add('active');
            } else {
                l.classList.remove('active');
            }
        });
        // Render gallery if gallery section is active
        if (hash === 'gallery') {
            renderGallery();
        }
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // On load, check for saved theme
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
    });

    // --- Lotto Generator ---
    const lottoControls = document.getElementById('lotto-controls');
    const displayArea = document.getElementById('lotto-display-area');

    lottoControls.addEventListener('click', (e) => {
        if (e.target.classList.contains('lotto-button')) {
            const type = e.target.dataset.lottoType;
            generateAndDisplayNumbers(type);
        }
    });

    function generateAndDisplayNumbers(type) {
        let numbersHtml = '';
        let generatedNumbers;

        switch (type) {
            case 'korea-645':
                generatedNumbers = generateUniqueNumbers(6, 1, 45);
                numbersHtml = createNumberBalls(generatedNumbers);
                break;
            case 'korea-720':
                const group = Math.floor(Math.random() * 5) + 1;
                const digits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
                numbersHtml = `<div class="number-set"><h3>${group}조 ${digits}</h3></div>`;
                break;
            case 'usa-powerball':
                const powerballMain = generateUniqueNumbers(5, 1, 69);
                const powerballNum = generateUniqueNumbers(1, 1, 26);
                numbersHtml = createNumberBalls(powerballMain) +
                              '<div class="separator">+</div>' +
                              createNumberBalls(powerballNum, true);
                break;
            case 'usa-megamillions':
                const megaMain = generateUniqueNumbers(5, 1, 70);
                const megaNum = generateUniqueNumbers(1, 1, 25);
                numbersHtml = createNumberBalls(megaMain) +
                              '<div class="separator">+</div>' +
                              createNumberBalls(megaNum, true);
                break;
            case 'canada-649':
                generatedNumbers = generateUniqueNumbers(6, 1, 49);
                numbersHtml = createNumberBalls(generatedNumbers);
                break;
            case 'canada-lottomax':
                generatedNumbers = generateUniqueNumbers(7, 1, 50);
                numbersHtml = createNumberBalls(generatedNumbers);
                break;
        }

        displayArea.innerHTML = `<div class="numbers">${numbersHtml}</div>`;
    }
    
    function generateUniqueNumbers(count, min, max) {
        const numbers = new Set();
        while (numbers.size < count) {
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.add(randomNumber);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function createNumberBalls(numbers, isSpecial = false) {
        return numbers.map(number => {
            const color = isSpecial ? '#ff7272' : getNumberColor(number);
            return `<div class="number" style="background-color: ${color};">${number}</div>`;
        }).join('');
    }

    function getNumberColor(number) {
        if (number <= 10) return '#fbc400'; // Yellow
        if (number <= 20) return '#69c8f2'; // Blue
        if (number <= 30) return '#ff7272'; // Red
        if (number <= 40) return '#aaa';    // Gray
        return '#b0d840';                   // Green
    }

    // --- Gallery Logic (Image Upload and IndexedDB Persistence) ---
    const DB_NAME = 'FamilyHubGallery';
    const DB_VERSION = 1;
    const STORE_NAME = 'images';

    let db;

    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    }

    async function saveImage(imageBlob) {
        if (!db) await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const timestamp = new Date().getTime(); // Unique ID for each image
            const request = store.add({ blob: imageBlob, timestamp: timestamp });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                console.error("Error saving image:", event.target.error);
                reject(event.target.error);
            };
        });
    }

    async function getImages() {
        if (!db) await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error("Error getting images:", event.target.error);
                reject(event.target.error);
            };
        });
    }

    const imageUploadInput = document.getElementById('image-upload-input');
    const uploadImageButton = document.getElementById('upload-image-button');
    const galleryGrid = document.getElementById('gallery-grid');

    uploadImageButton.addEventListener('click', () => {
        imageUploadInput.click();
    });

    imageUploadInput.addEventListener('change', async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                console.warn('Skipping non-image file:', file.name);
                continue;
            }
            try {
                // Read file as Blob and save
                await saveImage(file);
            } catch (error) {
                console.error('Failed to save image:', file.name, error);
            }
        }
        imageUploadInput.value = ''; // Clear input for next upload
        renderGallery(); // Re-render gallery after upload
    });

    async function renderGallery() {
        galleryGrid.innerHTML = ''; // Clear current gallery
        const imagesData = await getImages();

        if (imagesData.length === 0) {
            galleryGrid.innerHTML = '<p>No images in gallery yet. Upload some photos!</p>';
            return;
        }

        // Sort by timestamp (newest first)
        imagesData.sort((a, b) => b.timestamp - a.timestamp);

        imagesData.forEach(imageData => {
            const imgBlob = imageData.blob;
            const imgUrl = URL.createObjectURL(imgBlob);

            const galleryItem = document.createElement('div');
            galleryItem.classList.add('gallery-item');

            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = 'Family Photo'; // Consider adding a way to get actual alt text later

            galleryItem.appendChild(img);
            galleryGrid.appendChild(galleryItem);
        });
    }

    // Initialize IndexedDB and render gallery on page load
    openDatabase().then(() => {
        if (window.location.hash.substring(1) === 'gallery') {
            renderGallery();
        }
    });

});