(() => {
  'use strict';
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reduceMotion.matches ? 'auto' : 'smooth';
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold:0.06});
    $$('.reveal').forEach(element => observer.observe(element));
  }
  const menuButton=$('.menu-button');
  const mobileNav=$('#mobile-nav');
  const toggleMenu=(open,restoreFocus=false)=>{
    mobileNav.hidden=!open;
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
    document.body.classList.toggle('menu-open',open);
    $('main').inert=open;
    $('.footer').inert=open;
    if(open) $('a',mobileNav).focus();
    else if(restoreFocus) menuButton.focus();
  };
  menuButton.addEventListener('click',()=>toggleMenu(menuButton.getAttribute('aria-expanded')!=='true'));
  $$('.mobile-nav a').forEach(link=>link.addEventListener('click',()=>toggleMenu(false)));
  document.addEventListener('keydown',event=>{
    if(menuButton.getAttribute('aria-expanded')!=='true') return;
    if(event.key==='Escape'){event.preventDefault();toggleMenu(false,true);}
    if(event.key==='Tab'){
      const links=$$('a',mobileNav);
      const first=links[0],last=links.at(-1);
      if(event.shiftKey && (document.activeElement===first || document.activeElement===menuButton)){event.preventDefault();last.focus();}
      else if(!event.shiftKey && document.activeElement===last){event.preventDefault();menuButton.focus();}
    }
  });
  matchMedia('(min-width:701px)').addEventListener('change',event=>{if(event.matches)toggleMenu(false);});
  document.addEventListener('click',event=>{if(event.target instanceof Element && event.target.closest('[data-open-selection]'))toggleMenu(false);});

  const form=$('#quote-form');
  const serviceLabels={audio:'Car audio',iluminacion:'Iluminación LED',seguridad:'Alarmas y seguridad',accesorios:'Accesorios'};
  const steps=$$('.quote-step');
  const indicators=$$('.step-indicator li');
  const next=$('#quote-next'),back=$('#quote-back'),submit=$('#quote-submit');
  let currentStep=0;
  let selectedProducts=window.carCatalog?.getSelection()||[];
  const chosenServices=()=>$$('input[name="service"]:checked',form).map(input=>input.value);
  const vehicle=()=>({type:$('input[name="vehicle"]:checked',form).value,brand:$('#car-brand').value.trim(),model:$('#car-model').value.trim(),year:$('#car-year').value.trim(),unsure:$('#vehicle-unsure').checked});
  const focusStep=()=>{
    const target=steps[currentStep].querySelector('legend');
    target.tabIndex=-1;
    target.focus({preventScroll:true});
    form.scrollIntoView({behavior:scrollBehavior(),block:'start'});
  };
  const showStep=(index,focus=false)=>{
    currentStep=Math.min(2,Math.max(0,index));
    steps.forEach((step,i)=>{step.hidden=i!==currentStep;});
    indicators.forEach((indicator,i)=>{
      indicator.classList.toggle('active',i===currentStep);
      indicator.classList.toggle('completed',i<currentStep);
      if(i===currentStep)indicator.setAttribute('aria-current','step');else indicator.removeAttribute('aria-current');
    });
    back.hidden=currentStep===0;
    next.hidden=currentStep===2;
    submit.hidden=currentStep!==2;
    if(focus)focusStep();
  };
  const validateService=()=>{
    const valid=chosenServices().length>0;
    $('#service-error').textContent=valid?'':'Selecciona al menos un servicio para continuar.';
    $$('input[name="service"]',form).forEach(input=>{
      if(!valid){input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby','service-error');}
      else{input.removeAttribute('aria-invalid');input.removeAttribute('aria-describedby');}
    });
    return valid;
  };
  const validateVehicle=()=>{
    const data=vehicle();
    const values=[['#car-brand',Boolean(data.brand)],['#car-model',Boolean(data.model)],['#car-year',/^\d{4}$/.test(data.year)&&Number(data.year)>=1950&&Number(data.year)<=2028]];
    values.forEach(([selector,valid])=>$(selector).setAttribute('aria-invalid',String(!data.unsure&&!valid)));
    const valid=data.unsure||values.every(([,valid])=>valid);
    $('#vehicle-error').textContent=valid?'':'Completa marca, modelo y un año entre 1950 y 2028, o elige confirmar los datos por WhatsApp.';
    return valid;
  };
  const updateSummary=()=>{
    const services=chosenServices();
    $('#summary-services').textContent=services.length?services.map(id=>serviceLabels[id]).join(' · '):'Elige lo que quieres mejorar';
    const data=vehicle();
    $('#summary-vehicle').textContent=data.unsure?`${data.type} · Datos por confirmar`:[data.type,data.brand,data.model,data.year].filter(Boolean).join(' · ')+(data.brand||data.model||data.year?'':' · Por completar');
    const list=$('#summary-products');
    list.replaceChildren();
    if(!selectedProducts.length){const empty=document.createElement('li');empty.className='summary-placeholder';empty.textContent='Puedes añadirlos desde el catálogo.';list.append(empty);}
    else selectedProducts.forEach(product=>{const item=document.createElement('li');item.textContent=product.title;list.append(item);});
  };
  const syncProducts=items=>{
    selectedProducts=Array.isArray(items)?items.filter(item=>item&&typeof item.id==='string'&&typeof item.title==='string'&&Object.hasOwn(serviceLabels,item.category)).slice(0,8):[];
    selectedProducts.forEach(item=>{const input=$(`input[name="service"][value="${item.category}"]`,form);if(input)input.checked=true;});
    if(chosenServices().length)validateService();
    updateSummary();
  };
  document.addEventListener('car:selection',event=>syncProducts(event.detail?.items));
  form.addEventListener('input',()=>{
    updateSummary();
    if(chosenServices().length)validateService();
    $('#date-error').textContent='';
    $('#preferred-date').removeAttribute('aria-invalid');
    const status=$('#quote-status');
    if(status.textContent)status.textContent='';
  });
  $('#vehicle-unsure').addEventListener('change',()=>{
    const unsure=$('#vehicle-unsure').checked;
    ['#car-brand','#car-model','#car-year'].forEach(selector=>{$(selector).disabled=unsure;$(selector).removeAttribute('aria-invalid');});
    $('#vehicle-error').textContent='';
    updateSummary();
  });
  next.addEventListener('click',()=>{
    if(currentStep===0&&!validateService()){ $('input[name="service"]',form).focus();return; }
    if(currentStep===1&&!validateVehicle()){const first=$('[aria-invalid="true"]',steps[1]);first?.focus();return;}
    showStep(currentStep+1,true);
  });
  back.addEventListener('click',()=>showStep(currentStep-1,true));
  $$('[data-add-service]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.addService;
    if(!Object.hasOwn(serviceLabels,id))return;
    $(`input[name="service"][value="${id}"]`,form).checked=true;
    $('#service-error').textContent='';
    showStep(0);
    updateSummary();
    $('#cotizar').scrollIntoView({behavior:scrollBehavior(),block:'start'});
  }));
  function createMessage(){
    const data=vehicle();
    const name=$('#customer-name').value.trim();
    const message=$('#project-message').value.trim();
    const date=$('#preferred-date').value;
    const prettyDate=/^\d{4}-\d{2}-\d{2}$/.test(date)?date.split('-').reverse().join('/'):'';
    const services=chosenServices().map(id=>serviceLabels[id]);
    return [
      'Hola, CAR TRONICS. Me gustaría consultar un proyecto para mi vehículo.',
      name?`Mi nombre: ${name}`:'',
      `Me interesa: ${services.length?services.join(', '):'Recibir orientación del taller'}.`,
      `Vehículo: ${data.type}${data.unsure?' · Confirmaré los datos por WhatsApp':(data.brand||data.model||data.year?' · '+[data.brand,data.model,data.year].filter(Boolean).join(' '):' · Datos por confirmar')}.`,
      selectedProducts.length?'Productos de interés:\n'+selectedProducts.map(item=>`• ${item.title}`).join('\n'):'',
      message?`Mi idea: ${message}`:'',
      prettyDate?`Fecha de preferencia: ${prettyDate} (sujeta a confirmación).`:'',
      '¿Me pueden confirmar compatibilidad, disponibilidad, precio e instalación?'
    ].filter(Boolean).join('\n\n');
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!validateService()){showStep(0,true);return;}
    if(!validateVehicle()){showStep(1,true);return;}
    const dateInput=$('#preferred-date');
    if(dateInput.value && (!dateInput.checkValidity() || dateInput.value<dateInput.min)){
      showStep(2,true);
      $('#date-error').textContent='Elige hoy o una fecha futura como preferencia, o deja el campo vacío.';
      dateInput.setAttribute('aria-invalid','true');
      dateInput.focus();
      return;
    }
    $('#date-error').textContent='';
    dateInput.removeAttribute('aria-invalid');
    const link=document.createElement('a');
    link.href='https://wa.me/523312365195?text='+encodeURIComponent(createMessage());
    link.target='_blank';
    link.rel='noopener noreferrer';
    document.body.append(link);link.click();link.remove();
    $('#quote-status').textContent='Tu consulta está preparada. Confirma el envío dentro de WhatsApp.';
  });
  $('#copy-brief').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(createMessage());$('#quote-status').textContent='Resumen copiado. Puedes pegarlo donde prefieras.';}
    catch{$('#quote-status').textContent='El navegador no permitió copiar. Puedes abrir tu consulta en WhatsApp al completar los pasos.';}
  });
  const dateParts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const parts=Object.fromEntries(dateParts.filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
  $('#preferred-date').min=`${parts.year}-${parts.month}-${parts.day}`;
  const weekday=new Intl.DateTimeFormat('es-MX',{timeZone:'America/Mexico_City',weekday:'long'}).format(new Date());
  const opening=weekday==='domingo'?'11:00–15:00':weekday==='sábado'?'10:00–17:00':'10:00–19:00';
  $('#today-hours').textContent=`Horario publicado para hoy, ${weekday}: ${opening}.`;
  form.noValidate=true;
  next.disabled=false;
  submit.disabled=false;
  syncProducts(selectedProducts);
  showStep(0);

  const openDialog=id=>$(id).showModal();
  $('#privacy-open').addEventListener('click',()=>openDialog('#privacy-dialog'));
  $('#sources-open').addEventListener('click',()=>openDialog('#sources-dialog'));
  ['#privacy-dialog','#sources-dialog'].forEach(id=>{
    const dialog=$(id);
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
  });
  $('#load-map').addEventListener('click',()=>{
    const iframe=document.createElement('iframe');
    iframe.title='Mapa de CAR TRONICS en Ing. Pastor Rouaix 376-B, Zapopan';
    iframe.src='https://maps.google.com/maps?q='+encodeURIComponent('Car Tronics Ing. Pastor Rouaix 376B Constitución Zapopan Jalisco')+'&output=embed';
    iframe.loading='lazy';
    iframe.referrerPolicy='no-referrer-when-downgrade';
    iframe.allowFullscreen=true;
    $('#location-map').replaceChildren(iframe);
  });
  let quoteVisible=false,ticking=false;
  const floating=$('.floating-contact');
  const updateProgress=()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    $('.progress-line').style.width=`${max>0?Math.min(100,scrollY/max*100):0}%`;
    const hide=scrollY<350||quoteVisible||Boolean($('dialog[open]'));
    floating.classList.toggle('is-hidden',hide);
    floating.inert=hide;
    floating.tabIndex=hide?-1:0;
    floating.setAttribute('aria-hidden',String(hide));
    ticking=false;
  };
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{quoteVisible=entries[0].isIntersecting;updateProgress();},{threshold:0.1});observer.observe($('#cotizar'));}
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateProgress);ticking=true;}},{passive:true});
  addEventListener('resize',updateProgress,{passive:true});
  document.addEventListener('click',()=>requestAnimationFrame(updateProgress));
  $$('dialog').forEach(dialog=>dialog.addEventListener('close',updateProgress));
  updateProgress();
})();
