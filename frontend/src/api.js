const BASE = '/api';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const key = localStorage.getItem('klose_api_key');
  if (key) headers['X-API-Key'] = key;
  return headers;
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: getHeaders(),
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

const api = {
  // Dashboard
  getDashboardSummary: () => request('/dashboard/summary'),
  getDashboardActivity: () => request('/dashboard/activity'),
  getDashboardBriefing: () => request('/dashboard/briefing'),
  getDashboardRecommendations: () => request('/dashboard/recommendations'),

  // Leads
  getLeads: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/leads?${qs}`);
  },
  getLead: (id) => request(`/leads/${id}`),
  createLead: (data) => request('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id, data) => request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLead: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
  scoreLead: (id) => request(`/leads/${id}/score`, { method: 'POST' }),

  // Properties
  getProperties: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/properties?${qs}`);
  },
  getProperty: (id) => request(`/properties/${id}`),
  createProperty: (data) => request('/properties', { method: 'POST', body: JSON.stringify(data) }),
  updateProperty: (id, data) => request(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProperty: (id) => request(`/properties/${id}`, { method: 'DELETE' }),
  compareProperties: (ids) => request('/properties/compare', { method: 'POST', body: JSON.stringify({ ids }) }),

  // Visits
  getVisits: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/visits?${qs}`);
  },
  getVisitCalendar: () => request('/visits/calendar'),
  getVisitStats: () => request('/visits/stats'),
  createVisit: (data) => request('/visits', { method: 'POST', body: JSON.stringify(data) }),
  updateVisit: (id, data) => request(`/visits/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVisit: (id) => request(`/visits/${id}`, { method: 'DELETE' }),

  // Pipeline
  getPipeline: () => request('/pipeline'),
  getPipelineStats: () => request('/pipeline/stats'),
  createDeal: (data) => request('/pipeline', { method: 'POST', body: JSON.stringify(data) }),
  updateDeal: (id, data) => request(`/pipeline/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDeal: (id) => request(`/pipeline/${id}`, { method: 'DELETE' }),

  // Negotiation
  getChatHistory: (dealId) => request(`/negotiation/${dealId}/history`),
  sendChat: (dealId, message) => request('/negotiation/chat', { method: 'POST', body: JSON.stringify({ deal_id: dealId, message }) }),
  getDealComps: (dealId) => request(`/negotiation/${dealId}/comps`),
  getDealHealth: (dealId) => request(`/negotiation/${dealId}/health`),
  getCounterOffer: (dealId) => request(`/negotiation/${dealId}/counter-offer`, { method: 'POST' }),

  // Finance
  calculateEMI: (data) => request('/finance/emi', { method: 'POST', body: JSON.stringify(data) }),
  checkAffordability: (data) => request('/finance/affordability', { method: 'POST', body: JSON.stringify(data) }),
  getBankRates: () => request('/finance/bank-rates'),

  // Partners
  getPartners: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/partners?${qs}`);
  },
  getPartnerStats: () => request('/partners/stats'),
  getPartner: (id) => request(`/partners/${id}`),
  getPartnerCommissions: (id) => request(`/partners/${id}/commissions`),
  createPartner: (data) => request('/partners', { method: 'POST', body: JSON.stringify(data) }),
  updatePartner: (id, data) => request(`/partners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Team
  getTeam: () => request('/team'),
  getLeaderboard: () => request('/team/leaderboard'),
  getTeamStats: () => request('/team/stats'),
  getTeamMember: (id) => request(`/team/${id}`),
  updateTeamMember: (id, data) => request(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAssignmentRules: () => request('/team/assignment-rules'),
  updateAssignmentRules: (rules) => request('/team/assignment-rules', { method: 'PUT', body: JSON.stringify({ rules }) }),
  autoAssign: () => request('/team/auto-assign', { method: 'POST' }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

export default api;
