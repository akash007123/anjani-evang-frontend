export interface NavSubItem {
  id: string;
  nameKey: string;
  path: string;
  iconName?: string;
  descriptionKey?: string;
}

export interface NavItem {
  id: string;
  nameKey: string;
  path?: string;
  dropdown?: NavSubItem[];
}

export const navigationConfig: NavItem[] = [
  {
    id: 'home',
    nameKey: 'home',
    path: '/',
  },
  {
    id: 'about',
    nameKey: 'about',
    path: '/about',
  },
  {
    id: 'services',
    nameKey: 'services',
    path: '/services',
  },
  {
    id: 'menu',
    nameKey: 'menu',
    path: '/menu',
  },
  {
    id: 'gallery',
    nameKey: 'gallery',
    path: '/gallery',
  },
  {
    id: 'explore',
    nameKey: 'explore',
    dropdown: [
      {
        id: 'packages',
        nameKey: 'packages',
        path: '/packages',
      },
      {
        id: 'projects',
        nameKey: 'projects',
        path: '/projects',
      },
      {
        id: 'blogs',
        nameKey: 'blog',
        path: '/blogs',
      },
      {
        id: 'team',
        nameKey: 'ourTeam',
        path: '/team',
      },
      {
        id: 'testimonials',
        nameKey: 'testimonials',
        path: '/testimonials',
      },
      {
        id: 'faqs',
        nameKey: 'faqs',
        path: '/faqs',
      },
    ],
  },
  {
    id: 'contact',
    nameKey: 'contact',
    path: '/contact',
  },
  {
    id: 'booking',
    nameKey: 'booking',
    path: '/booking',
  },
];

/**
 * Checks if a path is active against the current pathname.
 */
export function isPathActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/') {
    return pathname === '/';
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

/**
 * Checks if a dropdown item or any of its sub-items is active against current pathname.
 */
export function isDropdownActive(pathname: string, subItems: NavSubItem[]): boolean {
  return subItems.some((sub) => isPathActive(pathname, sub.path));
}
