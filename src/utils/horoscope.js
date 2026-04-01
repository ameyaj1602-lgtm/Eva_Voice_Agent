// Zodiac sign data with images, traits, compatibility

export const ZODIAC_DATA = {
  aries: {
    name: 'Aries', symbol: '\u2648', dates: 'Mar 21 - Apr 19', element: 'Fire',
    ruler: 'Mars', traits: ['Bold', 'Ambitious', 'Energetic', 'Competitive'],
    compatible: ['Leo', 'Sagittarius', 'Gemini'],
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=300&fit=crop',
    color: '#e74c3c',
  },
  taurus: {
    name: 'Taurus', symbol: '\u2649', dates: 'Apr 20 - May 20', element: 'Earth',
    ruler: 'Venus', traits: ['Reliable', 'Patient', 'Devoted', 'Sensual'],
    compatible: ['Virgo', 'Capricorn', 'Cancer'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    color: '#27ae60',
  },
  gemini: {
    name: 'Gemini', symbol: '\u264A', dates: 'May 21 - Jun 20', element: 'Air',
    ruler: 'Mercury', traits: ['Curious', 'Adaptable', 'Witty', 'Social'],
    compatible: ['Libra', 'Aquarius', 'Aries'],
    image: 'https://images.unsplash.com/photo-1475274047050-1d0c55b0033b?w=400&h=300&fit=crop',
    color: '#f39c12',
  },
  cancer: {
    name: 'Cancer', symbol: '\u264B', dates: 'Jun 21 - Jul 22', element: 'Water',
    ruler: 'Moon', traits: ['Intuitive', 'Emotional', 'Protective', 'Nurturing'],
    compatible: ['Scorpio', 'Pisces', 'Taurus'],
    image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=300&fit=crop',
    color: '#3498db',
  },
  leo: {
    name: 'Leo', symbol: '\u264C', dates: 'Jul 23 - Aug 22', element: 'Fire',
    ruler: 'Sun', traits: ['Confident', 'Dramatic', 'Generous', 'Loyal'],
    compatible: ['Aries', 'Sagittarius', 'Libra'],
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
    color: '#e67e22',
  },
  virgo: {
    name: 'Virgo', symbol: '\u264D', dates: 'Aug 23 - Sep 22', element: 'Earth',
    ruler: 'Mercury', traits: ['Analytical', 'Practical', 'Kind', 'Hardworking'],
    compatible: ['Taurus', 'Capricorn', 'Cancer'],
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    color: '#2ecc71',
  },
  libra: {
    name: 'Libra', symbol: '\u264E', dates: 'Sep 23 - Oct 22', element: 'Air',
    ruler: 'Venus', traits: ['Diplomatic', 'Fair', 'Romantic', 'Social'],
    compatible: ['Gemini', 'Aquarius', 'Leo'],
    image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&h=300&fit=crop',
    color: '#9b59b6',
  },
  scorpio: {
    name: 'Scorpio', symbol: '\u264F', dates: 'Oct 23 - Nov 21', element: 'Water',
    ruler: 'Pluto', traits: ['Passionate', 'Resourceful', 'Brave', 'Intense'],
    compatible: ['Cancer', 'Pisces', 'Virgo'],
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop',
    color: '#8e44ad',
  },
  sagittarius: {
    name: 'Sagittarius', symbol: '\u2650', dates: 'Nov 22 - Dec 21', element: 'Fire',
    ruler: 'Jupiter', traits: ['Optimistic', 'Adventurous', 'Honest', 'Philosophical'],
    compatible: ['Aries', 'Leo', 'Aquarius'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
    color: '#e74c3c',
  },
  capricorn: {
    name: 'Capricorn', symbol: '\u2651', dates: 'Dec 22 - Jan 19', element: 'Earth',
    ruler: 'Saturn', traits: ['Disciplined', 'Ambitious', 'Practical', 'Wise'],
    compatible: ['Taurus', 'Virgo', 'Pisces'],
    image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=300&fit=crop',
    color: '#2c3e50',
  },
  aquarius: {
    name: 'Aquarius', symbol: '\u2652', dates: 'Jan 20 - Feb 18', element: 'Air',
    ruler: 'Uranus', traits: ['Progressive', 'Original', 'Independent', 'Humanitarian'],
    compatible: ['Gemini', 'Libra', 'Sagittarius'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
    color: '#1abc9c',
  },
  pisces: {
    name: 'Pisces', symbol: '\u2653', dates: 'Feb 19 - Mar 20', element: 'Water',
    ruler: 'Neptune', traits: ['Compassionate', 'Artistic', 'Intuitive', 'Dreamy'],
    compatible: ['Cancer', 'Scorpio', 'Capricorn'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    color: '#3498db',
  },
};

export function getSignFromDate(month, day) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
}

// Generate lucky numbers for today
export function getLuckyNumbers() {
  const seed = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
  return [
    Math.abs(hash % 50) + 1,
    Math.abs((hash >> 4) % 50) + 1,
    Math.abs((hash >> 8) % 50) + 1,
  ];
}

export function getLuckyColor(sign) {
  const colors = {
    aries: 'Red', taurus: 'Green', gemini: 'Yellow', cancer: 'Silver',
    leo: 'Gold', virgo: 'Navy', libra: 'Pink', scorpio: 'Black',
    sagittarius: 'Purple', capricorn: 'Brown', aquarius: 'Blue', pisces: 'Sea Green',
  };
  return colors[sign] || 'White';
}
