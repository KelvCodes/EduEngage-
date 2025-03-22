// Sample Data
let userData = {
    email: "student@example.com",
    username: "Kwaku",
    profileImage: "assets/images/default-avatar.png",
    points: 150,
    badges: ["Math Master"],
    level: 3,
    coursesCompleted: 2,
    forumPosts: 1,
    progress: { 1: 50, 2: 100 },
    language: "en",
    learningStyle: "kinesthetic"
};

// Predefined Courses (100 Lessons)
const predefinedCourses = Array.from({ length: 100 }, (_, i) => {
    const categories = ['Math', 'Science', 'History', 'Programming', 'Language', 'Art'];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    const learningStyles = ['visual', 'auditory', 'kinesthetic'];
    const category = categories[i % categories.length];
    return {
        id: i + 1,
        title: `${category} Course ${i + 1}`,
        description: `Learn ${category.toLowerCase()} concepts at level ${i + 1}!`,
        progress: Math.floor(Math.random() * 100),
        difficulty: difficulties[Math.floor(i / 33) % 3],
        aiRecommended: Math.random() > 0.5,
        category,
        learningStyle: learningStyles[i % 3],
        oerContent: `https://oercommons.org/search?f.search=${category}`,
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        content: `This course covers essential ${category.toLowerCase()} topics for level ${i + 1}.`
    };
});

let forumPosts = [
    { user: "Kwaku", content: "How do I code a game? It’s fun!", timestamp: "2025-03-21", aiModerated: "Positive 😊" },
    { user: "Ama", content: "Math is great!", timestamp: "2025-03-20", aiModerated: "Positive 😊" }
];

// Global AI Models
let aiModel = null;
let sentimentModel = null;

// Language Translation (Offline Fallback)
async function translateText(text, targetLang) {
    if (!navigator.onLine) return text; // Fallback to original text offline
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
    const data = await response.json();
    return data.responseData.translatedText || text;
}

async function changeLanguage(lang) {
    userData.language = lang;
    localStorage.setItem('userData', JSON.stringify(userData));

    const elements = document.querySelectorAll('[data-translate]');
    for (const element of elements) {
        const originalText = element.getAttribute('data-translate');
        const translatedText = await translateText(originalText, lang);
        element.textContent = translatedText;
    }
}

// Gamification Logic
function updateGamification(pointsEarned, action = "lesson") {
    userData.points += pointsEarned;
    if (userData.points >= userData.level * 100) {
        userData.level++;
        userData.badges.push(`Level ${userData.level} Achiever 🏆`);
        alert(`Level Up! You are now Level ${userData.level} 🎉`);
    }
    if (action === "forum") userData.forumPosts++;
    if (action === "courseComplete") userData.coursesCompleted++;
    if (action === "game") alert(`You earned ${pointsEarned} points for winning the game! 🌟`);
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Sign Up and Log In Logic
function showModal(type) {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('auth-form');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');

    if (modal && title && form && emailInput && passwordInput) {
        title.innerHTML = type === 'login' 
            ? '<i class="fas fa-sign-in-alt mr-2"></i>Login to EduEngage' 
            : '<i class="fas fa-user-plus mr-2"></i>Sign Up for EduEngage';
        modal.classList.remove('hidden');
        emailInput.value = '';
        passwordInput.value = '';
        passwordInput.disabled = false;
        passwordInput.focus();

        form.onsubmit = (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email) {
                alert('Please enter an email!');
                return;
            }

            if (type === 'signup') {
                userData = {
                    ...userData,
                    email: email,
                    username: email.split('@')[0],
                    password: password || "default"
                };
                localStorage.setItem('userData', JSON.stringify(userData));
                alert('Sign Up successful! Welcome to EduEngage! 🌟');
            } else {
                const storedData = JSON.parse(localStorage.getItem('userData')) || {};
                if (storedData.email === email) {
                    userData = storedData;
                    alert('Login successful! Welcome back! 🎉');
                } else {
                    alert('Email not found. Please sign up first!');
                    return;
                }
            }

            hideModal();
            window.location.href = 'dashboard.html';
        };
    }
}

function hideModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
}

