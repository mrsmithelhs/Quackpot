import { mount } from './gallery.mjs';

const gallery = document.querySelector('#gallery');
for (const closeup of [false, true]) {
  const section = document.createElement('section');
  gallery.append(section);
  mount(section, closeup);
}
