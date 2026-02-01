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

    // --- Home Image Upload ---
    const imageUpload = document.getElementById('home-image-upload');
    const homeImage = document.getElementById('home-image');
    const removeImageButton = document.getElementById('remove-home-image');

    const savedImage = localStorage.getItem('homeImageData');
    if (savedImage) {
        homeImage.src = savedImage;
        homeImage.style.display = 'block';
        removeImageButton.style.display = 'inline-block';
    }

    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageDataUrl = e.target.result;
                homeImage.src = imageDataUrl;
                homeImage.style.display = 'block';
                removeImageButton.style.display = 'inline-block';
                localStorage.setItem('homeImageData', imageDataUrl);
            }
            reader.readAsDataURL(file);
        }
    });

    removeImageButton.addEventListener('click', function() {
        homeImage.src = '';
        homeImage.style.display = 'none';
        removeImageButton.style.display = 'none';
        localStorage.removeItem('homeImageData');
        imageUpload.value = '';
    });

    // --- Gallery ---
    const galleryUpload = document.getElementById('gallery-upload');
    const galleryGrid = document.getElementById('gallery-grid');
    const galleryPagination = document.getElementById('gallery-pagination');
    
    let galleryImages = JSON.parse(localStorage.getItem('galleryImages')) || [];
    let currentPage = 1;
    const imagesPerPage = 20;

    galleryUpload.addEventListener('change', function() {
        const files = this.files;
        if (!files.length) return;

        let filesToProcess = files.length;

        for (const file of files) {
            const reader = new FileReader();
            reader.onload = function(e) {
                galleryImages.push({
                    id: Date.now() + Math.random(), // Simple unique ID
                    src: e.target.result
                });
                filesToProcess--;
                if (filesToProcess === 0) {
                    saveAndRenderGallery();
                }
            }
            reader.readAsDataURL(file);
        }
        this.value = ''; // Reset file input
    });

    function saveAndRenderGallery() {
        localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
        renderGallery();
    }
    
    function deleteImage(id) {
        galleryImages = galleryImages.filter(img => img.id !== id);
        saveAndRenderGallery();
    }

    function renderGallery() {
        galleryGrid.innerHTML = '';
        const totalPages = Math.ceil(galleryImages.length / imagesPerPage);
        currentPage = Math.min(currentPage, totalPages) || 1;

        const start = (currentPage - 1) * imagesPerPage;
        const end = start + imagesPerPage;
        const paginatedImages = galleryImages.slice(start, end);

        paginatedImages.forEach(img => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'gallery-item';
            
            const imageEl = document.createElement('img');
            imageEl.src = img.src;
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-gallery-image';
            deleteButton.textContent = 'X';
            deleteButton.onclick = () => deleteImage(img.id);
            
            imgContainer.appendChild(imageEl);
            imgContainer.appendChild(deleteButton);
            galleryGrid.appendChild(imgContainer);
        });
        
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        galleryPagination.innerHTML = '';
        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = 'page-button';
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.onclick = () => {
                currentPage = i;
                renderGallery();
            };
            galleryPagination.appendChild(pageButton);
        }
    }
});