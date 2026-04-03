export function inferCourseTrack(course) {
  const category = String(course?.category || '').toLowerCase()
  const title = String(course?.title || '').toLowerCase()

  if (category.includes('quran') || category.includes('life') || title.includes('quran')) {
    return 'quran'
  }
  if (title.includes('python')) return 'python'
  if (title.includes('ai') || title.includes('machine learning') || title.includes('ml')) return 'ai-ml'
  if (title.includes('data structure') || title.includes('algorithm')) return 'data-structures'
  if (title.includes('backend') || title.includes('node') || title.includes('api')) return 'backend'
  return 'web-development'
}

export function getCourseThumbnail(course) {
  if (course?.thumbnail) return course.thumbnail
  const track = inferCourseTrack(course)
  const title = String(course?.title || '').toLowerCase()

  const topicImages = {
    python: [
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=675&fit=crop&auto=format',
    ],
    java: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=675&fit=crop&auto=format',
    ],
    c: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=1200&h=675&fit=crop&auto=format',
    ],
    ai: [
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1677442135136-760c813028c0?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=675&fit=crop&auto=format',
    ],
    ml: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=1200&h=675&fit=crop&auto=format',
    ],
    quran: [
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1542816417-0983671b8b7b?w=1200&h=675&fit=crop&auto=format',
    ],
    fullstack: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=1200&h=675&fit=crop&auto=format',
    ],
    default: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=675&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=675&fit=crop&auto=format',
    ],
  }

  let bucket = topicImages.default
  if (title.includes('python')) bucket = topicImages.python
  else if (title.includes('java')) bucket = topicImages.java
  else if (title === 'c course' || title.includes(' c ')) bucket = topicImages.c
  else if (title.includes('machine learning') || title.includes(' ml ')) bucket = topicImages.ml
  else if (title.includes('ai')) bucket = topicImages.ai
  else if (title.includes('quran') || track === 'quran') bucket = topicImages.quran
  else if (title.includes('full stack') || title.includes('mern')) bucket = topicImages.fullstack

  const idNum = Number.parseInt(String(course?.id || '1'), 10)
  const index = Number.isFinite(idNum) ? Math.abs(idNum) % bucket.length : 0
  return bucket[index]
}

export function getCourseFallbackThumbnail(course) {
  const track = inferCourseTrack(course)
  const fallbackByTrack = {
    'web-development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=675&fit=crop',
    python: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&h=675&fit=crop',
    'ai-ml': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=675&fit=crop',
    'data-structures': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=675&fit=crop',
    backend: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=675&fit=crop',
    quran: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1200&h=675&fit=crop',
  }
  return fallbackByTrack[track] || fallbackByTrack['web-development']
}

