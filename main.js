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
    const db = firebase.firestore(); // Initialize Firestore

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
    // Gallery Elements
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const uploadProgress = document.getElementById('upload-progress');
    const galleryContainer = document.getElementById('gallery-container');
    // Info Link Elements
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

    closeButton.onclick = function() {
        modal.style.display = "none";
    }


    // --- YouTube Player --- 
    let player;
    let isPlayerReady = false;
    window.onYouTubeIframeAPIReady = function() {
        isPlayerReady = true;
        player = new YT.Player('player', {
            height: '0',
            width: '0',
            videoId: YOUTUBE_VIDEO_ID,
            playerVars: { 'autoplay': 0, 'controls': 0, 'loop': 1, 'playlist': YOUTUBE_VIDEO_ID },
            events: {
                'onReady': onPlayerReady
            }
        });
    }

    function onPlayerReady(event) {
        // Player is ready
    }

    musicToggle.addEventListener('click', () => {
        if (!isPlayerReady || !player) return;
        const playerState = player.getPlayerState();
        if (playerState === YT.PlayerState.PLAYING || playerState === YT.PlayerState.BUFFERING) {
            player.pauseVideo();
            musicToggle.textContent = '🎵'; // Music Off Icon
        } else {
            player.playVideo();
            musicToggle.textContent = '🎶'; // Music On Icon
        }
    });

    // --- Theme Toggle ---
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

    // --- Navigation ---
    function showSection(id) {
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === id) {
                section.classList.add('active');
            }
        });
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            window.location.hash = sectionId;
        });
    });

    let calendar;

    function initializeCalendar() {
        const calendarEl = document.getElementById('calendar-container');
        if (!calendarEl || calendar) return;
        if (GOOGLE_CALENDAR_API_KEY === 'YOUR_API_KEY' || GOOGLE_CALENDAR_ID === 'YOUR_CALENDAR_ID') {
            calendarEl.innerHTML = '<p>Please configure Google Calendar API Key and Calendar ID.</p>';
            return;
        }
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

    // 1. Add new link
    addLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = linkTitle.value.trim();
        const url = linkUrl.value.trim();
        const category = linkCategory.value;

        if (title === '' || url === '') {
            alert('Please fill in both Title and URL.');
            return;
        }

        try {
            await linksCollection.add({
                title,
                url,
                category,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            addLinkForm.reset();
            loadAndDisplayLinks(); // Refresh the list
        } catch (error) {
            console.error("Error adding link: ", error);
            alert('Failed to add link.');
        }
    });

    // 2. Load and display all links
    async function loadAndDisplayLinks() {
        // Clear existing lists
        Object.values(linkLists).forEach(list => { list.innerHTML = ''; });

        try {
            const snapshot = await linksCollection.orderBy('createdAt').get();
            snapshot.forEach(doc => {
                displayLink(doc.id, doc.data());
            });
        } catch (error) {
            console.error("Error loading links: ", error);
        }
    }

    // 3. Display a single link
    function displayLink(id, data) {
        const list = linkLists[data.category];
        if (!list) return; // Category list not found

        const li = document.createElement('li');
        li.setAttribute('data-id', id);

        const a = document.createElement('a');
        a.href = data.url;
        a.textContent = data.title;
        a.target = '_blank';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.className = 'delete-link-button';
        deleteBtn.addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete "${data.title}"?`)) {
                try {
                    await linksCollection.doc(id).delete();
                    loadAndDisplayLinks(); // Refresh
                } catch (error) {
                    console.error("Error deleting link: ", error);
                    alert("Failed to delete link.");
                }
            }
        });

        li.appendChild(a);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    }

    // --- Photo Gallery Logic (Cloudinary + Firestore) ---
    async function loadAndDisplayImages() {
        galleryContainer.innerHTML = '';
        try {
            const snapshot = await db.collection('images').orderBy('createdAt', 'desc').get();
            snapshot.forEach(doc => displayImage(doc.data().url));
        } catch (error) {
            console.error("Error getting images: ", error);
        }
    }

    function displayImage(url) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        const img = document.createElement('img');
        img.src = url;
        item.appendChild(img);
        galleryContainer.appendChild(item);

        item.addEventListener('click', function() {
            modal.style.display = "block";
            modalImg.src = this.getElementsByTagName('img')[0].src;
        });
    }

    uploadButton.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) { alert("Please select a file!"); return; }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', CLOUDINARY_URL, true);
        xhr.upload.onprogress = e => {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                uploadProgress.style.display = 'block';
                uploadProgress.value = progress;
            }
        };
        xhr.onload = () => {
            uploadProgress.style.display = 'none';
            if (xhr.status === 200) {
                const res = JSON.parse(xhr.responseText);
                db.collection('images').add({ url: res.secure_url, createdAt: firebase.firestore.FieldValue.serverTimestamp() })
                    .then(() => { fileInput.value = ''; loadAndDisplayImages(); });
            } else { alert('Upload failed.'); }
        };
        xhr.onerror = () => { alert('Upload error.'); };
        xhr.send(formData);
    });

    // --- Hash-based Routing ---
    function handleHashChange() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        links.forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('href').substring(1) === hash) l.classList.add('active');
        });

        if (hash === 'calendar') setTimeout(initializeCalendar, 0);
        if (hash === 'gallery') loadAndDisplayImages();
        if (hash === 'info') loadAndDisplayLinks(); // Load links for Info section
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

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
                let rest = generateUniqueNumbers(6, 0, 9).join('');
                return { structured: `<strong>${group}조</strong> ${rest}` };
            case 'usa-powerball':
                balls = [{ count: 5, max: 69 }];
                specialCount = 1;
                break;
            case 'usa-megamillions':
                balls = [{ count: 5, max: 70 }];
                specialCount = 1;
                break;
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
                    num = numObj.val;
                    isSpecial = numObj.special;
                } else {
                    num = numObj;
                    isSpecial = false;
                }

                ball.textContent = num;
                ball.className = 'lotto-number';
                if (isSpecial) {
                    ball.classList.add('lotto-special-number');
                }

                // Assign color based on lotto type
                let color;
                switch (type) {
                    case 'korea-645': color = getLotto645Color(num); break;
                    case 'usa-powerball': color = isSpecial ? '#e62e2e' : '#fff'; break;
                    case 'usa-megamillions': color = isSpecial ? '#fbc400' : '#0033a0'; break;
                    case 'canada-649': color = '#ce1126'; break;
                    case 'canada-lottomax': color = '#009cde'; break;
                    default: color = '#ddd';
                }
                ball.style.backgroundColor = color;
                if(type === 'usa-powerball' && !isSpecial) ball.style.color = '#000'; // White ball, black text
                else ball.style.color = '#fff'; // Default to white text
                

                container.appendChild(ball);
            });
            lottoDisplay.appendChild(container);
        }
    }

    function getLotto645Color(number) {
        if (number <= 10) return '#fbc400'; // 노란색
        if (number <= 20) return '#69c8f2'; // 파란색
        if (number <= 30) return '#ff7272'; // 빨간색
        if (number <= 40) return '#aaa';    // 회색
        return '#b0d840'; // 녹색
    }

});
