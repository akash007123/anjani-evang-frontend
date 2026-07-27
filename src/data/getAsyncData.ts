import { api } from '../lib/api';
import type { Service, MenuItem, CateringPackage, Project, TeamMember, Testimonial, FAQItem, BlogPost, BlogComment, GalleryItem } from '../types';
import type { TestimonialItem } from './testimonialsData';

function mapService(item: any): Service {
  return {
    id: item._id || item.id,
    slug: item.slug,
    title: item.title,
    description: item.description || item.shortDescription || item.fullDescription || '',
    icon: item.icon || 'Sparkles',
    image: item.image || '',
    gallery: item.gallery || [],
    features: item.features || [],
    benefits: item.benefits || [],
  };
}

function mapMenuItem(item: any): MenuItem {
  const tags: string[] = [];
  if (item.cuisine) tags.push(item.cuisine);
  if (item.dietary) tags.push(item.dietary);
  if (item.chefSpecial) tags.push('Chef Special');
  if (item.featured) tags.push('Featured');

  return {
    id: item._id || item.id,
    name: item.name,
    category: item.category,
    price: item.price ?? 0,
    description: item.description || '',
    image: item.image || '',
    cuisine: item.cuisine || '',
    dietary: item.dietary || '',
    tags,
    isPopular: item.isPopular ?? item.popular ?? false,
    chefSpecial: Boolean(item.chefSpecial),
    featured: Boolean(item.featured),
    status: item.status || 'Active',
    displayOrder: item.displayOrder ?? 0,
  };
}

function mapPackage(item: any): CateringPackage {
  return {
    id: item._id || item.id,
    name: item.name,
    pricePerPerson: item.pricePerPerson ?? item.price ?? 0,
    minGuests: item.minGuests ?? 25,
    description: item.description || '',
    features: item.features || item.includedServices || [],
    isPopular: item.isPopular ?? item.popular ?? false,
    ribbonText: item.ribbonText || (item.popular ? 'Most Popular' : undefined),
    category: (item.category || 'Wedding') as CateringPackage['category'],
  };
}

function mapProject(item: any): Project {
  return {
    id: item._id || item.id,
    slug: item.slug || '',
    title: item.title,
    category: item.category || 'Wedding',
    client: item.client || '',
    date: item.date || item.eventDate || '',
    location: item.location || '',
    guestsCount: item.guestsCount ?? item.guestCount ?? 0,
    description: item.description || '',
    image: item.image || '',
    gallery: item.gallery || [],
    menuServed: item.menuServed || [],
  };
}

function mapGalleryItem(item: any): GalleryItem {
  return {
    id: item._id || item.id,
    type: item.type || 'image',
    title: item.title,
    description: item.description || '',
    category: item.category || 'Weddings',
    imageUrl: item.imageUrl || '',
    videoUrl: item.videoUrl || '',
    videoType: item.videoType || 'youtube',
    thumbnail: item.thumbnail || item.imageUrl || '',
    featured: Boolean(item.featured),
    displayOrder: item.displayOrder ?? 0,
    status: item.status || 'Active',
    createdAt: item.createdAt || '',
  };
}

function mapTeamMember(item: any): TeamMember {
  return {
    id: item._id || item.id,
    name: item.name,
    role: item.role || '',
    image: item.image || '',
    bio: item.bio || '',
    socials: {
      facebook: item.socials?.facebook || '',
      twitter: item.socials?.twitter || '',
      instagram: item.socials?.instagram || '',
      linkedin: item.socials?.linkedin || '',
    },
  };
}

function mapTestimonial(item: any): Testimonial {
  return {
    id: item._id || item.id,
    name: item.name || item.fullName || '',
    role: item.role || item.designation || '',
    company: item.company || '',
    image: item.image || item.avatar || '',
    feedback: item.feedback || item.comment || item.review || item.message || '',
    rating: item.rating || 5,
    eventType: item.eventType || '',
  };
}

function mapFAQ(item: any): FAQItem {
  return {
    id: item._id || item.id,
    question: item.question,
    answer: item.answer,
    category: item.category || 'General',
  };
}

function mapBlog(item: any): BlogPost {
  const author = typeof item.author === 'string'
    ? { name: item.author, avatar: '', role: '' }
    : item.author || { name: '', avatar: '', role: '' };
  return {
    id: item._id || item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt || '',
    content: item.content || '',
    image: item.image || item.featuredImage || '',
    date: item.date || item.publishDate || item.createdAt || '',
    author: {
      name: author.name || '',
      avatar: author.avatar || item.authorAvatar || '',
      role: author.role || '',
    },
    category: item.category || 'Catering Trends',
    tags: item.tags || [],
    commentsCount: item.commentsCount ?? 0,
  };
}

