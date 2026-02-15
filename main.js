
document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Config ---
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

    // --- Cloudinary Config ---
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dklpq8xg8/image/upload';
    const CLOUDINARY_UPLOAD_PRESET = 'family_hub_preset';

    // --- Google Calendar Config ---
    const GOOGLE_CALENDAR_API_KEY = 'AIzaSyBPTUgBQVsdQ8zsHCmE6CtjcL3LASoweLs';
    const GOOGLE_CALENDAR_ID = 'tigerjk726@gmail.com';

    // --- YouTube Music Config ---
    const YOUTUBE_VIDEO_ID = 'C02fHh1AnKs';

    // --- DOM Element References ---
    const themeToggle = document.getElementById('theme-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const links = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    const lottoButtons = document.querySelectorAll('.lotto-button');
    const lottoDisplay = document.getElementById('lotto-display-area');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const uploadProgress = document.getElementById('upload-progress');
    const galleryContainer = document.getElementById('gallery-container');
    const addLinkForm = document.getElementById('add-link-form');
    const linkTitle = document.getElementById('link-title');
    const linkUrl = document.getElementById('link-url');
    const linkCategory = document.getElementById('link-category');
    const linkLists = {
        News: document.getElementById('news-links-list'),
        Government: document.getElementById('government-links-list'),
        Education: document.getElementById('education-links-list'),
        Fun: document.getElementById('fun-links-list')
    };

    // --- Modal Elements ---
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const closeButton = document.getElementsByClassName('close-button')[0];

    if(closeButton) {
        closeButton.onclick = function() {
            modal.style.display = "none";
        }
    }

    // --- YouTube Player --- 
    let player;
    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('player', {
            height: '0', width: '0', videoId: YOUTUBE_VIDEO_ID,
            playerVars: { 'autoplay': 0, 'controls': 0, 'loop': 1, 'playlist': YOUTUBE_VIDEO_ID },
        });
    }
    if(musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (!player || typeof player.getPlayerState !== 'function') return;
            const playerState = player.getPlayerState();
            if (playerState === 1) { // Playing
                player.pauseVideo();
                musicToggle.textContent = '🎵';
            } else { // Paused, cued, etc.
                player.playVideo();
                musicToggle.textContent = '🎶';
            }
        });
    }

    // --- Theme Toggle ---
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                themeToggle.textContent = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.textContent = '☀️';
            }
        });
    }

    // --- Navigation ---
    function showSection(id) {
        sections.forEach(section => {
            section.classList.toggle('active', section.id === id);
        });
    }
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = link.getAttribute('href').substring(1);
        });
    });

    // --- App Initialization based on Hash ---
    function handleHashChange() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        links.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href').substring(1) === hash);
        });
        switch(hash) {
            case 'calendar': initializeCalendar(); break;
            case 'gallery': loadAndDisplayImages(); break;
            case 'info': loadAndDisplayLinks(); break;
            case 'recommendation': 
                updateRecommendationForm();
                loadAndDisplayRecommendations();
                break;
        }
    }
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    // --- Calendar ---
    let calendar;
    function initializeCalendar() {
        const calendarEl = document.getElementById('calendar-container');
        if (!calendarEl || calendar || !window.FullCalendar) return;
        calendar = new window.FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
            googleCalendarApiKey: GOOGLE_CALENDAR_API_KEY,
            events: { googleCalendarId: GOOGLE_CALENDAR_ID }
        });
        calendar.render();
    }

    // --- Useful Links (Info Section) Logic ---
    const linksCollection = db.collection('useful_links');
    if(addLinkForm) {
        addLinkForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!linkTitle.value || !linkUrl.value) return alert('Please fill in all fields.');
            try {
                await linksCollection.add({
                    title: linkTitle.value, url: linkUrl.value, category: linkCategory.value,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                addLinkForm.reset();
                loadAndDisplayLinks();
            } catch (error) {
                console.error("Error adding link: ", error);
                alert('Failed to add link.');
            }
        });
    }
    async function loadAndDisplayLinks() {
        Object.values(linkLists).forEach(list => { if(list) list.innerHTML = ''; });
        const snapshot = await linksCollection.orderBy('createdAt').get();
        snapshot.forEach(doc => displayLink(doc.id, doc.data()));
    }
    function displayLink(id, data) {
        const list = linkLists[data.category];
        if (!list) return;
        const li = document.createElement('li');
        li.innerHTML = `<a href="${data.url}" target="_blank">${data.title}</a><button>🗑️</button>`;
        li.querySelector('button').addEventListener('click', async () => {
            if (confirm(`Delete "${data.title}"?`)) {
                await linksCollection.doc(id).delete();
                loadAndDisplayLinks();
            }
        });
        list.appendChild(li);
    }

    // --- Recommendations Logic (CLEANED) ---
    const recommendationsCollection = db.collection('recommendations');
    const recommendationForm = document.getElementById('add-recommendation-form');
    const recommendationCategory = document.getElementById('recommendation-category');
    const recommendationTitle = document.getElementById('recommendation-title');
    const recommendationField1Group = document.getElementById('recommendation-field1-group');
    const recommendationField1Label = recommendationField1Group.querySelector('label');
    const recommendationField1 = document.getElementById('recommendation-field1');
    const recommendationField2Group = document.getElementById('recommendation-field2-group');
    const recommendationField2Label = recommendationField2Group.querySelector('label');
    const recommendationField2 = document.getElementById('recommendation-field2');
    const recommendationLists = {
        book: document.getElementById('book-list'),
        movie: document.getElementById('movie-list'),
        music: document.getElementById('music-list'),
    };
    const recommendationModal = document.getElementById('recommendation-modal');
    const recommendationModalTitle = document.getElementById('recommendation-modal-title');
    const recommendationModalDetails = document.getElementById('recommendation-modal-details');
    const recommendationModalCloseButton = document.querySelector('#recommendation-modal .close-button');

    if(recommendationModalCloseButton) {
        recommendationModalCloseButton.onclick = function() {
            if(recommendationModal) recommendationModal.style.display = "none";
        }
    }

    function updateRecommendationForm() {
        if (!recommendationCategory) return;
        const category = recommendationCategory.value;
        const isBook = category === 'book';

        if(recommendationField1Group) {
            recommendationField1Group.style.display = 'block';
            recommendationField1Label.textContent = isBook ? 'Author:' : (category === 'movie' ? 'Summary:' : 'Singer:');
            recommendationField1.placeholder = isBook ? 'e.g., J.K. Rowling' : (category === 'movie' ? 'Movie summary...' : 'e.g., Adele');
        }
        if(recommendationField2Group){
            recommendationField2Group.style.display = isBook ? 'block' : 'none';
            if(isBook) {
                recommendationField2Label.textContent = 'Comment:';
                recommendationField2.placeholder = 'e.g., A fantastic read!';
            }
        }
    }

    if(recommendationCategory) {
        recommendationCategory.addEventListener('change', updateRecommendationForm);
    }

    if(recommendationForm) {
        recommendationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const category = recommendationCategory.value;
            const title = recommendationTitle.value.trim();

            if (title === '') return alert('Please enter a title.');

            const data = {
                category,
                title,
                field1: recommendationField1.value.trim(),
                field2: recommendationField2.value.trim(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            try {
                await recommendationsCollection.add(data);
                recommendationForm.reset();
                updateRecommendationForm();
                loadAndDisplayRecommendations();
            } catch (error) {
                console.error("Error adding recommendation: ", error);
                alert('Failed to add recommendation.');
            }
        });
    }

    async function loadAndDisplayRecommendations() {
        for (const list of Object.values(recommendationLists)) {
            if (list) list.innerHTML = '';
        }
        try {
            const snapshot = await recommendationsCollection.orderBy('createdAt', 'desc').get();
            snapshot.forEach(doc => {
                displayRecommendation(doc.id, doc.data());
            });
        } catch (error) {
            console.error("Error loading recommendations: ", error);
        }
    }

    function displayRecommendation(id, data) {
        const list = recommendationLists[data.category];
        if (!list) return;

        const item = document.createElement('div');
        item.className = 'recommendation-item';
        
        let detailsHtml = '';
        if (data.category === 'book') {
            detailsHtml = `<p><strong>Author:</strong> ${data.field1}</p><p><strong>Comment:</strong> ${data.field2}</p>`;
        } else if (data.category === 'movie') {
            detailsHtml = `<p><strong>Summary:</strong> ${data.field1}</p>`;
        } else if (data.category === 'music') {
            detailsHtml = `<p><strong>Singer:</strong> ${data.field1}</p>`;
        }

        item.innerHTML = `<h4>${data.title}</h4>`;
        
        const date = document.createElement('p');
        date.className = 'recommendation-date';
        if (data.createdAt && data.createdAt.toDate) {
           date.textContent = data.createdAt.toDate().toLocaleDateString();
        }
        item.appendChild(date);
        
        item.addEventListener('click', () => {
             if(recommendationModal) {
                recommendationModalTitle.textContent = data.title;
                recommendationModalDetails.innerHTML = detailsHtml;
                recommendationModal.style.display = 'block';
             }
        });
        list.appendChild(item);
    }
    
    // --- Photo Gallery Logic (Cloudinary + Firestore) ---
    async function loadAndDisplayImages() {
        if(!galleryContainer) return;
        galleryContainer.innerHTML = '';
        try {
            const snapshot = await db.collection('images').orderBy('createdAt', 'desc').get();
            snapshot.forEach(doc => displayImage(doc.id, doc.data().url));
        } catch (error) {
            console.error("Error getting images: ", error);
        }
    }
    function displayImage(id, url) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${url}" alt="Gallery image">`;
        item.addEventListener('click', () => {
            if(modal) {
                modal.style.display = "block";
                modalImg.src = url;
            }
        });
        galleryContainer.appendChild(item);
    }
    if(uploadButton) {
        uploadButton.addEventListener('click', () => {
            const file = fileInput.files[0];
            if (!file) { alert("Please select a file!"); return; }

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
                    db.collection('images').add({ url: res.secure_url, createdAt: firebase.firestore.FieldValue.serverTimestamp() })
                        .then(() => { if(fileInput) fileInput.value = ''; loadAndDisplayImages(); });
                } else { alert('Upload failed.'); }
            };
            xhr.onerror = () => { alert('Upload error.'); };
            xhr.send(formData);
        });
    }

    // --- Lottery Generator ---
    lottoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.lottoType;
            const numbers = generateLottoNumbers(type);
            displayLottoNumbers(numbers, type);
        });
    });

    function generateLottoNumbers(type) {
        let balls = [];
        let specialCount = 0;
        switch (type) {
            case 'korea-645': balls = [{ count: 6, max: 45 }]; break;
            case 'korea-720':
                const group = Math.floor(Math.random() * 5) + 1;
                let rest = Array.from({length: 6}, () => Math.floor(Math.random() * 10)).join('');
                return { structured: `<strong>${group}조</strong> ${rest}` };
            case 'usa-powerball': balls = [{ count: 5, max: 69 }]; specialCount = 1; break;
            case 'usa-megamillions': balls = [{ count: 5, max: 70 }]; specialCount = 1; break;
            case 'canada-649': balls = [{ count: 6, max: 49 }]; break;
            case 'canada-lottomax': balls = [{ count: 7, max: 50 }]; break;
        }
        let finalNumbers = balls.map(b => generateUniqueNumbers(b.count, 1, b.max)).flat();
        if (specialCount > 0) {
            const specialMax = (type === 'usa-powerball') ? 26 : 25;
            const specialNumbers = generateUniqueNumbers(specialCount, 1, specialMax);
            finalNumbers = finalNumbers.concat(specialNumbers.map(n => ({ val: n, special: true })));
        }
        return { numbers: finalNumbers };
    }

    function generateUniqueNumbers(count, min, max) {
        let numbers = new Set();
        while (numbers.size < count) {
            numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function displayLottoNumbers(result, type) {
        if(!lottoDisplay) return;
        lottoDisplay.innerHTML = '';
        if (result.structured) {
            lottoDisplay.innerHTML = result.structured;
        } else if (result.numbers) {
            const container = document.createElement('div');
            container.className = 'lotto-numbers-container';
            result.numbers.forEach(numObj => {
                const ball = document.createElement('div');
                let num, isSpecial;
                if (typeof numObj === 'object' && numObj !== null) {
                    num = numObj.val; isSpecial = numObj.special;
                } else {
                    num = numObj; isSpecial = false;
                }
                ball.textContent = num;
                ball.className = 'lotto-number';
                if (isSpecial) ball.classList.add('lotto-special-number');
                
                ball.style.backgroundColor = getLottoColor(type, num, isSpecial);
                if((type === 'usa-powerball' && !isSpecial) || (type === 'korea-645' && (num > 10 && num <=20))) {
                    ball.style.color = '#000';
                } else {
                    ball.style.color = '#fff';
                }
                container.appendChild(ball);
            });
            lottoDisplay.appendChild(container);
        }
    }

    function getLottoColor(type, number, isSpecial) {
        if (isSpecial) {
            if(type === 'usa-powerball') return '#e62e2e';
            if(type === 'usa-megamillions') return '#fbc400';
        }
        switch (type) {
            case 'korea-645':
                if (number <= 10) return '#fbc400';
                if (number <= 20) return '#69c8f2';
                if (number <= 30) return '#ff7272';
                if (number <= 40) return '#aaa';
                return '#b0d840';
            case 'usa-powerball': return '#fff';
            case 'usa-megamillions': return '#0033a0';
            case 'canada-649': return '#ce1126';
            case 'canada-lottomax': return '#009cde';
            default: return '#ddd';
        }
    }
});
