(() => {
  'use strict';

  const products = [
    { id: 'kenwood-kmm-bt332u', title: 'Kenwood KMM-BT332U', category: 'audio', kind: 'Estéreo', brand: 'Kenwood', image: 'estereo-kenwood-kmm-bt332u.jpg', description: 'Un estéreo publicado por CAR TRONICS para explorar opciones de audio en tu vehículo. Consulta conexiones, compatibilidad e instalación antes de elegir.' },
    { id: 'jvc-kd-x280bt', title: 'JVC KD-X280BT', category: 'audio', kind: 'Estéreo', brand: 'JVC', image: 'estereo-jvc-kd-x280bt.jpg', description: 'Una alternativa de la selección de audio publicada por CAR TRONICS. El equipo puede orientarte sobre su integración con tu vehículo y el equipo que ya tienes.' },
    { id: 'imloya-r2', title: 'LED Imloya R2', category: 'iluminacion', kind: 'Focos LED', brand: 'Imloya', image: 'led-imloya-r2.jpg', description: 'Focos LED de la selección publicada por CAR TRONICS. Confirma el tipo de foco, la compatibilidad y la instalación adecuada para tu vehículo.' },
    { id: 'evolum-rocket', title: 'LED Evolum Rocket', category: 'iluminacion', kind: 'Focos LED', brand: 'Evolum', image: 'led-evolum-rocket.jpg', description: 'Una opción de iluminación publicada por CAR TRONICS. Consulta las variantes disponibles y cuál corresponde al sistema de iluminación de tu vehículo.' },
    { id: 'soundstream-bx10x', title: 'Soundstream BX-10X', category: 'audio', kind: 'Restaurador de bajo', brand: 'Soundstream', image: 'restaurador-soundstream-bx10x.jpg', description: 'Restaurador de bajo de la selección publicada por CAR TRONICS. Solicita orientación para revisar su función dentro de tu sistema de audio y sus conexiones.' },
    { id: 'sound-magus', title: 'Amplificador Sound Magus', category: 'audio', kind: 'Amplificador', brand: 'Sound Magus', image: 'amplificador-sound-magus.jpg', description: 'Amplificador mostrado en las publicaciones de CAR TRONICS. Consulta el modelo, la configuración y su compatibilidad con las bocinas y el sistema de tu vehículo.' },
    { id: 'imloya-r4', title: 'LED Imloya R4', category: 'iluminacion', kind: 'Focos LED', brand: 'Imloya', image: 'led-imloya-r4.jpg', description: 'Focos LED publicados por CAR TRONICS. Antes de decidir, confirma el formato de montaje, la compatibilidad y las opciones de instalación.' },
    { id: 'evolum-flame', title: 'LED Evolum Flame', category: 'iluminacion', kind: 'Focos LED', brand: 'Evolum', image: 'led-evolum-flame.jpg', description: 'Una alternativa de iluminación de la selección publicada por CAR TRONICS. Pregunta por las variantes adecuadas para tu vehículo y la disponibilidad actual.' },
    { id: 'blaupunkt-edison55', title: 'Blaupunkt Edison 55', category: 'audio', kind: 'Estéreo', brand: 'Blaupunkt', image: 'estereo-blaupunkt-edison55.jpg', description: 'Estéreo mostrado en el catálogo publicado de CAR TRONICS. Consulta las funciones del modelo, conexiones y adaptaciones necesarias para tu vehículo.' },
    { id: 'audiocontrol-epicenter', title: 'AudioControl The Epicenter', category: 'audio', kind: 'Restaurador de bajo', brand: 'AudioControl', image: 'restaurador-audiocontrol-epicenter.jpg', description: 'Una opción de procesamiento de audio publicada por CAR TRONICS. Revisa con el equipo cómo se integraría con la configuración y los objetivos de tu sistema.' },
    { id: 'tweeters-bullet', title: 'Tweeters tipo bullet', category: 'audio', kind: 'Tweeters', brand: '', image: 'tweeters-bullet-metal.jpg', description: 'Par de tweeters de acabado metálico mostrado por CAR TRONICS. Consulta marca, modelo y compatibilidad antes de incorporarlos a tu equipo.' },
    { id: 'war-audio-naranja', title: 'Tweeters WAR AUDIO', category: 'audio', kind: 'Tweeters', brand: 'WAR AUDIO', image: 'tweeters-aro-naranja.jpg', description: 'Tweeters con aro naranja publicados por CAR TRONICS. Confirma el modelo y la configuración recomendada para tu sistema de sonido.' },
    { id: 'war-audio-ctw', title: 'Tweeters WAR AUDIO CTW', category: 'audio', kind: 'Tweeters', brand: 'WAR AUDIO', image: 'tweeters-ctw.jpg', description: 'Una opción de tweeters de la selección publicada por CAR TRONICS. Consulta compatibilidad, montaje y las alternativas de instalación.' },
    { id: 'sp-audio-sptw18', title: 'SP Audio SPTW-18', category: 'audio', kind: 'Tweeters', brand: 'SP Audio', image: 'tweeters-spaudio-sptw18.jpg', description: 'Tweeters SP Audio mostrados en publicaciones de CAR TRONICS. Pregunta por el modelo, sus conexiones y la integración con tu equipo actual.' }
  ];

  const categories = { audio: 'Car audio', iluminacion: 'Iluminación LED' };
  const productById = new Map(products.map(product => [product.id, product]));
  const storageKey = 'cartronics-demo-selection-v1';
  const maximumSelection = 8;
  const pageSize = 6;
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-MX').trim();
  const summarize = product => ({ id: product.id, title: product.title, category: product.category });

  function initialize() {
    const grid = document.getElementById('catalog-grid');
    const search = document.getElementById('catalog-search');
    if (!grid || !search) return;

    const count = document.getElementById('catalog-count');
    const empty = document.getElementById('catalog-empty');
    const clearButton = document.getElementById('clear-catalog');
    const moreButton = document.getElementById('catalog-more');
    const filterButtons = [...document.querySelectorAll('[data-catalog-filter]')];
    const productDialog = document.getElementById('product-dialog');
    const productDialogBody = document.getElementById('product-dialog-body');
    const selectionDialog = document.getElementById('selection-dialog');
    const selectionList = document.getElementById('selection-items');
    const selectionEmpty = document.getElementById('selection-empty');
    const toQuoteButton = document.getElementById('selection-to-quote');
    const toast = document.getElementById('catalog-toast');
    const selected = new Set();
    const openers = new WeakMap();
    let category = 'all';
    let shownCount = pageSize;
    let toastTimer;
    let results = products;

    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(stored)) stored.filter(id => typeof id === 'string' && productById.has(id)).slice(0, maximumSelection).forEach(id => selected.add(id));
    } catch { /* A blocked or unavailable storage must not affect the catalogue. */ }

    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    };

    function announce(message) {
      if (!toast) return;
      clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.add('cat-toast-visible');
      toastTimer = setTimeout(() => toast.classList.remove('cat-toast-visible'), 4200);
    }

    function getSelection() {
      return [...selected].map(id => summarize(productById.get(id)));
    }

    function persistAndNotify() {
      try { localStorage.setItem(storageKey, JSON.stringify([...selected])); } catch { /* Selection still works in memory. */ }
      document.dispatchEvent(new CustomEvent('car:selection', { detail: { items: getSelection() } }));
    }

    function imageFor(product, className) {
      const image = element('img', className);
      image.src = `./assets/${product.image}`;
      image.alt = `${product.title}, fotografía publicada por CAR TRONICS`;
      image.width = 590;
      image.height = 443;
      image.loading = 'lazy';
      image.decoding = 'async';
      return image;
    }

    function syncToggleButtons() {
      document.querySelectorAll('[data-cat-toggle]').forEach(button => {
        const product = productById.get(button.dataset.catToggle);
        if (!product) return;
        const added = selected.has(product.id);
        button.setAttribute('aria-pressed', String(added));
        button.setAttribute('aria-label', `${added ? 'Quitar' : 'Añadir'} ${product.title} ${added ? 'de la' : 'a la'} consulta`);
        button.classList.toggle('cat-is-added', added);
        const label = button.querySelector('[data-cat-label]');
        const icon = button.querySelector('[data-cat-symbol]');
        if (label) label.textContent = added ? 'En tu consulta' : 'Añadir a consulta';
        if (icon) icon.textContent = added ? '✓' : '+';
      });
      document.querySelectorAll('[data-selection-count]').forEach(badge => { badge.textContent = String(selected.size); });
      document.querySelectorAll('[data-open-selection]').forEach(button => { button.setAttribute('aria-label', `Ver mi selección, ${selected.size} ${selected.size === 1 ? 'producto' : 'productos'}`); });
    }

    function toggleProduct(id) {
      const product = productById.get(id);
      if (!product) return;
      if (selected.has(id)) {
        selected.delete(id);
        announce(`${product.title} se quitó de tu consulta.`);
      } else {
        if (selected.size >= maximumSelection) { announce(`Puedes consultar hasta ${maximumSelection} productos a la vez. Quita uno de tu selección para añadir otro.`); return; }
        selected.add(id);
        announce(`${product.title} se añadió a tu consulta.`);
      }
      syncToggleButtons();
      renderSelection();
      persistAndNotify();
    }

    function addButtonFor(product) {
      const button = element('button', 'cat-add');
      button.type = 'button';
      button.dataset.catToggle = product.id;
      const label = element('span', '', 'Añadir a consulta');
      label.dataset.catLabel = '';
      const symbol = element('span', 'cat-add-symbol', '+');
      symbol.dataset.catSymbol = '';
      symbol.setAttribute('aria-hidden', 'true');
      button.append(label, symbol);
      return button;
    }

    function openDialog(dialog, opener) {
      if (!dialog) return;
      if (dialog.open) return;
      openers.set(dialog, opener || document.activeElement);
      dialog.showModal();
    }

    function closeDialog(dialog, restoreFocus = true) {
      if (!dialog) return;
      const opener = openers.get(dialog);
      openers.delete(dialog);
      dialog.close();
      if (restoreFocus && opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    }

    function showProduct(id, opener) {
      const product = productById.get(id);
      if (!product || !productDialog || !productDialogBody) return;
      const visual = element('div', 'cat-detail-visual');
      visual.append(imageFor(product, 'cat-detail-image'));
      const content = element('div', 'cat-detail-content');
      const label = element('p', 'cat-eyebrow', categories[product.category]);
      const heading = element('h2', 'cat-detail-title', product.title);
      heading.id = 'cat-product-title';
      const kind = element('p', 'cat-detail-kind', product.kind);
      const description = element('p', 'cat-detail-description', product.description);
      const price = element('p', 'cat-detail-price', 'Consultar precio');
      const caveat = element('p', 'cat-detail-note', 'Fotografía publicada por CAR TRONICS. Existencias, precio y compatibilidad sujetos a confirmación con el negocio.');
      content.append(label, heading, kind, description, price, addButtonFor(product), caveat);
      productDialogBody.replaceChildren(visual, content);
      productDialog.setAttribute('aria-labelledby', heading.id);
      syncToggleButtons();
      openDialog(productDialog, opener);
    }

    function cardFor(product) {
      const card = element('article', 'cat-card');
      const imageButton = element('button', 'cat-image-button');
      imageButton.type = 'button';
      imageButton.dataset.catDetails = product.id;
      imageButton.setAttribute('aria-label', `Ver imagen y detalles de ${product.title}`);
      imageButton.append(imageFor(product, 'cat-image'));
      const content = element('div', 'cat-content');
      const meta = element('div', 'cat-meta');
      meta.append(element('span', 'cat-category', categories[product.category]), element('span', 'cat-kind', product.kind));
      const heading = element('h3', 'cat-title');
      const detailButton = element('button', 'cat-title-button', product.title);
      detailButton.type = 'button';
      detailButton.dataset.catDetails = product.id;
      heading.append(detailButton);
      const bottom = element('div', 'cat-card-bottom');
      bottom.append(element('p', 'cat-price', 'Consultar precio'));
      const detailLink = element('button', 'cat-details-link', 'Ver detalles ↗');
      detailLink.type = 'button';
      detailLink.dataset.catDetails = product.id;
      detailLink.setAttribute('aria-label', `Ver detalles de ${product.title}`);
      bottom.append(detailLink);
      content.append(meta, heading, bottom, addButtonFor(product));
      card.append(imageButton, content);
      return card;
    }

    function renderProducts() {
      const query = normalize(search.value);
      const filtering = Boolean(query) || category !== 'all';
      results = products.filter(product => {
        if (category !== 'all' && product.category !== category) return false;
        return normalize(`${product.title} ${product.brand} ${product.kind} ${categories[product.category]}`).includes(query);
      });
      const visibleProducts = filtering ? results : results.slice(0, shownCount);
      const fragment = document.createDocumentFragment();
      visibleProducts.forEach(product => fragment.append(cardFor(product)));
      grid.replaceChildren(fragment);
      if (empty) empty.hidden = results.length !== 0;
      if (count) count.textContent = filtering ? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}` : `${products.length} productos · mostrando ${visibleProducts.length}`;
      if (clearButton) clearButton.hidden = !filtering;
      if (moreButton) {
        moreButton.hidden = filtering || visibleProducts.length >= results.length;
        moreButton.textContent = 'Ver más productos';
      }
      filterButtons.forEach(button => {
        const active = button.dataset.catalogFilter === category;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('cat-filter-active', active);
      });
      syncToggleButtons();
    }

    function renderSelection() {
      if (!selectionList) return;
      const fragment = document.createDocumentFragment();
      [...selected].forEach(id => {
        const product = productById.get(id);
        const row = element('div', 'cat-selected-row');
        row.append(imageFor(product, 'cat-selected-image'));
        const info = element('div', 'cat-selected-info');
        info.append(element('h3', '', product.title), element('p', '', `${categories[product.category]} · Consultar precio`));
        const removeButton = element('button', 'cat-remove', 'Quitar');
        removeButton.type = 'button';
        removeButton.dataset.catRemove = id;
        removeButton.setAttribute('aria-label', `Quitar ${product.title} de mi selección`);
        row.append(info, removeButton);
        fragment.append(row);
      });
      selectionList.replaceChildren(fragment);
      if (selectionEmpty) selectionEmpty.hidden = selected.size !== 0;
      if (toQuoteButton) toQuoteButton.disabled = selected.size === 0;
    }

    search.addEventListener('input', () => { shownCount = pageSize; renderProducts(); });
    filterButtons.forEach(button => button.addEventListener('click', () => {
      const next = button.dataset.catalogFilter;
      category = next === 'audio' || next === 'iluminacion' ? next : 'all';
      shownCount = pageSize;
      renderProducts();
    }));
    clearButton?.addEventListener('click', () => { search.value = ''; category = 'all'; shownCount = pageSize; renderProducts(); search.focus(); });
    moreButton?.addEventListener('click', () => {
      const previousCount = Math.min(shownCount, results.length);
      shownCount += pageSize;
      renderProducts();
      const nextCard = grid.children[previousCount];
      const nextButton = nextCard?.querySelector('button');
      if (nextButton) nextButton.focus({ preventScroll: true });
      nextCard?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    });

    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const details = event.target.closest('[data-cat-details]');
      if (details) { showProduct(details.dataset.catDetails, details); return; }
      const toggle = event.target.closest('[data-cat-toggle]');
      if (toggle) { toggleProduct(toggle.dataset.catToggle); return; }
      const remove = event.target.closest('[data-cat-remove]');
      if (remove) {
        const index = [...selectionList.querySelectorAll('[data-cat-remove]')].indexOf(remove);
        toggleProduct(remove.dataset.catRemove);
        const remaining = [...selectionList.querySelectorAll('[data-cat-remove]')];
        (remaining[Math.min(index, remaining.length - 1)] || selectionDialog?.querySelector('[data-close-dialog]'))?.focus();
        return;
      }
      const openSelection = event.target.closest('[data-open-selection]');
      if (openSelection) { renderSelection(); openDialog(selectionDialog, openSelection); return; }
      const close = event.target.closest('[data-close-dialog]');
      if (close) closeDialog(close.closest('dialog'));
    });

    [productDialog, selectionDialog].filter(Boolean).forEach(dialog => {
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
      });
      dialog.addEventListener('cancel', () => {
        const opener = openers.get(dialog);
        openers.delete(dialog);
        if (opener instanceof HTMLElement && opener.isConnected) requestAnimationFrame(() => opener.focus({ preventScroll: true }));
      });
    });

    toQuoteButton?.addEventListener('click', () => {
      closeDialog(selectionDialog, false);
      const target = document.getElementById('cotizar');
      if (!target) return;
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      const heading = target.querySelector('h2');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
      document.dispatchEvent(new CustomEvent('car:selection', { detail: { items: getSelection() } }));
    });

    window.carCatalog = Object.freeze({
      getSelection,
      clearSelection() { selected.clear(); syncToggleButtons(); renderSelection(); persistAndNotify(); },
      getProducts() { return products.map(summarize); }
    });
    renderProducts();
    renderSelection();
    setTimeout(persistAndNotify, 0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
