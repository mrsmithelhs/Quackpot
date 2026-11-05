// Static historical copy is context only: it cannot create actions or deliveries.
export const MESSAGE_HISTORY = Object.freeze([
  { id: 'copy-counter', sender: 'Copy Counter', text: 'Your copies came out nicely. Thanks for stopping by!' },
  { id: 'lantern-laundry', sender: 'Lantern Laundry', text: 'Thanks for keeping the folding table clear!' },
  { id: 'kit', sender: 'Kit', text: 'The little duck by your window made me smile today.' },
  { id: 'mom', sender: 'Mom', text: 'Thinking of you. Hope your day has a good moment in it.' },
].map(Object.freeze));
