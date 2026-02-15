
document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase & Other Configs ---
    const firebaseConfig = {
        apiKey: "AIzaSyBPTUgBQVsdQ8zsHCmE6CtjcL3LASoweLs",
        authDomain: "my-family-in-canada-8348-d04e1.firebaseapp.com",
        projectId: "my-family-in-canada-8348-d04e1",
        storageBucket: "my-family-in-canada-8348-d04e1.appspot.com",
        messagingSenderId: "1043656805377",
        appId: "1:1043656805377:web:902d6f8dc9dcbb95be4400"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dklpq8xg8/image/upload';
    const CLOUDINARY_UPLOAD_PRESET = 'family_hub_preset';
    const GOOGLE_CALENDAR_API_KEY = 'AIzaSyBPTUgBQVsdQ8zsHCmE6CtjcL3LASoweLs';
    const GOOGLE_CALENDAR_ID = 'tigerjk726@gmail.com';
    const YOUTUBE_VIDEO_ID = 'eLhSxOAaWmg';

    // --- Collections ---
    const linksCollection = db.collection('useful_links');
    const recommendationsCollection = db.collection('recommendations');
    const imagesCollection = db.collection('images');

    // --- General DOM Elements ---
    const themeToggle = document.getElementById('theme-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

    // --- Page Specific Elements ---
    const lottoButtons = document.querySelectorAll('.lotto-button');
    const lottoDisplay = document.getElementById('lotto-display-area');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const uploadProgress = document.getElementById('upload-progress');
    const galleryContainer = document.getElementById('gallery-container');

    // Link Form
    const addLinkForm = document.getElementById('add-link-form');
    const linkTitleInput = document.getElementById('link-title');
    const linkUrlInput = document.getElementById('link-url');
    const linkCategoryInput = document.getElementById('link-category');
    const linkLists = {
        News: document.getElementById('news-links-list'),
        Government: document.getElementById('government-links-list'),
        Education: document.getElementById('education-links-list'),
        Fun: document.getElementById('fun-links-list')
    };

    // Recommendation Form
    const addRecommendationForm = document.getElementById('add-recommendation-form');
    const recommendationCategoryInput = document.getElementById('recommendation-category');
    const recommendationTitleInput = document.getElementById('recommendation-title');
    const recommendationField1Group = document.getElementById('recommendation-field1-group');
    const recommendationField1Label = document.getElementById('recommendation-field1-label');
    const recommendationField1Input = document.getElementById('recommendation-field1');
    const recommendationField2Group = document.getElementById('recommendation-field2-group');
    const recommendationField2Input = document.getElementById('recommendation-field2');
    const recommendationLists = {
        book: document.getElementById('book-list'),
        movie: document.getElementById('movie-list'),
        music: document.getElementById('music-list'),
    };

    // Modals
    const imageModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const recommendationModal = document.getElementById('recommendation-modal');
    const recommendationModalTitle = document.getElementById('recommendation-modal-title');
    const recommendationModalDetails = document.getElementById('recommendation-modal-details');

    // --- Event Listeners & Logic ---

    // Unified Modal Close Logic
    document.querySelectorAll('.modal .close-button').forEach(button => {
        button.onclick = () => { button.closest('.modal').style.display = "none"; };
    });
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    };

    // YouTube Player
    let player;
    window.onYouTubeIframeAPIReady = () => {
        player = new YT.Player('player', {
            height: '0', width: '0', videoId: YOUTUBE_VIDEO_ID,
            playerVars: { 'autoplay': 0, 'controls': 0, 'loop': 1, 'playlist': YOUTUBE_VIDEO_ID },
        });
    };
    musicToggle?.addEventListener('click', () => {
        if (!player?.getPlayerState) return;
        player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
        musicToggle.textContent = player.getPlayerState() === 1 ? '🎶' : '🎵';
    });

    // Theme Toggle
    themeToggle?.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark-theme');
        themeToggle.textContent = document.documentElement.classList.contains('dark-theme') ? '☀️' : '🌙';
    });

    // --- SPA Navigation ---
    const showSection = (id) => sections.forEach(s => s.classList.toggle('active', s.id === id));
    const handleHashChange = () => {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href').substring(1) === hash));
        // Lazy load section content
        if (hash === 'calendar') initializeCalendar();
        if (hash === 'gallery') loadAndDisplayImages();
        if (hash === 'info') loadAndDisplayLinks();
        if (hash === 'recommendation') loadAndDisplayRecommendations();
    };
    navLinks.forEach(link => link.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = link.getAttribute('href').substring(1);
    }));
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial page load

    // --- Calendar ---
    let calendar;
    function initializeCalendar() {
        const el = document.getElementById('calendar-container');
        if (!el || calendar || !window.FullCalendar) return;
        calendar = new window.FullCalendar.Calendar(el, {
            initialView: 'dayGridMonth',
            headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
            googleCalendarApiKey: GOOGLE_CALENDAR_API_KEY,
            events: { googleCalendarId: GOOGLE_CALENDAR_ID }
        });
        calendar.render();
    }

    // --- Useful Links Logic ---
    addLinkForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = linkTitleInput.value.trim();
        const url = linkUrlInput.value.trim();
        if (!title || !url) return alert('Please fill in all fields.');
        try {
            await linksCollection.add({ 
                title, url, category: linkCategoryInput.value, 
                createdAt: firebase.firestore.FieldValue.serverTimestamp() 
            });
            addLinkForm.reset();
            loadAndDisplayLinks();
        } catch (error) { console.error("Error adding link: ", error); }
    });

    async function loadAndDisplayLinks() {
        Object.values(linkLists).forEach(list => { if(list) list.innerHTML = ''; });
        const snapshot = await linksCollection.orderBy('createdAt').get();
        snapshot.forEach(doc => {
            const data = doc.data();
            const list = linkLists[data.category];
            if (!list) return;
            const li = document.createElement('li');
            li.innerHTML = `<a href="${data.url}" target="_blank">${data.title}</a><button>🗑️</button>`;
            li.querySelector('button').addEventListener('click', async () => {
                if (confirm(`Delete "${data.title}"?`)) {
                    await linksCollection.doc(doc.id).delete();
                    loadAndDisplayLinks();
                }
            });
            list.appendChild(li);
        });
    }

    // --- Recommendations Logic ---
    const updateRecommendationFormUI = () => {
        if (!recommendationCategoryInput) return;
        const category = recommendationCategoryInput.value;
        const isBook = category === 'book';
        if(recommendationField1Label) recommendationField1Label.textContent = isBook ? 'Author:' : (category === 'movie' ? 'Summary:' : 'Singer:');
        if(recommendationField1Input) recommendationField1Input.placeholder = isBook ? 'e.g., J.K. Rowling' : '...';
        if(recommendationField2Group) recommendationField2Group.style.display = isBook ? 'block' : 'none';
    };
    recommendationCategoryInput?.addEventListener('change', updateRecommendationFormUI);
    updateRecommendationFormUI(); // Initial UI setup

    addRecommendationForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = recommendationTitleInput.value.trim();
        if (!title) return alert('Please enter a title.');
        try {
            await recommendationsCollection.add({
                category: recommendationCategoryInput.value,
                title: title,
                field1: recommendationField1Input.value.trim(),
                field2: recommendationField2Input.value.trim(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            addRecommendationForm.reset();
            updateRecommendationFormUI();
            loadAndDisplayRecommendations();
        } catch (error) {
            console.error("Error adding recommendation: ", error);
        }
    });

    async function loadAndDisplayRecommendations() {
        Object.values(recommendationLists).forEach(list => { if (list) list.innerHTML = ''; });
        const snapshot = await recommendationsCollection.orderBy('createdAt', 'desc').get();
        snapshot.forEach(doc => {
            const data = doc.data();
            const list = recommendationLists[data.category];
            if (!list) return;
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `
                <div class="recommendation-item-content">
                    <h4>${data.title}</h4>
                    ${data.createdAt?.toDate ? `<p class="recommendation-date">${data.createdAt.toDate().toLocaleDateString()}</p>` : ''}
                </div>
                <button class="delete-recommendation-btn">🗑️</button>
            `;

            item.querySelector('.recommendation-item-content').addEventListener('click', () => {
                let detailsHtml = '';
                if (data.category === 'book') {
                    detailsHtml = `<p><strong>Author:</strong> ${data.field1}</p><p><strong>Comment:</strong> ${data.field2}</p>`;
                } else if (data.category === 'movie') {
                    detailsHtml = `<p><strong>Summary:</strong> ${data.field1}</p>`;
                } else if (data.category === 'music') {
                    detailsHtml = `<p><strong>Singer:</strong> ${data.field1}</p>`;
                }
                recommendationModalTitle.textContent = data.title;
                recommendationModalDetails.innerHTML = detailsHtml;
                recommendationModal.style.display = 'block';
            });

            item.querySelector('.delete-recommendation-btn').addEventListener('click', async (e) => {
                e.stopPropagation(); // Stop the click from opening the modal
                if (confirm(`Are you sure you want to delete "${data.title}"?`)) {
                    try {
                        await recommendationsCollection.doc(doc.id).delete();
                        loadAndDisplayRecommendations(); // Refresh the list
                    } catch (error) {
                        console.error("Error deleting recommendation: ", error);
                        alert("Failed to delete recommendation.");
                    }
                }
            });

            list.appendChild(item);
        });
    }


    // --- Photo Gallery Logic ---
    uploadButton?.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) return alert("Please select a file!");
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', CLOUDINARY_URL, true);
        xhr.upload.onprogress = e => {
            if (e.lengthComputable && uploadProgress) {
                uploadProgress.style.display = 'block';
                uploadProgress.value = (e.loaded / e.total) * 100;
            }
        };
        xhr.onload = () => {
            if(uploadProgress) uploadProgress.style.display = 'none';
            if (xhr.status === 200) {
                const res = JSON.parse(xhr.responseText);
                imagesCollection.add({ url: res.secure_url, createdAt: firebase.firestore.FieldValue.serverTimestamp() })
                    .then(() => { if(fileInput) fileInput.value = ''; loadAndDisplayImages(); });
            } else { alert('Upload failed.'); }
        };
        xhr.send(formData);
    });

    async function loadAndDisplayImages() {
        if(!galleryContainer) return;
        galleryContainer.innerHTML = '';
        const snapshot = await imagesCollection.orderBy('createdAt', 'desc').get();
        snapshot.forEach(doc => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            const img = new Image();
            img.src = doc.data().url;
            img.alt = "Gallery image";
            item.appendChild(img);
            item.addEventListener('click', () => {
                if(modalImg) modalImg.src = doc.data().url;
                if(imageModal) imageModal.style.display = "block";
            });
            galleryContainer.appendChild(item);
        });
    }

    // --- Lottery Generator ---
    lottoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.lottoType;
            displayLottoNumbers(generateLottoNumbers(type), type);
        });
    });

    function generateLottoNumbers(type) {
        let balls = [], specialCount = 0, specialMax = 0;
        switch (type) {
            case 'korea-645': balls = [{ count: 6, max: 45 }]; break;
            case 'korea-720':
                const group = Math.floor(Math.random() * 5) + 1;
                const rest = Array.from({length: 6}, () => Math.floor(Math.random() * 10)).join('');
                return { structured: `<strong>${group}조</strong> ${rest}` };
            case 'usa-powerball': balls = [{ count: 5, max: 69 }]; specialCount = 1; specialMax = 26; break;
            case 'usa-megamillions': balls = [{ count: 5, max: 70 }]; specialCount = 1; specialMax = 25; break;
            case 'canada-649': balls = [{ count: 6, max: 49 }]; break;
            case 'canada-lottomax': balls = [{ count: 7, max: 50 }]; break;
        }
        const generateUniqueNumbers = (count, min, max) => {
            let numbers = new Set();
            while (numbers.size < count) numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
            return [...numbers].sort((a, b) => a - b);
        };
        let finalNumbers = balls.map(b => generateUniqueNumbers(b.count, 1, b.max).map(val => ({val}))).flat();
        if (specialCount > 0) {
            finalNumbers.push({ val: generateUniqueNumbers(1, 1, specialMax)[0], special: true });
        }
        return { numbers: finalNumbers };
    }

    function displayLottoNumbers(result, type) {
        if(!lottoDisplay) return;
        lottoDisplay.innerHTML = '';
        const container = document.createElement('div');
        if (result.structured) {
            container.innerHTML = result.structured;
        } else if (result.numbers) {
            container.className = 'lotto-numbers-container';
            result.numbers.forEach(numObj => {
                const ball = document.createElement('div');
                ball.textContent = numObj.val;
                ball.className = 'lotto-number';
                if (numObj.special) ball.classList.add('lotto-special-number');
                ball.style.backgroundColor = getLottoColor(type, numObj.val, numObj.special);
                ball.style.color = getLottoTextColor(type, numObj.val, numObj.special);
                container.appendChild(ball);
            });
        }
        lottoDisplay.appendChild(container);
    }

    const getLottoColor = (type, number, isSpecial) => {
        if (isSpecial) return type === 'usa-powerball' ? '#e62e2e' : '#fbc400';
        switch (type) {
            case 'korea-645':
                if (number <= 10) return '#fbc400'; if (number <= 20) return '#69c8f2';
                if (number <= 30) return '#ff7272'; if (number <= 40) return '#aaa';
                return '#b0d840';
            case 'usa-powerball': return '#fff';
            case 'usa-megamillions': return '#0033a0';
            case 'canada-649': return '#ce1126';
            case 'canada-lottomax': return '#009cde';
            default: return '#ddd';
        }
    };

    const getLottoTextColor = (type, number, isSpecial) => {
        if (isSpecial) return '#fff';
        if (type === 'korea-645' && number > 10 && number <= 20) return '#000';
        if (type === 'usa-powerball') return '#000';
        return '#fff';
    };
});