// Menu Toggle and Logout Logic
function setupUI() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const logoutBtn = document.getElementById('logout');
    const isLoggedIn = localStorage.getItem('userData');

    if (sidebar) {
        if (window.location.pathname.includes('index.html') || !isLoggedIn) {
            sidebar.classList.add('hidden');
            if (menuToggle) menuToggle.classList.add('hidden');
        } else {
            sidebar.classList.remove('hidden');
            if (menuToggle) menuToggle.classList.remove('hidden');
        }
    }

    if (menuToggle && sidebar) {
        menuToggle.onclick = () => {
            sidebar.classList.toggle('-translate-x-full');
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('userData');
            window.location.href = 'index.html';
        };
    }

    // Show offline status
    const offlineStatus = document.createElement('div');
    offlineStatus.id = 'offline-status';
    offlineStatus.className = 'fixed bottom-4 right-4 bg-gray-700 text-white p-2 rounded-lg';
    offlineStatus.textContent = navigator.onLine ? 'Online 🌐' : 'Offline 📴';
    document.body.appendChild(offlineStatus);

    window.addEventListener('online', () => offlineStatus.textContent = 'Online 🌐');
    window.addEventListener('offline', () => offlineStatus.textContent = 'Offline 📴');
}

// Load Lesson Detail Page
function loadLessonDetail(lessonId) {
    const lesson = predefinedCourses.find(c => c.id === lessonId);
    if (lesson) {
        document.getElementById('lesson-title').textContent = lesson.title;
        document.getElementById('lesson-description').textContent = lesson.description;
        document.getElementById('lesson-difficulty').textContent = lesson.difficulty;
        document.getElementById('lesson-category').textContent = lesson.category;
        document.getElementById('lesson-video').src = navigator.onLine ? lesson.video : ''; // Fallback for offline
        document.getElementById('lesson-content').textContent = lesson.content;
        document.getElementById('lesson-progress-bar').style.width = `${lesson.progress}%`;
        if (!navigator.onLine) {
            const videoContainer = document.getElementById('lesson-video').parentElement;
            videoContainer.innerHTML = '<p class="text-center text-gray-300">Video unavailable offline. 📴</p>';
        }
    }
}

// Render Courses
function renderCourses(query = '') {
    const courseList = document.getElementById('course-list');
    if (!courseList) return;

    courseList.innerHTML = '';
    const courses = JSON.parse(localStorage.getItem('offlineCourses')) || predefinedCourses;
    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredCourses.length === 0) {
        courseList.innerHTML = '<p class="text-center">No courses found! Try a different search. 🔍</p>';
        return;
    }

    const grouped = filteredCourses.reduce((acc, course) => {
        acc[course.category] = acc[course.category] || [];
        acc[course.category].push(course);
        return acc;
    }, {});

    Object.keys(grouped).forEach(category => {
        const section = document.createElement('div');
        section.className = 'mb-8';
        section.innerHTML = `<h3 class="text-xl font-semibold mb-4"><i class="fas fa-book mr-2"></i>${category}</h3>`;
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4';
        
        grouped[category].forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card p-4 rounded-xl shadow-lg bg-gray-800 border border-white animate-fade-in-up';
            card.innerHTML = `
                <h4 class="text-lg font-semibold">${course.title}</h4>
                <p class="text-sm mt-1">${course.description}</p>
                <p class="text-xs mt-2 text-gray-300">Difficulty: ${course.difficulty} 🎓 | Style: ${course.learningStyle} 🧠</p>
                <div class="course-progress mt-3"><div class="course-progress-bar" style="width: ${course.progress}%"></div></div>
                <p class="text-xs mt-1">${course.progress}% Complete 📈</p>
                <button class="continue-btn mt-4 bg-gradient-to-r from-white to-gray-700 text-gray-900 px-4 py-2 rounded-full hover:from-gray-100 hover:to-gray-600 hover:scale-105 transition-all duration-300 shadow-lg w-full" data-course-id="${course.id}">${course.progress === 100 ? 'Review 📝' : 'Continue 🚀'}</button>
            `;
            grid.appendChild(card);
        });
        
        section.appendChild(grid);
        courseList.appendChild(section);
    });

    document.querySelectorAll('.continue-btn').forEach(btn => {
        btn.onclick = () => {
            const courseId = parseInt(btn.dataset.courseId);
            window.location.href = `lesson-detail.html?id=${courseId}`;
        };
    });
}

// Setup Search
function setupSearch() {
    const searchInput = document.getElementById('course-search');
    if (searchInput) {
        searchInput.oninput = (e) => {
            renderCourses(e.target.value);
        };
    }
}

