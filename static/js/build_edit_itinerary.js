(function(){
  // ---- Trip context: normally passed in from new-trip.html / an existing trip's data.
  // Falls back to a sample "Japan Adventure" trip so this page is useful to preview on its own. ----
  const params = new URLSearchParams(window.location.search);

  const trip = {
    title: params.get('newTitle') || params.get('title') || 'Japan Adventure',
    destination: params.get('newDestination') || params.get('destination') || 'Tokyo & Kyoto, Japan',
    start: params.get('newStart') || params.get('start') || '2024-01-16',
    end: params.get('newEnd') || params.get('end') || '2024-01-21'
  };

  document.getElementById('tripTitleDisplay').textContent = trip.title;

  function formatDateRange(startISO, endISO){
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    const s = new Date(startISO + 'T00:00:00');
    const e = new Date(endISO + 'T00:00:00');
    return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`;
  }
  document.getElementById('tripMetaDisplay').textContent =
    `${trip.destination} · ${formatDateRange(trip.start, trip.end)}`;

  // ---- Build the list of days from the trip's date range ----
  function toISO(d){ return d.toISOString().slice(0, 10); }

  const days = [];
  let cursor = new Date(trip.start + 'T00:00:00');
  const endDate = new Date(trip.end + 'T00:00:00');
  let dayIndex = 1;
  while(cursor <= endDate){
    days.push({
      index: dayIndex,
      iso: toISO(cursor),
      label: `Day ${dayIndex}`,
      dateLabel: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
    cursor.setDate(cursor.getDate() + 1);
    dayIndex++;
  }
  if(days.length === 0){
    days.push({ index: 1, iso: trip.start, label: 'Day 1', dateLabel: '' });
  }

  // ---- Item type presets ----
  const TYPE_ICONS = {
    Flight: '✈️', Stay: '🏨', Activity: '🎟️', Food: '🍽️', Transport: '🚗', Other: '📌'
  };

  // ---- In-memory itinerary state (no backend / no browser storage — resets on reload) ----
  // Seeded with a couple of sample items on Day 3 so the page isn't empty on first look.
  const itemsByDay = {};
  days.forEach(d => { itemsByDay[d.index] = []; });
  if(itemsByDay[3]){
    itemsByDay[3] = [
      {
        id: cryptoRandomId(), type: 'Activity', time: '09:00',
        title: 'Fushimi Inari Shrine hike', location: 'Fushimi Inari Taisha, Kyoto',
        cost: 0, currency: 'USD', confirmation: '', notes: 'Free entry — go early to beat the crowds.'
      },
      {
        id: cryptoRandomId(), type: 'Food', time: '19:30',
        title: 'Izakaya-hopping in Gion', location: 'Gion District, Kyoto',
        cost: 45, currency: 'USD', confirmation: '', notes: ''
      }
    ];
  }

  function cryptoRandomId(){
    return 'item-' + Math.random().toString(36).slice(2, 10);
  }

  let activeDayIndex = days[Math.min(2, days.length - 1)].index; // land on day 3 if it exists

  // ---- Elements ----
  const dayTabsEl = document.getElementById('dayTabs');
  const dayPanelsEl = document.getElementById('dayPanels');
  const budgetTotalInput = document.getElementById('budgetTotal');
  const budgetCurrencySelect = document.getElementById('budgetCurrency');
  const budgetTrack = document.getElementById('budgetTrack');
  const budgetTrackFill = document.getElementById('budgetTrackFill');
  const budgetSummaryText = document.getElementById('budgetSummaryText');

  // ---- Render day tabs ----
  function renderDayTabs(){
    dayTabsEl.innerHTML = '';
    days.forEach(d => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-selected', d.index === activeDayIndex ? 'true' : 'false');
      btn.textContent = d.dateLabel ? `${d.label} · ${d.dateLabel}` : d.label;
      btn.addEventListener('click', () => {
        activeDayIndex = d.index;
        renderDayTabs();
        renderDayPanel();
      });
      dayTabsEl.appendChild(btn);
    });
  }

  // ---- Currency symbol helper ----
  const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };
  function symbolFor(code){ return CURRENCY_SYMBOLS[code] || code + ' '; }

  // ---- Budget calculation (running total across ALL days, vs trip budget) ----
  function renderBudget(){
    const budgetCurrency = budgetCurrencySelect.value;
    const budgetAmount = parseFloat(budgetTotalInput.value) || 0;

    let spent = 0;
    Object.values(itemsByDay).forEach(list => {
      list.forEach(item => { spent += (parseFloat(item.cost) || 0); });
    });

    const pct = budgetAmount > 0 ? Math.min(150, (spent / budgetAmount) * 100) : 0;
    budgetTrackFill.style.width = Math.min(100, pct) + '%';

    budgetTrack.classList.remove('warn', 'over');
    if(spent > budgetAmount && budgetAmount > 0){
      budgetTrack.classList.add('over');
    } else if(pct >= 80){
      budgetTrack.classList.add('warn');
    }

    budgetSummaryText.innerHTML =
      `<strong>${symbolFor(budgetCurrency)}${spent.toFixed(0)}</strong> spent of ${symbolFor(budgetCurrency)}${budgetAmount.toFixed(0)}` +
      (spent > budgetAmount && budgetAmount > 0 ? ` — <span style="color:#c0475a">over budget</span>` : '');
  }

  budgetTotalInput.addEventListener('input', renderBudget);
  budgetCurrencySelect.addEventListener('change', renderBudget);

  // ---- Render the active day's panel (item list + add-item form trigger) ----
  let addFormOpenFor = null; // day index for which the add-item form is currently open
  let editingItemId = null;  // item id currently being edited, if any

  function renderDayPanel(){
    dayPanelsEl.innerHTML = '';

    const panel = document.createElement('div');
    panel.className = 'day-panel';

    const items = itemsByDay[activeDayIndex] || [];

    if(items.length === 0){
      const empty = document.createElement('div');
      empty.className = 'empty-day';
      empty.textContent = 'Nothing planned for this day yet.';
      panel.appendChild(empty);
    } else {
      const list = document.createElement('div');
      list.className = 'item-list';
      items
        .slice()
        .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
        .forEach(item => list.appendChild(renderItemCard(item)));
      panel.appendChild(list);
    }

    if(addFormOpenFor === activeDayIndex){
      panel.appendChild(renderAddItemForm());
    } else {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'add-item-toggle';
      toggle.innerHTML = `<span class="plus">+</span> Add item to this day`;
      toggle.addEventListener('click', () => {
        addFormOpenFor = activeDayIndex;
        editingItemId = null;
        renderDayPanel();
      });
      panel.appendChild(toggle);
    }

    dayPanelsEl.appendChild(panel);
  }

  function renderItemCard(item){
    const card = document.createElement('div');
    card.className = 'item-card';

    const costDisplay = item.cost > 0 ? `${symbolFor(item.currency)}${parseFloat(item.cost).toFixed(0)}` : '';

    card.innerHTML = `
      <span class="item-icon">${TYPE_ICONS[item.type] || '📌'}</span>
      <div class="item-body">
        <div class="item-top-row">
          <span class="item-title">${escapeHtml(item.title)}</span>
          ${item.time ? `<span class="item-time">${escapeHtml(item.time)}</span>` : ''}
        </div>
        ${item.location ? `<div class="item-location">${escapeHtml(item.location)}</div>` : ''}
        ${item.notes ? `<div class="item-notes">${escapeHtml(item.notes)}</div>` : ''}
        <div class="item-footer-row">
          <span class="item-cost">${costDisplay}</span>
          <span class="item-confirmation">${item.confirmation ? `<a href="${escapeAttr(item.confirmation)}" target="_blank" rel="noopener">Booking confirmation ↗</a>` : ''}</span>
          <span class="item-actions">
            <button type="button" data-action="edit">Edit</button>
            <button type="button" data-action="remove" class="danger">Remove</button>
          </span>
        </div>
      </div>
    `;

    card.querySelector('[data-action="edit"]').addEventListener('click', () => {
      addFormOpenFor = activeDayIndex;
      editingItemId = item.id;
      renderDayPanel();
    });
    card.querySelector('[data-action="remove"]').addEventListener('click', () => {
      itemsByDay[activeDayIndex] = itemsByDay[activeDayIndex].filter(i => i.id !== item.id);
      renderDayPanel();
      renderBudget();
    });

    return card;
  }

  function renderAddItemForm(){
    const existing = editingItemId
      ? itemsByDay[activeDayIndex].find(i => i.id === editingItemId)
      : null;

    const wrap = document.createElement('div');
    wrap.className = 'add-item-form';
    wrap.innerHTML = `
      <h3>${existing ? 'Edit item' : 'Add item'}</h3>
      <div class="form-grid">
        <div>
          <label for="itemType">Type</label>
          <select id="itemType">
            ${Object.keys(TYPE_ICONS).map(t => `<option value="${t}" ${existing && existing.type === t ? 'selected' : ''}>${TYPE_ICONS[t]} ${t}</option>`).join('')}
          </select>
        </div>
        <div>
          <label for="itemTime">Time</label>
          <input type="time" id="itemTime" value="${existing ? existing.time || '' : ''}">
        </div>
        <div class="full">
          <label for="itemTitle">Title</label>
          <input type="text" id="itemTitle" placeholder="e.g. Check in at hotel" value="${existing ? escapeAttr(existing.title) : ''}">
        </div>
        <div class="full">
          <label for="itemLocation">Location / address</label>
          <input type="text" id="itemLocation" placeholder="e.g. Park Hyatt Tokyo" value="${existing ? escapeAttr(existing.location || '') : ''}">
        </div>
        <div>
          <label for="itemCost">Cost</label>
          <div class="cost-row">
            <select id="itemCurrency">
              ${Object.keys(CURRENCY_SYMBOLS).map(c => `<option value="${c}" ${existing && existing.currency === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            <input type="number" id="itemCost" min="0" step="1" placeholder="0" value="${existing ? existing.cost || '' : ''}">
          </div>
        </div>
        <div>
          <label for="itemConfirmation">Booking confirmation / link</label>
          <input type="text" id="itemConfirmation" placeholder="https:// or confirmation #" value="${existing ? escapeAttr(existing.confirmation || '') : ''}">
        </div>
        <div class="full">
          <label for="itemNotes">Notes</label>
          <textarea id="itemNotes" placeholder="Anything worth remembering about this?">${existing ? escapeHtml(existing.notes || '') : ''}</textarea>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" id="saveItemBtn">${existing ? 'Save changes' : 'Add to day'}</button>
        <button type="button" class="btn-secondary" id="cancelItemBtn">Cancel</button>
      </div>
    `;

    wrap.querySelector('#saveItemBtn').addEventListener('click', () => {
      const title = wrap.querySelector('#itemTitle').value.trim();
      if(title === ''){
        wrap.querySelector('#itemTitle').focus();
        return;
      }
      const newItem = {
        id: existing ? existing.id : cryptoRandomId(),
        type: wrap.querySelector('#itemType').value,
        time: wrap.querySelector('#itemTime').value,
        title,
        location: wrap.querySelector('#itemLocation').value.trim(),
        cost: parseFloat(wrap.querySelector('#itemCost').value) || 0,
        currency: wrap.querySelector('#itemCurrency').value,
        confirmation: wrap.querySelector('#itemConfirmation').value.trim(),
        notes: wrap.querySelector('#itemNotes').value.trim()
      };

      if(existing){
        const idx = itemsByDay[activeDayIndex].findIndex(i => i.id === existing.id);
        itemsByDay[activeDayIndex][idx] = newItem;
      } else {
        itemsByDay[activeDayIndex].push(newItem);
      }

      addFormOpenFor = null;
      editingItemId = null;
      renderDayPanel();
      renderBudget();
    });

    wrap.querySelector('#cancelItemBtn').addEventListener('click', () => {
      addFormOpenFor = null;
      editingItemId = null;
      renderDayPanel();
    });

    return wrap;
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
  function escapeAttr(str){
    return (str || '').replace(/"/g, '&quot;');
  }

  document.getElementById('saveItineraryBtn').addEventListener('click', () => {
    const payload = {
      trip,
      budget: { amount: parseFloat(budgetTotalInput.value) || 0, currency: budgetCurrencySelect.value },
      itemsByDay
    };
    console.log('Itinerary payload (wire this up to your backend):', payload);
    alert('Itinerary saved locally in this session — wire the Save button up to your backend to persist it.');
  });

  // ---- Initial render ----
  renderDayTabs();
  renderDayPanel();
  renderBudget();
})();