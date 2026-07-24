export interface TestimonialItem {
  id: string;
  name: string;
  city: string;
  eventType: string;
  category: 'All' | 'Weddings' | 'Corporate Events' | 'Birthday Parties' | 'Anniversary Celebrations' | 'Housewarming' | 'Festival Catering' | 'Reception Events';
  designation: string;
  review: string;
  rating: number;
  date: string;
  avatar: string;
  eventImage: string;
}

export interface VideoTestimonial {
  id: string;
  name: string;
  eventType: string;
  city: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  reviewSnippet: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: string;
}

export const videoTestimonials: VideoTestimonial[] = [];
export const galleryItems: GalleryItem[] = [];
