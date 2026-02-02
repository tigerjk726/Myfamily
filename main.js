document.addEventListener('DOMContentLoaded', () => {
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
                // 1 group of 1-9, 5 groups of 0-9
                const group = Math.floor(Math.random() * 5) + 1;
                let rest = generateUniqueNumbers(6, 0, 9).map(n => n.val).join(''); // Extract only val
                return { type: 'structured', numbers: [group, ...rest.split('')] };
            case 'usa-powerball':
                balls = [
                    { count: 5, max: 69, color: '#e44d26', textColor: '#fff' }, // Red for main numbers
                    { count: 1, max: 26, color: '#fbc400', textColor: '#fff' }  // Yellow for Powerball
                ];
                break;
            case 'usa-megamillions':
                balls = [
                    { count: 5, max: 70, color: '#2c3e50', textColor: '#fff' }, // Dark blue for main numbers
                    { count: 1, max: 25, color: '#fbc400', textColor: '#fff' }  // Yellow for Mega Ball
                ];
                break;
            case 'canada-649':
                balls = [{ count: 6, max: 49, color: '#5cb85c', textColor: '#fff' }]; // Green
                break;
            case 'canada-lottomax':
                balls = [{ count: 7, max: 50, color: '#5bc0de', textColor: '#fff' }]; // Light Blue
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
        container.className = 'lotto-numbers-container'; // Changed class name to avoid conflict and be more specific

        if (result.type === 'structured') {
            // Special display for Korean Pension Lottery
            const groupDiv = document.createElement('div');
            groupDiv.className = 'pension-lotto-group';
            groupDiv.innerHTML = `<strong>${result.numbers[0]}조</strong>`;
            container.appendChild(groupDiv);

            const digitsDiv = document.createElement('div');
            digitsDiv.className = 'pension-lotto-digits';
            result.numbers.slice(1).forEach(digit => {
                const digitSpan = document.createElement('span');
                digitSpan.className = 'number-ball pension-digit-ball'; // Added a class for specific styling
                digitSpan.textContent = digit;
                digitsDiv.appendChild(digitSpan);
            });
            container.appendChild(digitsDiv);

        } else { // type === 'balls'
            result.numbers.forEach(num => {
                const ball = document.createElement('div');
                ball.className = 'number-ball';
                ball.textContent = num.val;
                ball.style.backgroundColor = num.color || '#ddd';
                ball.style.color = num.textColor || '#333';
                // Adjust text color for white balls in dark mode
                if (document.documentElement.getAttribute('data-theme') === 'dark' && num.color === '#fff') {
                    ball.style.color = '#1e1e1e';
                }
                container.appendChild(ball);
            });
        }
        lottoDisplay.appendChild(container);
    }

    // --- Gallery --- (Simplified for now)
    const uploadButton = document.getElementById('upload-image-button');
    const imageInput = document.getElementById('image-upload-input');
    const galleryGrid = document.getElementById('gallery-grid');

    uploadButton.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item';
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    galleryItem.appendChild(img);
                    galleryGrid.appendChild(galleryItem);
                }
                reader.readAsDataURL(file);
            });
        }
    });
});
