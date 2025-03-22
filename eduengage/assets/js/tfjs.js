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

// Get AI Recommendations (synchronous when model is ready)
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
        if (lowerQuery.includes('math')) return "Try our Math courses like Algebra Basics or Calculus I! 🧠";
        if (lowerQuery.includes('science')) return "Check out Science courses: Quantum Mechanics or Biology Basics! 🔬";
        if (lowerQuery.includes('history')) return "Explore History with World Wars or Ancient Rome! 📜";
        if (lowerQuery.includes('programming') || lowerQuery.includes('code')) {
            const progCourses = courses.filter(c => c.category === "Programming").map(c => c.title).join(', ');
            return `Master coding with ${progCourses}! 💻`;
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