// Setup Game
function setupGame() {
    const gameSubmit = document.getElementById('game-submit');
    const gameInput = document.getElementById('game-input');
    const gameFeedback = document.getElementById('game-feedback');
    const gameAttempts = document.getElementById('game-attempts');
    let targetNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;

    if (gameSubmit && gameInput && gameFeedback && gameAttempts) {
        gameSubmit.onclick = () => {
            const guess = parseInt(gameInput.value);
            attempts++;
            gameAttempts.textContent = `Attempts: ${attempts}`;

            if (!guess || guess < 1 || guess > 100) {
                gameFeedback.textContent = "Please enter a number between 1 and 100! 🤔";
            } else if (guess === targetNumber) {
                gameFeedback.textContent = `Congratulations! You guessed it in ${attempts} attempts! 🎉`;
                updateGamification(10, 'game');
                targetNumber = Math.floor(Math.random() * 100) + 1;
                attempts = 0;
                gameAttempts.textContent = `Attempts: 0`;
            } else if (guess < targetNumber) {
                gameFeedback.textContent = "Too low! Try a higher number. ⬆️";
            } else {
                gameFeedback.textContent = "Too high! Try a lower number. ⬇️";
            }
            gameInput.value = '';
        };
    }
}

// Setup Offline Mode
function setupOfflineMode() {
    const offlineToggle = document.getElementById('offline-toggle');
    if (offlineToggle) {
        offlineToggle.onchange = (e) => {
            if (e.target.checked) {
                alert('Offline mode enabled! All courses cached.');
                localStorage.setItem('offlineCourses', JSON.stringify(predefinedCourses));
            } else {
                alert('Offline mode disabled.');
            }
        };

        // Always cache courses on load
        localStorage.setItem('offlineCourses', JSON.stringify(predefinedCourses));
    }
}

// AI Model Training for Course Recommendations
async function trainAIModel(courses, userProgress, userLearningStyle) {
    try {
        const xs = tf.tensor2d(courses.map(course => [
            userProgress[course.id] || 0,
            course.difficulty === 'Beginner' ? 1 : course.difficulty === 'Intermediate' ? 2 : 3,
            course.learningStyle === userLearningStyle ? 1 : 0,
            course.progress / 100
        ]));
        const ys = tf.tensor2d(courses.map(course => [course.aiRecommended ? 1 : 0]));

        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [4] }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        await model.fit(xs, ys, { epochs: 10, shuffle: true, validationSplit: 0.2 });
        console.log('AI Model trained successfully');
        return model;
    } catch (error) {
        console.error('Error training AI model:', error);
        return null;
    }
}

// Get AI Recommendations
function getAIRecommendations(model, courses, userProgress, userLearningStyle) {
    if (!model) {
        console.warn('AI model not ready, using fallback');
        return courses.filter(c => c.aiRecommended).slice(0, 4);
    }
    try {
        const inputs = tf.tensor2d(courses.map(course => [
            userProgress[course.id] || 0,
            course.difficulty === 'Beginner' ? 1 : course.difficulty === 'Intermediate' ? 2 : 3,
            course.learningStyle === userLearningStyle ? 1 : 0,
            course.progress / 100
        ]));
        const predictions = model.predict(inputs);
        const scores = predictions.dataSync();
        const recommendations = courses.map((course, index) => ({
            ...course,
            score: scores[index]
        })).sort((a, b) => b.score - a.score);
        inputs.dispose();
        predictions.dispose();
        return recommendations.slice(0, 4);
    } catch (error) {
        console.error('Error getting AI recommendations:', error);
        return courses.filter(c => c.aiRecommended).slice(0, 4);
    }
}

// Predict Learning Pace
async function predictLearningPace(courses, userProgress) {
    try {
        const completed = courses.filter(c => (userProgress[c.id] || 0) >= 90).length;
        const avgProgress = courses.reduce((sum, c) => sum + (userProgress[c.id] || 0), 0) / courses.length;
        if (completed > courses.length / 2) return "Expert 🎓";
        if (avgProgress > 75) return "Fast 🚀";
        if (avgProgress > 50) return "Steady 🐢";
        return "Slow 🐌";
    } catch (error) {
        console.error('Error predicting learning pace:', error);
        return "Steady 🐢";
    }
}

