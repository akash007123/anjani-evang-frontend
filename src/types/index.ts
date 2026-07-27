export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  socials: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  gallery: string[];
  features: string[];
  benefits: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  cuisine: string;
  dietary: string;
  tags: string[];
  isPopular?: boolean;
  chefSpecial?: boolean;
  featured?: boolean;
  status?: string;
  displayOrder?: number;
}

export interface CateringPackage {
  id: string;
  name: string;
  pricePerPerson: number;
  minGuests: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  ribbonText?: string;
  category: 'Wedding' | 'Corporate' | 'Social' | 'Buffet';
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  client: string;
  date: string;
  location: string;
  guestsCount: number;
  description: string;
  image: string;
  gallery: string[];
  menuServed: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  image: string;
  rating: number;
  feedback: string;
  eventType: string;
}

export interface FAQItem {
  id: string;
  category: 'General' | 'Pricing' | 'Services' | 'Menu';
  question: string;
  answer: string;
}

export interface BlogComment {
  _id: string;
  blogId: string;
  parentCommentId?: string | null;
  isReply?: boolean;
  name: string;
  email?: string;
  mobile?: string;
  profileImage?: string;
  comment: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  replyCount?: number;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  videoUrl: string;
  videoType: 'mp4' | 'youtube' | 'vimeo';
  thumbnail: string;
  featured: boolean;
  displayOrder: number;
  status: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[];
  commentsCount: number;
}
