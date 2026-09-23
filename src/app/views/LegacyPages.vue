<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { apiFetch, getAuthToken, getStoredUser, listFrom, money } from '../services/api';
import { showAlert, showError } from '../services/alerts';
import { legacyMarkup } from './legacyMarkup';
const pageScriptModules = import.meta.glob('./legacyScripts/*.js', { import: 'legacyScripts' });

const file = location.pathname.split('/').pop() || '';
const page = computed(() => query.get('page') || (query.get('view') && query.get('view') !== 'legacy' ? query.get('view') : (file === 'index.html' || !file ? 'home' : file.replace('.html', ''))));
const originalBodyAttrs = ref('');
const markup = computed(() => {
  const source = legacyMarkup[page.value] || legacyMarkup.home;
  let html = source.html;
  if (page.value === 'rankoverview') {
    html = html.replace('href="rankdelivery.html"', 'aria-disabled="true" tabindex="-1"');
  }
  const routes = ['about','contact','add-product','checkout','choosedelivery','confirmation','createshipment','deliverytracker','rankdelivery','rankoverview','subscription','track-order','users','vendor-dashboard','vendors','vendor','cart','login'];
  for (const route of routes) {
    html = html.replaceAll(`href="${route}.html"`, `href="index.html?view=${route}"`);
    html = html.replaceAll(`href="${route}.html?`, `href="index.html?view=${route}&`);
    html = html.replaceAll(`href="${route}.html#`, `href="index.html?view=${route}#`);
  }
  html = html.replaceAll('href="vendor.html?id=', 'href="index.html?view=vendor&id=');
  return { ...source, html: remapLegacyLinks(html) };
});
const query = new URLSearchParams(location.search);
const user = ref(getStoredUser() || {});
const data = reactive({ cart: {}, methods: [], plans: [], orders: [], items: [], points: [], following: [], vendor: null, order: null, stats: {}, profile: {}, selected: '', search: '', busy: false, error: '' });
const form = reactive({ name: user.value.name || '', email: user.value.email || '', phone: user.value.phone || '', address: '', city: '', postal_code: '', message: '', topic: 'General enquiry', password: '', category: '', price: '', stock: '', description: '', plan: '' });
const titles = { about:'Built for local businesses',contact:'Get in touch', 'add-product':'Add a New Product',checkout:'Checkout',choosedelivery:'Choose Delivery Method',confirmation:'Order confirmed',createshipment:'Create Shipment',deliverytracker:'Order Tracker',rankdelivery:'RankDrop Pickup Points',rankoverview:'RankDrop Overview',subscription:'Plans','track-order':'Track your order',users:'My Profile','vendor-dashboard':'Vendor Dashboard' };
const title = computed(() => titles[page.value] || 'LocalCart');
const notify = (icon, title, text) => showAlert({ icon, title, text });
const go = (view, params = '') => { location.href = `index.html?view=${view}${params}`; };
async function load() {
  try {
    if (page.value === 'checkout' && query.get('subscription') === 'true') {
      const pending = JSON.parse(localStorage.getItem('pendingSubscription') || 'null');
      if (query.get('status') === 'success' && pending) { await apiFetch('/subscriptions/subscribe',{method:'POST',body:JSON.stringify({planSlug:pending.slug,planId:pending.id})}); localStorage.removeItem('pendingSubscription'); await notify('success','Subscription activated','Your vendor plan is active.'); go('legacy','&page=vendor-dashboard'); return; }
      if (query.get('status') === 'cancelled') { await notify('info','Payment cancelled','Your subscription was not activated.'); return; }
      data.selected = 'subscription'; return;
    }
    if (page.value === 'checkout' || page.value === 'choosedelivery') { const r = await apiFetch('/cart'); data.cart = r.data || {}; }
    if (page.value === 'checkout' && !getAuthToken()) { await notify('warning','Please log in','You need to sign in before checking out.'); go('login'); return; }
    if (page.value === 'choosedelivery') data.methods = listFrom(await apiFetch('/delivery/methods'));
    if (page.value === 'subscription') { data.plans = listFrom(await apiFetch('/subscriptions/plans')); data.profile = await apiFetch('/subscriptions/me').catch(() => null); }
    if (page.value === 'track-order') data.order = (await apiFetch(`/orders/track/${encodeURIComponent(query.get('order') || '')}`)).data;
    if (page.value === 'confirmation') { const r = await apiFetch(`/orders/number/${encodeURIComponent(query.get('order') || '')}`); data.order = r.data; }
    if (page.value === 'users') { const r = await apiFetch('/users/profile'); user.value = r.user || r.data || r; data.following = listFrom(await apiFetch('/users/following')); }
    if (page.value === 'vendor-dashboard') { const r = await apiFetch('/auth/me'); user.value = r.user || r; data.vendor = user.value.vendor || user.value; data.stats = (await apiFetch('/analytics/vendor/summary')).data || {}; data.orders = listFrom(await apiFetch('/analytics/vendor/orders'), ['orders']); }
    if (page.value === 'deliverytracker') data.orders = listFrom(await apiFetch('/analytics/vendor/orders'), ['orders']);
    if (page.value === 'createshipment') data.orders = listFrom(await apiFetch('/shipments/unshipped'), ['orders']);
    if (page.value === 'rankoverview') { const [stats, recent] = await Promise.all([apiFetch('/shipments/vendor/stats'), apiFetch('/shipments/vendor/recent')]); data.stats = stats.data || stats; data.items = listFrom(recent); }
    if (page.value === 'rankdelivery') data.points = listFrom(await apiFetch('/shipments/pickup-points'));
  } catch (e) { data.error = e.message; if (page.value === 'rankdelivery') await showError(new Error('Pickup point access is restricted to vendor accounts by the backend.')); }
}
async function loadRankOverview() {
  try {
    const [statsResponse, overviewResponse, pickupsResponse, recentResponse] = await Promise.all([
      apiFetch('/shipments/vendor/stats'),
      apiFetch('/shipments/vendor/overview'),
      apiFetch('/shipments/vendor/top-pickups'),
      apiFetch('/shipments/vendor/recent'),
    ]);
    const stats = statsResponse.data || statsResponse;
    const overview = overviewResponse.data || overviewResponse;
    const pickups = listFrom(pickupsResponse);
    const recent = listFrom(recentResponse);

    document.querySelectorAll('.stats .stat-value').forEach((node, index) => {
      const values = [stats.total, stats.collected, stats.awaiting, stats.returns];
      if (values[index] !== undefined) node.textContent = String(Number(values[index]) || 0);
    });

    const chart = Array.isArray(overview.chart) ? overview.chart : [];
    const chartLine = document.querySelector('.chart-line');
    if (chartLine) {
      const max = Math.max(1, ...chart.map((entry) => Number(entry.count) || 0));
      const points = chart.map((entry, index) => ({
        x: chart.length === 1 ? 365 : 55 + (621 * index) / (chart.length - 1),
        y: 140 - ((Number(entry.count) || 0) / max) * 116,
      }));
      chartLine.setAttribute('d', points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' '));
      const dateLabels = [...document.querySelectorAll('.chart-label')].filter((node) => Number(node.getAttribute('x')) > 12);
      dateLabels.forEach((node, index) => {
        const pointIndex = Math.round((index * (chart.length - 1)) / Math.max(1, dateLabels.length - 1));
        const value = chart[pointIndex]?.date;
        if (!value) { node.textContent = ''; return; }
        const date = new Date(value);
        node.textContent = Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
      });
    }

    const split = overview.split || {};
    const rankdrop = Number(split.rankdrop) || 0;
    const home = Number(split.home) || 0;
    const donutLabel = document.querySelector('.donut-label');
    if (donutLabel) donutLabel.innerHTML = `${rankdrop}%<small>RankDrop</small>`;
    const legend = document.querySelectorAll('.legend > div');
    if (legend[0]) legend[0].textContent = `RankDrop ${rankdrop}%`;
    if (legend[1]) legend[1].textContent = `Home Delivery ${home}%`;

    const pickupList = document.querySelector('.pickup-list');
    if (pickupList) {
      pickupList.replaceChildren();
      pickups.forEach((pickup) => {
        const row = document.createElement('div');
        row.className = 'pickup';
        const pin = document.createElement('span');
        pin.className = 'pickup-pin';
        pin.textContent = '?';
        const name = document.createElement('span');
        name.className = 'pickup-name';
        name.textContent = pickup.name || 'Pickup point';
        const rate = document.createElement('b');
        rate.className = 'pickup-rate';
        rate.textContent = `${Number(pickup.percentage) || 0}%`;
        row.append(pin, name, rate);
        pickupList.appendChild(row);
      });
    }

    const body = document.querySelector('.activity tbody');
    if (body) {
      body.replaceChildren();
      recent.forEach((shipment) => {
        const row = document.createElement('tr');
        const status = String(shipment.status || 'unknown');
        const statusCell = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `status ${status === 'in_transit' ? 'transit' : status.replaceAll('_', '-')}`;
        badge.textContent = status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
        statusCell.appendChild(badge);
        [shipment.parcelId, shipment.order || shipment[' order '] || '', shipment.pickupPoint, null, shipment.time]
          .forEach((value, index) => {
            if (index === 3) row.appendChild(statusCell);
            else { const cell = document.createElement('td'); cell.textContent = value == null ? '' : String(value); row.appendChild(cell); }
          });
        body.appendChild(row);
      });
    }
  } catch (error) {
    await showError(error);
  }
}
async function run(task) { data.busy = true; try { await task(); } catch (e) { await showError(e); } finally { data.busy = false; } }
async function ship(orderId, method) { await run(async()=>{ await apiFetch('/shipments',{method:'POST',body:JSON.stringify({orderId,method})}); await notify('success','Shipment created','The shipment is now being processed.'); data.orders=listFrom(await apiFetch('/shipments/unshipped'),['orders']); }); }
async function selectPlan(plan) { await run(async()=>{ if(!getAuthToken()) { go('login'); return; } const price=Number(plan.price||0); const orderNumber=`SUB-${Date.now()}`; localStorage.setItem('pendingSubscription',JSON.stringify({slug:plan.slug,id:plan.id})); const result=await apiFetch('/payment/initiate',{method:'POST',body:JSON.stringify({orderNumber,totalAmount:price,customerName:user.value.name || 'LocalCart vendor',customerEmail:user.value.email || '',returnUrl:`${location.origin}/index.html?view=legacy&page=checkout&subscription=true&status=success`,cancelUrl:`${location.origin}/index.html?view=legacy&page=checkout&subscription=true&status=cancelled`})}); const payment=result.data; if(!payment?.payfastUrl) throw new Error('Payment provider did not return a checkout URL.'); const f=document.createElement('form'); f.method='POST'; f.action=payment.payfastUrl; Object.entries(payment.paymentData||{}).forEach(([key,value])=>{const input=document.createElement('input');input.type='hidden';input.name=key;input.value=value;f.append(input)});document.body.append(f);f.submit(); }); }
async function chooseDelivery(code) { localStorage.setItem('deliveryMethod', code); const preview = await apiFetch('/delivery/preview', { method:'POST', body:JSON.stringify({ items:data.cart.items || [], methodCode:code }) }); localStorage.setItem('deliveryPreview', JSON.stringify(preview)); if (code.toLowerCase().includes('rank')) go('legacy','&page=rankdelivery'); else go('legacy','&page=checkout'); }
async function submit() {
  if (page.value === 'contact') return notify('info','Contact support','The backend has no general contact endpoint. Please email support@localcart.co.za.');
  await run(async () => {
    if (page.value === 'add-product') { const fd = new FormData(document.querySelector('#product-form')); await apiFetch('/products',{method:'POST',body:fd}); await notify('success','Product published','Your product has been added.'); go('legacy','&page=vendor-dashboard'); }
    if (page.value === 'checkout') { const result = await apiFetch('/orders/create',{method:'POST',body:JSON.stringify({...form,shipping_address:form.address,delivery_method:localStorage.getItem('deliveryMethod') || 'home_delivery',payment_method:'payfast'})}); const number=result.data?.order_number; if(!number) throw new Error(result.error || 'The order was not created.'); localStorage.setItem('completedOrder',JSON.stringify({orderNumber:number})); const payment=await apiFetch('/payment/initiate',{method:'POST',body:JSON.stringify({orderNumber:number,totalAmount:data.cart.total || data.cart.subtotal,customerName:form.name,customerEmail:form.email,returnUrl:`${location.origin}/index.html?view=legacy&page=confirmation&order=${number}`,cancelUrl:`${location.origin}/index.html?view=legacy&page=checkout`})}); const p=payment.data; if(p?.payfastUrl){const f=document.createElement('form');f.method='POST';f.action=p.payfastUrl;Object.entries(p.paymentData||{}).forEach(([k,v])=>{const i=document.createElement('input');i.type='hidden';i.name=k;i.value=v;f.append(i)});document.body.append(f);f.submit();} else go('legacy',`&page=confirmation&order=${number}`); }
    if (page.value === 'users') { await apiFetch('/users/profile',{method:'PUT',body:JSON.stringify(user.value)}); await notify('success','Profile saved','Your profile was updated.'); }
    if (page.value === 'vendor-dashboard') { await apiFetch(`/vendors/${user.value.vendor_id}`,{method:'PUT',body:JSON.stringify({name:form.name,category:form.category,location:form.city})}); await notify('success','Store profile saved','Your changes were saved.'); }
    if (page.value === 'createshipment') { const orderId = Number(document.querySelector('[data-order-id]')?.value); const method = document.querySelector('[name="shipment-method"]:checked')?.value; if(!orderId || !method) throw new Error('Select an order and shipment method.'); await apiFetch('/shipments',{method:'POST',body:JSON.stringify({orderId,method})}); await notify('success','Shipment created','The shipment is now being processed.'); await load(); }
  });
}
function remapLegacyLinks(source) {
  const routes=['about','contact','add-product','checkout','choosedelivery','confirmation','createshipment','deliverytracker','rankdelivery','rankoverview','subscription','track-order','users','vendor-dashboard','vendors','vendor','cart','login'];
  for(const route of routes){ source=source.replaceAll(`'${route}.html'`,`'index.html?view=${route}'`).replaceAll(`"${route}.html"`,`"index.html?view=${route}"`).replaceAll(`${route}.html?`,`index.html?view=${route}&`).replaceAll(`${route}.html#`,`index.html?view=${route}#`); }
  return source.replaceAll('vendor.html?id=', 'index.html?view=vendor&id=');
}
async function runPageScripts() {
  window.Swal ||= window.Sweetalert2;
  window.alert = (message) => window.Swal?.fire({ icon:'info', text:String(message) });
  window.Toastify ||= ((options) => ({ showToast: () => window.Swal?.fire({ icon:'info', text:options?.text || '' }) }));
  if (!window.LOCALCART_API_URL) window.LOCALCART_API_URL = location.hostname === 'localhost' || location.hostname === '127.0.0.1' ? '/api' : 'https://module-3-core-project-e-commerce-backend-production.up.railway.app/api';
  const loadScripts = pageScriptModules[`./legacyScripts/${page.value}.js`];
  const scripts = loadScripts ? await loadScripts() : [];
  for (const source of scripts) {
    const pageSource = page.value === 'vendor-dashboard'
      ? source.replace('window.location.href = "deliverytracker.html";', 'window.location.href = "rankoverview.html";')
      : source;
    const script = document.createElement('script');
        script.text = remapLegacyLinks(pageSource)
      .replace(
        'new URL(source.replace(/^\\.?\\//,\u0027\u0027),`${new URL(API_BASE_URL).origin}/`).href',
        'new URL(source.replace(/^\\.?\\//,\u0027\u0027),\u0027https://module-3-core-project-e-commerce-backend-production.up.railway.app/\u0027).href'
      )
      .replace(
        'body > header nav a[href="subscription.html"]',
        '.legacy-page header nav a[href*="view=subscription"]'
      );
    document.body.appendChild(script);
  }
  document.dispatchEvent(new Event('DOMContentLoaded', { bubbles:true }));
  if (page.value === 'rankoverview') await loadRankOverview();
}
onMounted(() => { originalBodyAttrs.value=document.body.getAttribute('class') || ''; const getAttr=(name)=>markup.value.attrs.match(new RegExp(`${name}=("[^"]*"|'[^']*')`))?.[1]?.slice(1,-1) || ''; document.body.className=getAttr('class'); document.body.id=getAttr('id'); if(getAttr('data-theme')) document.documentElement.dataset.theme=getAttr('data-theme'); void runPageScripts(); });
</script>

