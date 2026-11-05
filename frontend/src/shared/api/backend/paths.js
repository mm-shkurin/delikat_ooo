const V1 = '/api/v1'

export const BACKEND = {
  sessions: {
    create: `${V1}/sessions`,
    reset: `${V1}/sessions/reset`,
  },
  catalog: {
    categories: `${V1}/catalog/categories`,
    products: `${V1}/catalog/products`,
    product: (productId) => `${V1}/catalog/products/${encodeURIComponent(productId)}`,
  },
  cart: {
    root: `${V1}/cart`,
    fulfillment: `${V1}/cart/fulfillment`,
    items: `${V1}/cart/items`,
    item: (lineId) => `${V1}/cart/items/${encodeURIComponent(lineId)}`,
  },
  auth: {
    yandexStart: `${V1}/auth/oauth/yandex/start`,
    oauthExchange: `${V1}/auth/oauth/exchange`,
    refresh: `${V1}/auth/refresh`,
    logout: `${V1}/auth/logout`,
  },
  me: `${V1}/me`,
  orders: {
    create: `${V1}/orders`,
  },
}