// Sentiment Analysis Model
async function trainSentimentModel() {
    try {
        const trainingData = [
            { text: "I love this platform!", sentiment: 1 },
            { text: "This is terrible and boring", sentiment: 0 },
            { text: "Great job everyone!", sentiment: 1 },
            { text: "I hate this so much", sentiment: 0 },
            { text: "Pretty good experience", sentiment: 1 },
            { text: "Awful and confusing", sentiment: 0 }
        ];
        const vocab = [...new Set(trainingData.flatMap(d => d.text.toLowerCase().split(' ')))];
        const wordIndex = vocab.reduce((acc, word, idx) => ({ ...acc, [word]: idx + 1 }), {});
        const sequences = trainingData.map(d => d.text.toLowerCase().split(' ').map(word => wordIndex[word] || 0));
        const maxLen = Math.max(...sequences.map(s => s.length));
        const paddedSequences = sequences.map(seq => {
            const padded = new Array(maxLen).fill(0);
            seq.forEach((val, idx) => padded[idx] = val);
            return padded;
        });
        const xs = tf.tensor2d(paddedSequences);
        const ys = tf.tensor2d(trainingData.map(d => [d.sentiment]));
        const model = tf.sequential();
        model.add(tf.layers.embedding({ inputDim: vocab.length + 1, outputDim: 16, inputLength: maxLen }));
        model.add(tf.layers.lstm({ units: 32, returnSequences: false }));
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
        model.compile({ optimizer: tf.train.adam(0.002), loss: 'binaryCrossentropy', metrics: ['accuracy'] });
        await model.fit(xs, ys, { epochs: 10, shuffle: true, validationSplit: 0.2 });
        return { model, wordIndex, maxLen };
    } catch (error) {
        console.error('Error training sentiment model:', error);
        return null;
    }
}

// Moderate Forum Post
async function moderatePost(sentimentModel, text) {
    if (!sentimentModel) return "Neutral 😐";
    try {
        const { model, wordIndex, maxLen } = sentimentModel;
        const sequence = text.toLowerCase().split(' ').map(word => wordIndex[word] || 0);
        const padded = new Array(maxLen).fill(0);
        sequence.forEach((val, idx) => padded[idx] = val);
        const input = tf.tensor2d([padded]);
        const prediction = model.predict(input);
        const score = prediction.dataSync()[0];
        return score > 0.8 ? "Positive 😊" : score < 0.4 ? "Negative 😞" : "Neutral 😐";
    } catch (error) {
        console.error('Error moderating post:', error);
        return "Neutral 😐";
    }
}

// Chatbot Response
async function chatbotResponse(query, courses) {
    try {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('math')) {
            const mathCourses = courses.filter(c => c.category === 'Math').slice(0, 3).map(c => c.title).join(', ');
            return `Try our Math courses: ${mathCourses}! 🧠`;
        }
        if (lowerQuery.includes('science')) {
            const sciCourses = courses.filter(c => c.category === 'Science').slice(0, 3).map(c => c.title).join(', ');
            return `Check out Science courses: ${sciCourses}! 🔬`;
        }
        if (lowerQuery.includes('history')) {
            const histCourses = courses.filter(c => c.category === 'History').slice(0, 3).map(c => c.title).join(', ');
            return `Explore History with: ${histCourses}! 📜`;
        }
        if (lowerQuery.includes('programming') || lowerQuery.includes('code')) {
            const progCourses = courses.filter(c => c.category === 'Programming').slice(0, 3).map(c => c.title).join(', ');
            return `Master coding with: ${progCourses}! 💻`;
        }
        if (lowerQuery.includes('help')) return "I’m here! Ask me about courses, progress, or anything specific! 🤓";
        if (lowerQuery.includes('recommend')) {
            const recommended = courses.filter(c => c.aiRecommended).slice(0, 3).map(c => c.title).join(', ');
            return `I recommend: ${recommended}. Start learning now! 🚀`;
        }
        return "Not sure what you mean. Try asking about courses or your progress! 😊";
    } catch (error) {
        console.error('Error in chatbot response:', error);
        return "Oops, something went wrong. Try again! 😅";
    }
}

window.tfjs = {
    trainAIModel,
    getAIRecommendations,
    predictLearningPace,
    trainSentimentModel,
    moderatePost,
    chatbotResponse
};

