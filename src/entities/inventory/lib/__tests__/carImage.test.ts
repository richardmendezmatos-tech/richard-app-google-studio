import { describe, it, expect } from 'vitest';
import { getCarImage, hasImage, PLACEHOLDER_IMAGE } from '../carImage';

describe('getCarImage', () => {
  it('usa car.image cuando está presente', () => {
    expect(getCarImage({ image: 'https://example.com/car.jpg', img: null, images: [] }))
      .toBe('https://example.com/car.jpg');
  });

  it('usa car.img como fallback cuando car.image es null', () => {
    expect(getCarImage({ image: null, img: '/img/alt.jpg', images: [] }))
      .toBe('/img/alt.jpg');
  });

  it('usa car.img como fallback cuando car.image es undefined', () => {
    expect(getCarImage({ img: '/img/alt.jpg', images: [] }))
      .toBe('/img/alt.jpg');
  });

  it('usa car.images[0] como fallback cuando image e img son null', () => {
    expect(getCarImage({ image: null, img: null, images: ['/img/array1.jpg', '/img/array2.jpg'] }))
      .toBe('/img/array1.jpg');
  });

  it('devuelve el placeholder cuando todas las fuentes son null/undefined', () => {
    expect(getCarImage({ image: null, img: null, images: [] }))
      .toBe(PLACEHOLDER_IMAGE);
  });

  it('devuelve el placeholder cuando el objeto está vacío', () => {
    expect(getCarImage({}))
      .toBe(PLACEHOLDER_IMAGE);
  });

  it('usa car.image aunque car.images tenga datos (prioridad correcta)', () => {
    expect(getCarImage({ image: '/img/primary.jpg', img: '/img/deprecated.jpg', images: ['/img/fallback.jpg'] }))
      .toBe('/img/primary.jpg');
  });

  it('usa car.img sobre car.images cuando image falta (prioridad correcta)', () => {
    expect(getCarImage({ image: null, img: '/img/deprecated.jpg', images: ['/img/fallback.jpg'] }))
      .toBe('/img/deprecated.jpg');
  });

  it('maneja images vacío', () => {
    expect(getCarImage({ image: null, img: null, images: [] }))
      .toBe(PLACEHOLDER_IMAGE);
  });

  it('maneja image como string vacío (falsy)', () => {
    const result = getCarImage({ image: '', img: '/img/fallback.jpg', images: [] });
    expect(result).not.toBe('');
    expect(result).toBe('/img/fallback.jpg');
  });
});

describe('hasImage', () => {
  it('retorna true cuando car.image existe', () => {
    expect(hasImage({ image: '/img/primary.jpg' })).toBe(true);
  });

  it('retorna true cuando car.img existe', () => {
    expect(hasImage({ img: '/img/fallback.jpg' })).toBe(true);
  });

  it('retorna true cuando car.images tiene elementos', () => {
    expect(hasImage({ images: ['/img/1.jpg'] })).toBe(true);
  });

  it('retorna false cuando no hay imágenes', () => {
    expect(hasImage({})).toBe(false);
  });

  it('retorna false cuando image/img son null y images vacío', () => {
    expect(hasImage({ image: null, img: null, images: [] })).toBe(false);
  });

  it('retorna false cuando todos los campos son null', () => {
    expect(hasImage({ image: null, img: null, images: null })).toBe(false);
  });
});
