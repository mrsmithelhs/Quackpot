import { mount } from './gallery.mjs';
const gallery=document.querySelector('#gallery');
for(const context of ['race','dex','selection']){const host=document.createElement('section');gallery.append(host);mount(host,context);}