<template>
  <component :is="'style'" v-html="markup.css"></component>
  <div class="legacy-page" v-html="markup.html"></div>
  <section v-if="false" class="content page-content legacy-page">
    <p v-if="data.error" class="error-message">{{ data.error }}</p>
    <header class="page-header"><p class="eyebrow">LocalCart</p><h1>{{ title }}</h1></header>
    <template v-if="page==='about'"><section class="about-content"><h2>Who we are</h2><p>LocalCart connects customers with independent South African makers and local businesses.</p><h2>Why we do it</h2><p>We help local businesses reach more customers through a shared online marketplace.</p><h2>Our purpose in the community</h2><p>Every purchase supports local makers and the communities they serve.</p></section></template>
    <template v-else-if="page==='contact'"><p>Questions about LocalCart? Send us a message.</p><form class="checkout-form" @submit.prevent="submit"><label>Name<input v-model="form.name" required></label><label>Email<input v-model="form.email" type="email" required></label><label>Topic<select v-model="form.topic"><option>General enquiry</option><option>Orders</option><option>Vendor support</option></select></label><label>Message<textarea v-model="form.message" required></textarea></label><button class="btn-primary">Send message</button></form></template>
    <template v-else-if="page==='add-product'"><form id="product-form" class="checkout-form" @submit.prevent="submit"><label>Product name<input name="name" required></label><label>Category<input name="category" v-model="form.category"></label><label>Price<input name="price" type="number" min="0" step="0.01" required></label><label>Stock<input name="stock" type="number" min="0" value="0"></label><label>Description<textarea name="description" v-model="form.description"></textarea></label><label>Product image<input name="image" type="file" accept="image/*"></label><button class="btn-primary" :disabled="data.busy">Publish product</button></form></template>
    <template v-else-if="page==='choosedelivery'"><div class="products"><button v-for="m in data.methods" :key="m.code" class="product-card btn-primary" @click="chooseDelivery(m.code)"><h2>{{ m.name }}</h2><p>{{ m.time_estimate }}</p><strong>{{ money(m.price) }}</strong></button></div><p v-if="!data.methods.length">No delivery methods are available.</p></template>
    <template v-else-if="page==='checkout'"><form v-if="data.selected==='subscription'" class="checkout-form"><h2>Subscription checkout</h2><p>After payment, your selected vendor plan will be activated.</p></form><form v-else class="checkout-form" @submit.prevent="submit"><label>Full name<input v-model="form.name" required></label><label>Email<input v-model="form.email" type="email" required></label><label>Street address<input v-model="form.address" required></label><label>City<input v-model="form.city" required></label><label>Postal code<input v-model="form.postal_code" required></label><button class="btn-primary" :disabled="data.busy">Continue to PayFast</button></form></template>
    <template v-else-if="page==='subscription'"><div class="vendor-grid"><article v-for="p in data.plans" :key="p.id" class="vendor-card"><h2>{{ p.name }}</h2><p>{{ p.description }}</p><strong>{{ money(p.price) }} / {{ p.billing_period }}</strong><button class="btn-primary" @click="selectPlan(p)">Choose plan</button></article></div></template>
    <template v-else-if="page==='rankdelivery'"><p>Pickup point lookup is currently restricted to vendor accounts by the backend, so customer pickup selection cannot be completed with the existing API.</p></template>
    <template v-else-if="page==='confirmation'||page==='track-order'"><div v-if="data.order" class="card"><h2>Order #{{ data.order.orderNumber || data.order.order_number || query.get('order') }}</h2><p>Status: {{ data.order.status }}</p><p>Total: {{ money(data.order.total) }}</p><a class="btn-primary" :href="`index.html?view=legacy&page=track-order&order=${encodeURIComponent(data.order.orderNumber || data.order.order_number || query.get('order') || '')}`">Track order</a></div><p v-else>Loading order information…</p></template>
    <template v-else-if="page==='users'"><form class="checkout-form" @submit.prevent="submit"><label>Name<input v-model="user.name"></label><label>Email<input type="email" v-model="user.email"></label><label>Location<input v-model="user.location"></label><label>Bio<textarea v-model="user.bio"></textarea></label><button class="btn-primary">Save profile</button></form><h2>Vendors you follow</h2><div v-for="v in data.following" :key="v.id">{{ v.name }}</div></template>
    <template v-else-if="page==='vendor-dashboard'"><h2>Welcome, {{ user.name }}</h2><p>Sales: {{ money(data.stats.revenue || data.stats.sales) }} · Orders: {{ data.stats.orders || 0 }}</p><nav><a href="index.html?view=legacy&page=add-product">Add product</a> · <a href="index.html?view=legacy&page=deliverytracker">Orders</a> · <a href="index.html?view=legacy&page=subscription">Subscription</a></nav><form class="checkout-form" @submit.prevent="submit"><label>Store name<input v-model="form.name"></label><label>Category<input v-model="form.category"></label><label>Location<input v-model="form.city"></label><button class="btn-primary">Save store profile</button></form></template>
    <template v-else-if="page==='rankoverview'"><div class="vendor-grid"><article class="card">Parcels sent <strong>{{ data.stats.total || 0 }}</strong></article><article class="card">Collected <strong>{{ data.stats.collected || 0 }}</strong></article><article class="card">Awaiting collection <strong>{{ data.stats.awaiting || 0 }}</strong></article></div><h2>Recent RankDrop activity</h2><p v-for="x in data.items" :key="x.parcelId">{{ x.parcelId }} · {{ x.pickupPoint }} · {{ x.status }}</p></template>
    <template v-else-if="page==='deliverytracker'||page==='createshipment'"><article v-for="o in data.orders" :key="o.orderId || o.id" class="card"><strong>#{{ o.number || o.order_number }}</strong> · {{ o.customer || o.status }} · {{ o.total }}<template v-if="page==='createshipment'"><button class="btn-primary" @click="ship(o.orderId,'rankdrop')">Create RankDrop shipment</button><button class="btn-secondary" @click="ship(o.orderId,'self_delivery')">Self delivery</button></template></article><p v-if="!data.orders.length">No orders are available.</p><a v-if="page==='deliverytracker'" class="btn-primary" href="index.html?view=legacy&page=createshipment">Create shipment</a></template>
    <template v-else><p>This page is not available yet.</p></template>
  </section>
</template>
