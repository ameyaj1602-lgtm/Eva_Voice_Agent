// All free APIs - no keys needed

const TIMEOUT = 5000;

function fetchSafe(url, opts = {}) {
  return Promise.race([
    fetch(url, opts),
    new Promise((_, r) => setTimeout(() => r(new Error('timeout')), TIMEOUT)),
  ]);
}

// --- Quotes ---
export async function getRandomQuote() {
  try {
    const res = await fetchSafe('https://zenquotes.io/api/random');
    const data = await res.json();
    if (data?.[0]) return { text: data[0].q, author: data[0].a };
  } catch {}
  return { text: "The only way out is through.", author: "Robert Frost" };
}

// --- Advice ---
export async function getRandomAdvice() {
  try {
    const res = await fetchSafe('https://api.adviceslip.com/advice');
    const data = await res.json();
    return data?.slip?.advice || "Take a deep breath and keep going.";
  } catch {
    return "Be kind to yourself today.";
  }
}

// --- Jokes ---
export async function getRandomJoke() {
  try {
    const res = await fetchSafe('https://v2.jokeapi.dev/joke/Pun,Misc?safe-mode&type=single');
    const data = await res.json();
    return data?.joke || "Why did the developer go broke? Because he used up all his cache!";
  } catch {
    return "I told my computer a joke... it crashed laughing.";
  }
}

export async function getTwoPartJoke() {
  try {
    const res = await fetchSafe('https://v2.jokeapi.dev/joke/Pun,Misc?safe-mode&type=twopart');
    const data = await res.json();
    if (data?.setup) return { setup: data.setup, delivery: data.delivery };
  } catch {}
  return { setup: "Why do programmers prefer dark mode?", delivery: "Because light attracts bugs!" };
}

// --- Random Facts ---
export async function getRandomFact() {
  try {
    const res = await fetchSafe('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
    const data = await res.json();
    return data?.text || "Honey never spoils. Archaeologists found 3000-year-old honey still edible!";
  } catch {
    return "Octopuses have three hearts and blue blood.";
  }
}

// --- Affirmations ---
export async function getRandomAffirmation() {
  try {
    const res = await fetchSafe('https://www.affirmations.dev/');
    const data = await res.json();
    return data?.affirmation || "You are capable of amazing things.";
  } catch {
    return "You are worthy of love and happiness.";
  }
}

// --- Bored API (activity suggestions) ---
export async function getBoredActivity() {
  try {
    const res = await fetchSafe('https://bored-api.appbrewery.com/random');
    const data = await res.json();
    return { activity: data?.activity, type: data?.type, participants: data?.participants };
  } catch {
    return { activity: 'Take a walk outside and notice 5 beautiful things', type: 'relaxation', participants: 1 };
  }
}

// --- Cat Pictures ---
export async function getRandomCat() {
  try {
    const res = await fetchSafe('https://api.thecatapi.com/v1/images/search');
    const data = await res.json();
    return data?.[0]?.url || null;
  } catch { return null; }
}

// --- Dog Pictures ---
export async function getRandomDog() {
  try {
    const res = await fetchSafe('https://dog.ceo/api/breeds/image/random');
    const data = await res.json();
    return data?.message || null;
  } catch { return null; }
}

// --- NASA Astronomy Picture of the Day ---
export async function getNasaAPOD() {
  try {
    const res = await fetchSafe('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
    const data = await res.json();
    return { title: data?.title, url: data?.url, explanation: data?.explanation?.slice(0, 200), mediaType: data?.media_type };
  } catch { return null; }
}

// --- Open Trivia ---
export async function getTriviaQuestion() {
  try {
    const res = await fetchSafe('https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986');
    const data = await res.json();
    const q = data?.results?.[0];
    if (!q) return null;
    const answers = [...q.incorrect_answers, q.correct_answer]
      .map(a => decodeURIComponent(a))
      .sort(() => Math.random() - 0.5);
    return {
      question: decodeURIComponent(q.question),
      answers,
      correct: decodeURIComponent(q.correct_answer),
      category: decodeURIComponent(q.category),
      difficulty: q.difficulty,
    };
  } catch { return null; }
}

// --- Kanye Quotes ---
export async function getKanyeQuote() {
  try {
    const res = await fetchSafe('https://api.kanye.rest/');
    const data = await res.json();
    return data?.quote || null;
  } catch { return null; }
}

// --- Unsplash Random Photo (mood-based) ---
export async function getUnsplashPhoto(query = 'nature calm') {
  try {
    const res = await fetchSafe(`https://source.unsplash.com/featured/800x600?${encodeURIComponent(query)}`);
    return res.url; // Redirects to actual image
  } catch { return null; }
}

// --- Weather (needs API key) ---
export async function getWeather(apiKey, lat, lon) {
  if (!apiKey) return null;
  try {
    const res = await fetchSafe(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();
    return {
      temp: Math.round(data.main?.temp),
      feels: Math.round(data.main?.feels_like),
      description: data.weather?.[0]?.description,
      icon: data.weather?.[0]?.icon,
      city: data.name,
      mood: getWeatherMood(data.weather?.[0]?.main),
    };
  } catch { return null; }
}

function getWeatherMood(condition) {
  const moods = {
    Clear: { emoji: '\u2600\uFE0F', suggestion: 'companion', text: "Beautiful day outside!" },
    Clouds: { emoji: '\u2601\uFE0F', suggestion: 'calm', text: "Cozy cloudy day, perfect for reflection." },
    Rain: { emoji: '\uD83C\uDF27\uFE0F', suggestion: 'lullaby', text: "Rain sounds... let's get cozy." },
    Drizzle: { emoji: '\uD83C\uDF26\uFE0F', suggestion: 'calm', text: "Light drizzle... peaceful vibes." },
    Thunderstorm: { emoji: '\u26C8\uFE0F', suggestion: 'calm', text: "Storm outside, calm inside with me." },
    Snow: { emoji: '\u2744\uFE0F', suggestion: 'lullaby', text: "Snowy and magical. Let's dream." },
    Mist: { emoji: '\uD83C\uDF2B\uFE0F', suggestion: 'philosopher', text: "Misty and mysterious... deep thoughts today?" },
    Haze: { emoji: '\uD83C\uDF2B\uFE0F', suggestion: 'calm', text: "Hazy day, let's find clarity together." },
  };
  return moods[condition] || moods.Clear;
}

// --- Wikipedia Summary ---
export async function getWikiSummary(topic) {
  try {
    const res = await fetchSafe(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    );
    const data = await res.json();
    return data?.extract || null;
  } catch { return null; }
}

// --- Horoscope ---
const HOROSCOPE_SIGNS = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
export { HOROSCOPE_SIGNS };

export async function getHoroscope(sign) {
  try {
    const res = await fetchSafe(`https://ohmanda.com/api/horoscope/${sign}/`);
    const data = await res.json();
    return data?.horoscope || null;
  } catch { return null; }
}
