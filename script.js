document.addEventListener('DOMContentLoaded', (event) => {
    // Функция для вычисления среднего цвета изображения
    function getAverageColor(imgElement) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const width = imgElement.width;
        const height = imgElement.height;
        canvas.width = width;
        canvas.height = height;
        context.drawImage(imgElement, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < imageData.length; i += 4) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
        }
        const pixelCount = imageData.length / 4;
        return { r: r / pixelCount, g: g / pixelCount, b: b / pixelCount };
    }

    // Функция для сортировки изображений по среднему цвету
    function sortImagesByColor() {
        const imageLinks = document.querySelectorAll('.image-link');
        const imagesArray = Array.from(imageLinks);
        imagesArray.sort((a, b) => {
            const colorA = getAverageColor(a.querySelector('img'));
            const colorB = getAverageColor(b.querySelector('img'));
            const brightnessA = (colorA.r + colorA.g + colorA.b) / 3;
            const brightnessB = (colorB.r + colorB.g + colorB.b) / 3;
            return brightnessA - brightnessB;
        });
        const container = document.getElementById('image-container');
        imagesArray.forEach(imgLink => container.appendChild(imgLink));
    }

    // Функция для сжатия изображений
    function resizeImage(imgElement, maxWidth, maxHeight) {
        return new Promise((resolve) => {
            imgElement.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                let width = imgElement.width;
                let height = imgElement.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                context.drawImage(imgElement, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg');
                resolve(dataUrl);
            };
        });
    }

    // Функция для добавления атрибута loading="lazy" к изображениям
    function addLazyLoadingToImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }

    // Функция для добавления новых изображений
    function addNewImages(images) {
        if (!images || images.length === 0) {
            console.error('No images to add');
            return;
        }

        const container = document.getElementById('image-container');
        images.forEach(image => {
            const link = document.createElement('a');
            link.href = image.link;
            link.target = '_blank';
            link.className = 'image-link';

            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt;
            img.loading = 'lazy'; // Добавляем атрибут loading="lazy"

            link.appendChild(img);
            container.appendChild(link);
        });

        // Загрузка изображений и сортировка по цвету
        const imageLinks = document.querySelectorAll('.image-link img');
        let loadedImages = 0;
        imageLinks.forEach(async (img) => {
            const dataUrl = await resizeImage(img, 200, 200);
            img.src = dataUrl;
            img.onload = () => {
                loadedImages++;
                if (loadedImages === imageLinks.length) {
                    sortImagesByColor();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${img.src}`);
                img.style.display = 'none'; // Скрыть изображение, если оно не загружается
            };
        });
    }

    // Пример данных для новых изображений (удалите или закомментируйте эту строку, если не нужно)
    const newImages = [
        { src: 'image1.jpg', link: 'https://example.com/image1', alt: 'Image 1' },
        { src: 'image2.jpg', link: 'https://example.com/image2', alt: 'Image 2' },
        // Добавьте больше изображений по мере необходимости
    ];

    // Добавление новых изображений
    addNewImages(newImages);

    // Добавление атрибута loading="lazy" к уже существующим изображениям
    addLazyLoadingToImages();

    // Функция для добавления проплывающих надписей
    function addFloatingText() {
        const container = document.getElementById('floating-text-container');
        fetch('phrases.txt')
            .then(response => response.text())
            .then(data => {
                let allPhrases = data.split('/').map(phrase => phrase.trim()).filter(phrase => phrase);
                const maxPhrases = 4; // Максимальное количество одновременно отображаемых фраз
                let currentPhrases = [];

                function addPhrase() {
                    if (allPhrases.length === 0) {
                        // If all phrases have been shown, shuffle and reuse
                        allPhrases = data.split('/').map(phrase => phrase.trim()).filter(phrase => phrase);
                    }
                    const randomIndex = Math.floor(Math.random() * allPhrases.length);
                    const phrase = allPhrases[randomIndex];
                    allPhrases.splice(randomIndex, 1); // Remove the phrase after using it

                    const textElement = document.createElement('div');
                    textElement.className = 'floating-text';
                    textElement.textContent = phrase;

                    const y = Math.random() * window.innerHeight;
                    textElement.style.top = `${y}px`;

                    const animationDuration = Math.random() * 5 + 5; // от 5 до 10 секунд
                    textElement.style.animationDuration = `${animationDuration}s`;

                    container.appendChild(textElement);
                    currentPhrases.push(textElement);

                    // Log the phrase and animation duration for debugging
                    console.log(`Added phrase: "${phrase}" with duration: ${animationDuration}s`);

                    // Remove the text element after animation
                    textElement.addEventListener('animationend', () => {
                        container.removeChild(textElement);
                        currentPhrases = currentPhrases.filter(el => el !== textElement);
                        addPhrase(); // Add a new phrase to maintain the count
                    });
                }

                // Start with the maximum number of phrases
                for (let i = 0; i < maxPhrases; i++) {
                    addPhrase();
                }
            })
            .catch(error => console.error('Error loading phrases:', error));
    }

    // Добавление проплывающих надписей
    addFloatingText();

    // Воспроизведение аудио
    const audio = document.getElementById('background-audio');
    const volumeSlider = document.getElementById('volume-slider');
    const pauseButton = document.getElementById('pause-button');
    const startAudioButton = document.getElementById('start-audio-button');
    const infoPanel = document.getElementById('info-panel');
    const backgroundOverlay = document.getElementById('background-overlay');
    const blurOverlay = document.getElementById('blur-overlay');

    // Управление громкостью
    volumeSlider.value = audio.volume;
    volumeSlider.addEventListener('input', (event) => {
        audio.volume = event.target.value;
    });

    // Управление паузой/воспроизведением
    pauseButton.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            pauseButton.textContent = 'АСТААНВИ МУЗЫКУУУ';
        } else {
            audio.pause();
            pauseButton.textContent = 'ВКЛЮЧИ ШАРМАНКУУ';
        }
    });

    // Показать панель и воспроизвести аудио при нажатии на кнопку
    startAudioButton.addEventListener('click', () => {
        infoPanel.style.display = 'none';
        backgroundOverlay.style.display = 'none';
        blurOverlay.style.display = 'none';
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    });

    // Показать панель при загрузке страницы
    infoPanel.style.display = 'flex';
    backgroundOverlay.style.display = 'block';
    blurOverlay.style.display = 'block';
});
