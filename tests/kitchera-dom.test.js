import { describe, it, expect, beforeEach } from 'vitest';
import '../src/kitchera-core.js';
import dom from '../src/kitchera-dom.js';

function makeStars(count = 5) {
  document.body.innerHTML = Array.from({ length: count }, (_, i) =>
    `<span class="star" data-val="${i + 1}">★</span>`
  ).join('');
  return document.querySelectorAll('.star');
}

describe('paintStars', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('highlights stars up to the rating and clears the rest', () => {
    const stars = makeStars();
    dom.paintStars(stars, 3);
    const colors = Array.from(stars).map(s => s.style.color);
    expect(colors).toEqual([
      'rgb(245, 158, 11)', 'rgb(245, 158, 11)', 'rgb(245, 158, 11)',
      'rgb(255, 255, 255)', 'rgb(255, 255, 255)'
    ]);
    expect(stars[0].style.textShadow).not.toBe('none');
    expect(stars[4].style.textShadow).toBe('none');
  });

  it('clears all stars for a zero rating', () => {
    const stars = makeStars();
    dom.paintStars(stars, 3);
    dom.paintStars(stars, 0);
    expect(Array.from(stars).every(s => s.style.color === 'rgb(255, 255, 255)')).toBe(true);
  });

  it('accepts a string rating', () => {
    const stars = makeStars();
    dom.paintStars(stars, '2');
    expect(stars[1].style.color).toBe('rgb(245, 158, 11)');
    expect(stars[2].style.color).toBe('rgb(255, 255, 255)');
  });

  it('does not throw when there are no stars', () => {
    expect(() => dom.paintStars(document.querySelectorAll('.star'), 3)).not.toThrow();
    expect(() => dom.paintStars(undefined, 3)).not.toThrow();
  });
});

describe('setAddressVisibility', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input type="radio" name="visitType" value="home" id="home">
      <div id="addressContainer"></div>`;
  });

  it('shows the address field only for home visits', () => {
    const home = document.getElementById('home');
    const container = document.getElementById('addressContainer');

    home.checked = true;
    dom.setAddressVisibility(home, container);
    expect(container.style.display).toBe('block');

    home.checked = false;
    dom.setAddressVisibility(home, container);
    expect(container.style.display).toBe('none');
  });

  it('is a no-op when either element is missing', () => {
    const container = document.getElementById('addressContainer');
    expect(() => dom.setAddressVisibility(null, container)).not.toThrow();
    expect(container.style.display).toBe('');
    expect(() => dom.setAddressVisibility(document.getElementById('home'), null)).not.toThrow();
  });
});

describe('reviewCardHTML', () => {
  it('renders the initial, name, stars and text', () => {
    const html = dom.reviewCardHTML({ name: 'أحمد', rating: 4, text: 'ممتاز' });
    expect(html).toContain('>أ</div>');
    expect(html).toContain('أحمد');
    expect(html).toContain('ممتاز');
    expect(html.match(/fas fa-star/g)).toHaveLength(4);
  });

  it('escapes user supplied name and text', () => {
    const html = dom.reviewCardHTML({ name: '<b>x</b>', rating: 1, text: '<img src=x onerror=alert(1)>' });
    expect(html).not.toContain('<b>');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
  });

  it('falls back to a placeholder initial when the name is missing', () => {
    expect(dom.reviewCardHTML({ rating: 0 })).toContain('>م</div>');
  });

  it('tolerates an empty review object', () => {
    expect(() => dom.reviewCardHTML()).not.toThrow();
  });
});

describe('contractRowHTML', () => {
  it('numbers rows from one and shows the date', () => {
    const html = dom.contractRowHTML({ date: '2026-01-01' }, 0);
    expect(html).toContain('تعاقد رقم 1');
    expect(html).toContain('التاريخ: 2026-01-01');
  });

  it('shows a placeholder when the date is missing', () => {
    expect(dom.contractRowHTML({}, 1)).toContain('التاريخ: غير محدد');
    expect(dom.contractRowHTML({}, 1)).toContain('تعاقد رقم 2');
  });

  it('escapes the date value', () => {
    expect(dom.contractRowHTML({ date: '<b>x' }, 0)).toContain('&lt;b&gt;x');
  });
});

describe('nextVideoIndex', () => {
  it('advances and wraps forward', () => {
    expect(dom.nextVideoIndex(0, 1, 5)).toBe(1);
    expect(dom.nextVideoIndex(4, 1, 5)).toBe(0);
  });

  it('advances and wraps backward', () => {
    expect(dom.nextVideoIndex(1, -1, 5)).toBe(0);
    expect(dom.nextVideoIndex(0, -1, 5)).toBe(4);
  });

  it('stays at zero for an empty playlist', () => {
    expect(dom.nextVideoIndex(0, 1, 0)).toBe(0);
  });

  it('wraps large steps', () => {
    expect(dom.nextVideoIndex(0, 7, 5)).toBe(2);
    expect(dom.nextVideoIndex(0, -7, 5)).toBe(3);
  });
});
