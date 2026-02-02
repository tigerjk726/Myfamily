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
    const storage = firebase.storage();

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
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

    // Navigation
    const links = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

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

    function handleHashChange() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        links.forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('href').substring(1) === hash) {
                l.classList.add('active');
            }
        });
        if (hash === 'gallery') {
            loadImages();
        }
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    // --- Lottery Generator ---
    const lottoButtons = document.querySelectorAll('.lotto-button');
    const lottoDisplay = document.getElementById('lotto-display-area');

    lottoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.lottoType;
            const numbers = generateLottoNumbers(type);
            displayLottoNumbers(numbers, type);
        });
    });

    function generateLottoNumbers(type) {
        let balls = [];
        switch (type) {
            case 'korea-645':
                balls = [{ count: 6, max: 45, color: '#fbc400' }];
                break;
            case 'korea-720':
                const group = Math.floor(Math.random() * 5) + 1;
                let rest = generateUniqueNumbers(6, 0, 9).map(n => n.val).join('');
                return { type: 'structured', numbers: [group, ...rest.split('')] };
            case 'usa-powerball':
                balls = [
                    { count: 5, max: 69, color: '#fff', textColor: '#d92a2a' },
                    { count: 1, max: 26, color: '#d92a2a', textColor: '#fff' }
                ];
                break;
            case 'usa-megamillions':
                balls = [
                    { count: 5, max: 70, color: '#fff', textColor: '#fbc400' },
                    { count: 1, max: 25, color: '#fbc400', textColor: '#fff' }
                ];
                break;
            case 'canada-649':
                balls = [{ count: 6, max: 49, color: '#d92a2a' }];
                break;
            case 'canada-lottomax':
                balls = [{ count: 7, max: 50, color: '#007bff' }];
                break;
        }

        const generated = balls.map(b => generateUniqueNumbers(b.count, 1, b.max, b.color, b.textColor));
        return { type: 'balls', numbers: generated.flat() };
    }

    function generateUniqueNumbers(count, min, max, color, textColor) {
        let numbers = new Set();
        while (numbers.size < count) {
            numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return Array.from(numbers).sort((a, b) => a - b).map(n => ({ val: n, color, textColor }));
    }

    function displayLottoNumbers(result, type) {
        lottoDisplay.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'lotto-numbers';

        if (result.type === 'structured') {
            container.innerHTML = `<strong>조:</strong> ${result.numbers[0]} <strong>각자리:</strong> ${result.numbers.slice(1).join(' ')}`;
        } else {
            result.numbers.forEach(num => {
                const ball = document.createElement('div');
                ball.className = 'number-ball';
                ball.textContent = num.val;
                ball.style.backgroundColor = num.color || '#ddd';
                ball.style.color = num.textColor || '#333';
                if (document.documentElement.getAttribute('data-theme') === 'dark' && num.color === '#fff') {
                    ball.style.color = '#1e1e1e';
                }
                container.appendChild(ball);
            });
        }
        lottoDisplay.appendChild(container);
    }

    // --- Gallery ---
    const uploadButton = document.getElementById('upload-image-button');
    const imageInput = document.getElementById('image-upload-input');
    const galleryGrid = document.getElementById('gallery-grid');

    function uploadImage(file) {
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`images/${Date.now()}_${file.name}`);
        const uploadTask = imageRef.put(file);

        uploadTask.on('state_changed', 
            (snapshot) => { /* Can be used to show progress */ }, 
            (error) => {
                console.error("Upload failed:", error);
                alert('Image upload failed. Please try again.');
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    displayImage(downloadURL, false); // Prepend new image
                });
            }
        );
    }

    function displayImage(url, append) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        const img = document.createElement('img');
        img.src = url;
        galleryItem.appendChild(img);
        if (append) {
            galleryGrid.appendChild(galleryItem); // Append for initial load
        } else {
            galleryGrid.prepend(galleryItem); // Prepend for new uploads
        }
    }

    function loadImages() {
        galleryGrid.innerHTML = '<p>Loading images...</p>';
        const storageRef = storage.ref('images');

        storageRef.listAll().then((res) => {
            galleryGrid.innerHTML = '';
            if (res.items.length === 0) {
                galleryGrid.innerHTML = '<p>No images yet. Upload your first photo!</p>';
                return;
            }
            const sortedItems = res.items.sort((a, b) => b.name.localeCompare(a.name));
            sortedItems.forEach(itemRef => {
                itemRef.getDownloadURL().then(url => {
                    displayImage(url, true); // Append all on initial load
                });
            });
        }).catch(error => {
            console.error("Error loading images: ", error);
            galleryGrid.innerHTML = '<p>Error loading images. Please try again later.</p>';
        });
    }

    uploadButton.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => {
                uploadImage(file);
            });
        }
    });
});
