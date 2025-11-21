const summaryEl = document.getElementById('summary');
const ticketsEl = document.getElementById('tickets');
const hotelsEl = document.getElementById('hotels');
const expressEl = document.getElementById('express');
const hoursEl = document.getElementById('hours');
const diningEl = document.getElementById('dining');
const eventsEl = document.getElementById('events');
const crowdEl = document.getElementById('crowd');
const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = Array.from(document.querySelectorAll('.tab-panel'));

const input = (id) => document.getElementById(id);

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  return res.json();
};

const renderSummary = (summary) => {
  summaryEl.innerHTML = '';
  const entries = [
    ['Tickets', summary.ticketCount],
    ['Hotels', summary.hotelCount],
    ['Express', summary.expressOptions],
    ['Dining', summary.diningCount],
    ['Events', summary.eventCount],
  ];

  entries.forEach(([label, value]) => {
    const tile = document.createElement('div');
    tile.className = 'summary__tile';
    tile.innerHTML = `<div class="summary__number">${value}</div><div class="muted">${label}</div>`;
    summaryEl.appendChild(tile);
  });
};

const renderTickets = (tickets) => {
  ticketsEl.innerHTML = '';
  tickets.forEach((ticket) => {
    const card = document.createElement('div');
    card.className = 'ticket';
    card.innerHTML = `
      <div class="pill">${ticket.park}</div>
      <h3>${ticket.name}</h3>
      <p class="muted">${ticket.description}</p>
      <div class="ticket__price">${formatter.format(ticket.total)}</div>
      <p class="muted">${ticket.days} days · ${ticket.adults} adults${ticket.children ? ` · ${ticket.children} children` : ''}</p>
      <div class="chips">
        <span class="chip">Subtotal ${formatter.format(ticket.subtotal)}</span>
        <span class="chip">Taxes & Fees ${formatter.format(ticket.taxesAndFees)}</span>
        <span class="chip">Express eligible: ${ticket.expressEligible ? 'Yes' : 'No'}</span>
      </div>
    `;
    ticketsEl.appendChild(card);
  });
};

const renderHotels = (hotels) => {
  hotelsEl.innerHTML = '';
  hotels.forEach((hotel) => {
    const card = document.createElement('div');
    card.className = 'hotel';
    card.innerHTML = `
      <img src="${hotel.thumbnail}" alt="${hotel.name}" class="hotel__thumb" />
      <div class="pill">${hotel.onsite ? 'Onsite' : 'Partner'}</div>
      <h3>${hotel.name}</h3>
      <p class="muted">${hotel.description}</p>
      <p class="muted">${hotel.rating.toFixed(1)} ★ · ${hotel.distanceToParkMiles} miles to park</p>
      <div class="ticket__price">${formatter.format(hotel.total)} total</div>
      <p class="muted">${hotel.nights} nights · ${hotel.guests} guests</p>
      <div class="chips">
        ${hotel.perks.map((perk) => `<span class="chip">${perk}</span>`).join('')}
        <span class="chip">Taxes & Fees ${formatter.format(hotel.taxesAndFees)}</span>
      </div>
    `;
    hotelsEl.appendChild(card);
  });
};

const renderExpress = (passes) => {
  expressEl.innerHTML = '';
  passes.forEach((pass) => {
    const card = document.createElement('div');
    card.className = 'express';
    card.innerHTML = `
      <div class="pill">${pass.park}</div>
      <h3>${pass.name}</h3>
      <p class="muted">${pass.description}</p>
      <div class="ticket__price">${formatter.format(pass.price)}</div>
      <div class="chip">${pass.tier}</div>
    `;
    expressEl.appendChild(card);
  });
};

const renderHours = (hours) => {
  hoursEl.innerHTML = '';
  hours.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'hours';
    card.innerHTML = `
      <div class="pill">${row.park}</div>
      <h3>${row.date}</h3>
      <p>${row.opens} – ${row.closes} ${row.earlyParkAdmission ? '· Early Admission' : ''}</p>
      ${row.specialEvent ? `<p class="muted">${row.specialEvent}</p>` : ''}
    `;
    hoursEl.appendChild(card);
  });
};

