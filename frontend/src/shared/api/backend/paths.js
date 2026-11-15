/* Canonical API routes map — literals live only in this paths module. */
const V1 = '/api/v1' // routes

export const BACKEND = {
  sessions: {
    create: `${V1}/sessions`, // routes
    reset: `${V1}/sessions/reset`, // routes
  },
  catalog: {
    categories: `${V1}/catalog/categories`, // routes
    products: `${V1}/catalog/products`, // routes
    product: (productId) => `${V1}/catalog/products/${encodeURIComponent(productId)}`, // routes
    live: `${V1}/catalog/live`, // routes
  },
  cart: {
    root: `${V1}/cart`, // routes
    fulfillment: `${V1}/cart/fulfillment`, // routes
    items: `${V1}/cart/items`, // routes
    item: (lineId) => `${V1}/cart/items/${encodeURIComponent(lineId)}`, // routes
  },
  auth: {
    yandexStart: `${V1}/auth/oauth/yandex/start`, // routes
    oauthExchange: `${V1}/auth/oauth/exchange`, // routes
    refresh: `${V1}/auth/refresh`, // routes
    logout: `${V1}/auth/logout`, // routes
  },
  me: `${V1}/me`, // routes
  orders: {
    create: `${V1}/orders`, // routes
  },
  staff: {
    me: `${V1}/staff/me`, // routes
    members: `${V1}/staff/members`, // routes
    member: (memberId) => `${V1}/staff/members/${encodeURIComponent(memberId)}`, // routes
    catalogProducts: `${V1}/staff/catalog/products`, // routes
    catalogProduct: (productId) =>
      `${V1}/staff/catalog/products/${encodeURIComponent(productId)}`, // routes
    catalogProductImage: (productId) =>
      `${V1}/staff/catalog/products/${encodeURIComponent(productId)}/image`, // routes
    catalogCategories: `${V1}/staff/catalog/categories`, // routes
    catalogCategoryOrder: `${V1}/staff/catalog/categories/order`, // routes
    catalogCategory: (categoryId) =>
      `${V1}/staff/catalog/categories/${encodeURIComponent(categoryId)}`, // routes
    orders: `${V1}/staff/orders`, // routes
    order: (orderId) => `${V1}/staff/orders/${encodeURIComponent(orderId)}`, // routes
    stats: `${V1}/staff/stats`, // routes
    money: `${V1}/staff/money`, // routes
  },
  media: {
    product: (productId) => `${V1}/media/products/${encodeURIComponent(productId)}`, // routes
  },
}