function extractList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    return data.data || data.gallery || data.items || data.services || data.packages || data.projects || data.members || data.testimonials || data.faqs || data.posts || data.blogs || data.contacts || data.orders || data.bookings || [];
  }
  return [];
}

export async function getServices(lang: string): Promise<Service[]> {
  try {
    const res = await api.getServices();
    if (res.success && res.data) {
      const list = extractList(res.data);
      if (list.length > 0) return list.map(mapService);
    }
  } catch {}
  return [];
}

export async function getServiceBySlug(slug: string, lang: string): Promise<Service | null> {
  try {
    const res = await api.getServiceBySlug(slug);
    if (res.success && res.data) return mapService(res.data);
  } catch {}
  return null;
}

export async function getMenuItems(lang: string): Promise<MenuItem[]> {
  try {
    const res = await api.getMenuItems({ limit: 999, status: 'Active' });
    if (res.success && res.data) {
      const list = extractList(res.data);
      if (list.length > 0) return list.map(mapMenuItem);
    }
  } catch {}
  return [];
}

export async function getPackages(lang: string): Promise<CateringPackage[]> {
  try {
    const res = await api.getPackages();
    if (res.success && res.data) {
      const list = extractList(res.data);
      if (list.length > 0) return list.map(mapPackage);
    }
  } catch {}
  return [];
}

export async function getProjects(lang: string): Promise<Project[]> {
  try {
    const res = await api.getProjects();
    if (res.success && res.data) {
      const list = extractList(res.data);
      if (list.length > 0) return list.map(mapProject);
    }
  } catch {}
  return [];
}

export async function getGalleryItems(lang: string): Promise<GalleryItem[]> {
  try {
    const res = await api.getGalleryItems({ limit: 999, status: 'Active', sortBy: 'displayOrder' });
    if (res.success && res.data) {
      const list = extractList(res.data);
      if (list.length > 0) return list.map(mapGalleryItem);
    }
  } catch {}
  return [];
}

export async function getProjectBySlug(slug: string, lang: string): Promise<Project | null> {
  try {
    const res = await api.getProjectBySlug(slug);
    if (res.success && res.data) return mapProject(res.data);
  } catch {}
  return null;
}

export async function getTeam(lang: string): Promise<TeamMember[]> {
  try {
    const res = await api.getTeam();
    if (res.success && res.data) {
      const list = extractList(res.data);
      if (list.length > 0) return list.map(mapTeamMember);
    }
  } catch {}
  return [];
}

export async function getTestimonials(lang: string): Promise<Testimonial[]> {
  try {
    const res = await api.getTestimonials();
    if (res.success && res.data) {
      const list = extractList(res.data);
      if (list.length > 0) return list.map(mapTestimonial);
    }
  } catch {}
  return [];
}

function mapToTestimonialItems(data: any[]): TestimonialItem[] {
  return data.map((item: any, idx: number) => ({
    id: item._id || item.id || `t-${idx}`,
    name: item.name || item.fullName || '',
    city: item.city || '',
    eventType: item.eventType || '',
    category: (item.category || 'Weddings') as TestimonialItem['category'],
    designation: item.designation || item.role || '',
    review: item.review || item.feedback || item.comment || item.message || '',
    rating: item.rating || 5,
    date: item.date || item.createdAt || '',
    avatar: item.avatar || item.image || '',
    eventImage: item.eventImage || item.image || '',
  }));
}

export async function getTestimonialsData(lang: string): Promise<TestimonialItem[]> {
  try {
    const res = await api.getTestimonials();
    if (res.success && res.data) {
      const list = extractList(res.data);
      if (list.length > 0) return mapToTestimonialItems(list);
    }
  } catch {}
  return [];
}

export async function getFAQs(lang: string): Promise<FAQItem[]> {
  try {
    const res = await api.getFAQs();
    if (res.success && res.data) {
      const list = extractList(res.data);
      if (list.length > 0) return list.map(mapFAQ);
    }
  } catch {}
  return [];
}

export async function getBlogs(lang: string): Promise<BlogPost[]> {
  try {
    const res = await api.getBlogs({ limit: 50 });
    if (res.success && res.data) {
      const list = extractList(res.data);
      if (list.length > 0) return list.map(mapBlog);
    }
  } catch {}
  return [];
}

export async function getBlogComments(blogId: string): Promise<BlogComment[]> {
  const res = await api.getBlogComments(blogId);
  return res.data || [];
}

export async function getBlogBySlug(slug: string, lang: string): Promise<BlogPost | null> {
  try {
    const res = await api.getBlogBySlug(slug);
    if (res.success && res.data) return mapBlog(res.data);
  } catch {}
  return null;
}