const renderDining = (locations) => {
  diningEl.innerHTML = '';
  locations.forEach((spot) => {
    const card = document.createElement('div');
    card.className = 'dining';
    card.innerHTML = `
      <div class="pill">${spot.park}</div>
      <h3>${spot.name}</h3>
      <p class="muted">${spot.description}</p>
      <div class="chips">
        <span class="chip">${spot.cuisine}</span>
        <span class="chip">${spot.priceLevel}</span>
        ${spot.mealTypes.map((meal) => `<span class="chip">${meal}</span>`).join('')}
        <span class="chip">${spot.reservationRecommended ? 'Reservations suggested' : 'Walk-up friendly'}</span>
      </div>
      <a href="${spot.url}" target="_blank" rel="noreferrer" class="muted">View menu ↗</a>
    `;
    diningEl.appendChild(card);
  });
};

const renderEvents = (events) => {
  eventsEl.innerHTML = '';
  events.forEach((event) => {
    const card = document.createElement('div');
    card.className = 'event';
    card.innerHTML = `
      <div class="pill">${event.category}</div>
      <h3>${event.name}</h3>
      <p class="muted">${event.description}</p>
      <p>${event.date} · ${event.location}</p>
      <div class="ticket__price">${event.price ? formatter.format(event.price) : 'Included with admission'}</div>
    `;
    eventsEl.appendChild(card);
  });
};

const renderCrowd = (entries) => {
  crowdEl.innerHTML = '';
  entries.forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'crowd';
    const bars = new Array(entry.crowdLevel).fill('▮').join('');
    card.innerHTML = `
      <div class="pill">${entry.park}</div>
      <h3>${entry.date}</h3>
      <p class="crowd__bars" aria-label="Crowd level ${entry.crowdLevel} out of 10">${bars}</p>
      <p class="muted">${entry.rationale.join(' · ') || 'Standard operating day'}</p>
    `;
    crowdEl.appendChild(card);
  });
};

const refresh = async () => {
  const days = Number(input('filter-days').value) || 1;
  const adults = Number(input('filter-adults').value) || 1;
  const children = Number(input('filter-children').value) || 0;
  const nights = Number(input('filter-nights').value) || 1;
  const guests = Number(input('filter-guests').value) || 1;

  const [summaryResp, ticketsResp, hotelsResp, expressResp, hoursResp, diningResp, eventsResp, crowdResp] = await Promise.all([
    fetchJSON('/api/summary'),
    fetchJSON(`/api/tickets?days=${days}&adults=${adults}&children=${children}`),
    fetchJSON(`/api/hotels?nights=${nights}&guests=${guests}`),
    fetchJSON('/api/express'),
    fetchJSON('/api/park-hours'),
    fetchJSON('/api/dining'),
    fetchJSON('/api/events'),
    fetchJSON('/api/crowd-calendar'),
  ]);

  renderSummary(summaryResp.summary);
  renderTickets(ticketsResp.tickets);
  renderHotels(hotelsResp.hotels);
  renderExpress(expressResp.expressPasses);
  renderHours(hoursResp.parkHours);
  renderDining(diningResp.dining);
  renderEvents(eventsResp.events);
  renderCrowd(crowdResp.crowdCalendar);
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.target;
    tabs.forEach((btn) => btn.classList.toggle('active', btn === tab));
    panels.forEach((panel) => panel.classList.toggle('active', panel.id === target));
  });
});

const button = document.getElementById('refresh');
button.addEventListener('click', () => {
  button.textContent = 'Refreshing...';
  button.disabled = true;
  refresh()
    .catch(() => {
      button.textContent = 'Try again';
    })
    .finally(() => {
      setTimeout(() => {
        button.textContent = 'Refresh Live Data';
        button.disabled = false;
      }, 300);
    });
});

refresh();