// Initial Render
window.onload = async () => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData) userData = storedData;

    setupUI();
    setupOfflineMode();

    if (window.location.pathname.includes('index.html')) {
        const langSelect = document.getElementById('language-select');
        if (langSelect) langSelect.value = userData.language || "en";

        const signUpBtn = document.getElementById('signup-btn');
        const logInBtn = document.getElementById('login-btn');

        if (signUpBtn) signUpBtn.onclick = () => showModal('signup');
        if (logInBtn) logInBtn.onclick = () => showModal('login');
    }

    if (window.location.pathname.includes('dashboard.html')) {
        const usernameEl = document.getElementById('dashboard-username');
        const pointsEl = document.getElementById('points');
        const levelEl = document.getElementById('level');
        const aiInsightEl = document.getElementById('ai-insight');
        const chatbotBtn = document.getElementById('chatbot-btn');

        if (usernameEl) usernameEl.textContent = userData.username;
        if (pointsEl) pointsEl.textContent = userData.points;
        if (levelEl) levelEl.textContent = `Level ${userData.level}`;
        if (aiInsightEl) aiInsightEl.innerHTML = "Loading AI insights... 🤖";
        if (chatbotBtn) {
            chatbotBtn.onclick = async () => {
                const query = prompt("Ask your AI Tutor anything!");
                if (query) {
                    const response = await window.tfjs.chatbotResponse(query, predefinedCourses);
                    alert(response);
                }
            };
        }

        aiModel = await window.tfjs.trainAIModel(predefinedCourses, userData.progress, userData.learningStyle);
        sentimentModel = await window.tfjs.trainSentimentModel();

        if (aiModel) {
            const aiRecommendations = window.tfjs.getAIRecommendations(aiModel, predefinedCourses, userData.progress, userData.learningStyle);
            const learningPace = await window.tfjs.predictLearningPace(predefinedCourses, userData.progress);
            aiInsightEl.innerHTML = `AI suggests: ${aiRecommendations.map(c => c.title).join(', ')}<br>Learning Pace: ${learningPace}`;
        }
    }

    if (window.location.pathname.includes('lessons.html')) {
        renderCourses();
        setupGame();
        setupSearch();
    }

    if (window.location.pathname.includes('lesson-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const lessonId = parseInt(urlParams.get('id'));
        loadLessonDetail(lessonId);

        document.getElementById('mark-complete')?.addEventListener('click', () => {
            alert('Lesson marked as complete! 🎉');
            updateGamification(20, 'lesson');
        });
    }

    if (window.location.pathname.includes('forum.html')) {
        const postBtn = document.getElementById('post-btn');
        const postsSection = document.getElementById('forum-posts');
        const textArea = document.getElementById('forum-text');
        
        function renderPosts() {
            if (!postsSection) return;
            postsSection.innerHTML = '';
            forumPosts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'forum-post p-4 rounded-xl shadow-lg bg-gray-800 border border-white';
                postDiv.innerHTML = `<p><strong>${post.user}</strong> (${post.timestamp}): ${post.content} <span class="text-sm text-gray-300">${post.aiModerated}</span></p>`;
                postsSection.appendChild(postDiv);
            });
        }

        renderPosts();
        if (postBtn && textArea && postsSection) {
            postBtn.onclick = async () => {
                const content = textArea.value.trim();
                if (content) {
                    const moderation = sentimentModel ? await window.tfjs.moderatePost(sentimentModel, content) : "Neutral 😐";
                    const newPost = { user: userData.username, content, timestamp: new Date().toISOString().split('T')[0], aiModerated: moderation };
                    forumPosts.unshift(newPost);
                    updateGamification(10, 'forum');
                    textArea.value = '';
                    renderPosts();
                    alert('Post submitted successfully! 📢');
                } else {
                    alert('Please enter some text!');
                }
            };
        }
    }

    if (window.location.pathname.includes('profile.html')) {
        const profileEmail = document.getElementById('profile-email');
        const profilePoints = document.getElementById('profile-points');
        const profileLevel = document.getElementById('profile-level');
        const coursesCompleted = document.getElementById('courses-completed');
        const forumPostsEl = document.getElementById('forum-posts');
        const aiScore = document.getElementById('ai-score');
        const badgesDiv = document.getElementById('badges');
        const imageUpload = document.getElementById('image-upload');
        const profileImage = document.getElementById('profile-image');
        const usernameInput = document.getElementById('username-input');
        const saveProfileBtn = document.getElementById('save-profile');

        if (profileEmail) profileEmail.textContent = userData.email;
        if (profilePoints) profilePoints.textContent = userData.points;
        if (profileLevel) profileLevel.textContent = userData.level;
        if (coursesCompleted) coursesCompleted.textContent = userData.coursesCompleted;
        if (forumPostsEl) forumPostsEl.textContent = userData.forumPosts;
        if (aiScore) aiScore.textContent = `${Math.floor(Math.random() * 100)}%`;
        if (badgesDiv) {
            userData.badges.forEach(badge => {
                const badgeDiv = document.createElement('div');
                badgeDiv.className = 'badge';
                badgeDiv.innerHTML = `<span class="text-sm">${badge}</span>`;
                badgesDiv.appendChild(badgeDiv);
            });
        }
        if (profileImage) profileImage.src = userData.profileImage;
        if (usernameInput) usernameInput.value = userData.username;
        if (imageUpload) {
            imageUpload.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        userData.profileImage = event.target.result;
                        profileImage.src = userData.profileImage;
                    };
                    reader.readAsDataURL(file);
                }
            };
        }
        if (saveProfileBtn) {
            saveProfileBtn.onclick = () => {
                userData.username = usernameInput.value || userData.username;
                localStorage.setItem('userData', JSON.stringify(userData));
                alert('Profile saved successfully! 🌟');
            };
        }
    }
};
