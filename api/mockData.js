export const lawyers = [
  { id: 'laws-jhb-1', name: 'Moyo & Co. Attorneys', location: 'Johannesburg (Sandton)', specialties: ['Family Law', 'Divorce'], bio: 'Top family law practice in Sandton.', image_url: 'https://i.pravatar.cc/150?img=32', rating: 4.9, review_count: 28, packages: [] },
  { id: 'laws-jhb-2', name: 'Pretorius Legal', location: 'Johannesburg', specialties: ['Property', 'Conveyancing', 'Commercial Law'], bio: 'Trusted property and commercial lawyers in Johannesburg.', image_url: 'https://i.pravatar.cc/150?img=14', rating: 4.7, review_count: 41, packages: [] },
  { id: 'laws-cpt-1', name: 'Van Der Merwe Attorneys', location: 'Cape Town', specialties: ['Property', 'Labor', 'Employment'], bio: 'Cape Town based practice specialising in employment and property law.', image_url: 'https://i.pravatar.cc/150?img=12', rating: 4.8, review_count: 31, packages: [] },
  { id: 'laws-dbn-1', name: 'Khumalo Legal', location: 'Durban', specialties: ['Labor', 'CCMA', 'Family Law'], bio: 'Durban-based firm focusing on labor and CCMA matters.', image_url: 'https://i.pravatar.cc/150?img=27', rating: 4.6, review_count: 16, packages: [] },
];

export const packages = [
  { id: 1, lawyer_id: 'laws-jhb-1', title: '30 Minute Consultation', description: 'Quick call to discuss your family law case and next steps.', price: 500.00 },
  { id: 2, lawyer_id: 'laws-jhb-1', title: 'Full Representation (Divorce)', description: 'Full legal representation for divorce proceedings.', price: 8000.00 },
  { id: 3, lawyer_id: 'laws-jhb-2', title: 'Property Conveyancing', description: 'Handle your property transfer and registrations.', price: 3500.00 },
  { id: 4, lawyer_id: 'laws-cpt-1', title: 'Employment Review', description: 'Employment contract review and CCMA preparation.', price: 1200.00 },
  { id: 5, lawyer_id: 'laws-dbn-1', title: 'CCMA Representation', description: 'Representation for CCMA hearings and negotiation.', price: 2500.00 },
];
