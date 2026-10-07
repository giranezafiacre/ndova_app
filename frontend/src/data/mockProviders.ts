export interface MockProvider {
  image: string;
  serviceType: string;
  providerName: string;
  description: string;
  rating: number;
  reviews: number;
  location: string;
  badge: string | null;
  durationMinutes: number;
}

export const mockProviders: MockProvider[] = [
  {
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&auto=format&fit=crop&q=80',
    serviceType: 'Medical Consultation',
    providerName: 'Dr. Amina Uwase',
    description: 'Specialist in general medicine and preventive healthcare with 10+ years of experience in Kigali. Offers in-person and virtual consultations.',
    rating: 4.9, reviews: 124, location: 'Kacyiru, Kigali', badge: 'Top Rated', durationMinutes: 30,
  },
  {
    image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&auto=format&fit=crop&q=80',
    serviceType: 'Legal Advisory',
    providerName: 'Me. Jean Habimana',
    description: 'Corporate law and commercial contracts specialist with 8 years serving businesses in Rwanda.',
    rating: 4.7, reviews: 89, location: 'CBD, Kigali', badge: 'Verified', durationMinutes: 60,
  },
  {
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
    serviceType: 'Accounting & Tax',
    providerName: 'Grace Mukamana CPA',
    description: 'Certified public accountant offering tax filing, bookkeeping, and financial advisory services.',
    rating: 4.8, reviews: 67, location: 'Kimironko, Kigali', badge: 'Certified', durationMinutes: 45,
  },
  {
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
    serviceType: 'Architecture & Design',
    providerName: 'Eric Niyomugabo',
    description: 'Award-winning architect specialising in modern residential and commercial design in East Africa.',
    rating: 4.6, reviews: 42, location: 'Nyarutarama, Kigali', badge: null, durationMinutes: 90,
  },
  {
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80',
    serviceType: 'Civil Engineering',
    providerName: 'Eng. Patrick Nzabonimpa',
    description: 'Structural engineer with expertise in reinforced concrete buildings and road construction projects.',
    rating: 4.5, reviews: 38, location: 'Remera, Kigali', badge: null, durationMinutes: 60,
  },
  {
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    serviceType: 'Software Development',
    providerName: 'Alice Iradukunda',
    description: 'Full-stack developer building web and mobile solutions for startups and SMEs across Rwanda.',
    rating: 5.0, reviews: 56, location: 'Kacyiru, Kigali', badge: 'Top Rated', durationMinutes: 60,
  },
  {
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
    serviceType: 'Education & Tutoring',
    providerName: 'Prof. Claude Bizimana',
    description: 'Mathematics and sciences tutor with 12 years helping students prepare for national exams.',
    rating: 4.8, reviews: 101, location: 'Gisozi, Kigali', badge: 'Verified', durationMinutes: 60,
  },
  {
    image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&auto=format&fit=crop&q=80',
    serviceType: 'Dental Care',
    providerName: 'Dr. Marie Uwimana',
    description: 'General and cosmetic dentistry including whitening, implants, and orthodontic treatments.',
    rating: 4.9, reviews: 78, location: 'Kiyovu, Kigali', badge: 'Top Rated', durationMinutes: 45,
  },
  {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
    serviceType: 'Physiotherapy',
    providerName: 'Kevin Tuyishime PT',
    description: 'Licensed physiotherapist specialising in sports injury rehabilitation and chronic pain management.',
    rating: 4.7, reviews: 53, location: 'Kimihurura, Kigali', badge: 'Certified', durationMinutes: 60,
  },
  {
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80',
    serviceType: 'Real Estate',
    providerName: 'Sandra Keza',
    description: 'Real estate agent helping clients buy, sell, and rent properties across greater Kigali.',
    rating: 4.6, reviews: 91, location: 'Gasabo, Kigali', badge: null, durationMinutes: 30,
  },
];
