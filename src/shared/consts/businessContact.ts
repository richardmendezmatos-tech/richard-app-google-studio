/**
 * Richard Automotive / Central Ford
 * Official Business Contact Data for SEO and UI
 */

export const BUSINESS_CONTACT = {
  name: 'Richard Automotive - Central Ford',
  legalName: 'Central Ford Vega Alta',
  phone: '787-368-2880', // Richard's Confirmed Business Line
  locationPhone: '787-492-0790', // Dealership Office Line
  email: 'ventas@richard-automotive.com',
  address: {
    street: 'Carr. #2 KM 28.5, Bo. Espinosa',
    city: 'Vega Alta',
    state: 'PR',
    zip: '00692',
    country: 'US',
    full: 'Carr. #2 KM 28.5, Bo. Espinosa, Vega Alta, PR 00692',
  },
  geo: {
    latitude: 18.4069,
    longitude: -66.3353,
  },
  hours: {
    weekdays: '9:00 AM - 6:00 PM',
    saturday: '9:00 AM - 5:00 PM',
    sunday: 'Cerrado',
  },
  social: {
    facebook: 'https://facebook.com/richardautomotive',
    instagram: 'https://instagram.com/richardautomotive',
  },
  brands: ['Ford', 'Hyundai', 'Freightliner', 'Toyota', 'Honda', 'Nissan'],
};

export type BusinessContact = typeof BUSINESS_CONTACT;
