const extraMaterialsByCode = {
  CS302: [
    { title: 'SQL Join Operations', source: 'YouTube', link: 'https://www.youtube.com/results?search_query=sql+joins+explained' },
    { title: 'Database Normalization', source: 'Free Website', link: 'https://www.geeksforgeeks.org/database-normalization/' },
  ],
  CS305: [
    { title: 'HTML, CSS, JavaScript Crash Course', source: 'YouTube', link: 'https://www.youtube.com/results?search_query=html+css+javascript+full+course' },
    { title: 'MDN Web Docs', source: 'Free Website', link: 'https://developer.mozilla.org/' },
  ],
  CS312: [
    { title: 'Python Basics', source: 'YouTube', link: 'https://www.youtube.com/results?search_query=python+basics+full+course' },
    { title: 'Python Tutorial', source: 'Free Website', link: 'https://docs.python.org/3/tutorial/' },
  ],
};

const extraMaterialsByCategory = {
  'Computer Science': [
    { title: 'DSA Practice', source: 'Free Website', link: 'https://leetcode.com/' },
  ],
  'B.Tech - AI': [
    { title: 'Intro to Machine Learning', source: 'YouTube', link: 'https://www.youtube.com/results?search_query=machine+learning+intro+course' },
  ],
  'Design': [
    { title: 'Design Thinking', source: 'Free Website', link: 'https://www.interaction-design.org/literature' },
  ],
};

export function getCourseMaterials(course) {
  if (!course) return [];
  const materials = [];

  if (course.learnLink) {
    materials.push({
      title: `${course.name} Free Course`,
      source: 'Free Website',
      link: course.learnLink,
    });
  }

  if (course.videoLink) {
    materials.push({
      title: `${course.name} Related Videos`,
      source: 'YouTube',
      link: course.videoLink,
    });
  }

  const byCode = extraMaterialsByCode[course.code] || [];
  const byCategory = extraMaterialsByCategory[course.category] || [];

  return [...materials, ...byCode, ...byCategory].map((item, index) => ({
    id: `${course.code}-${index}`,
    ...item,
  }));
}

