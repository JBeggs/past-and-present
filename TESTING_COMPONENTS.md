# Past and Present – Testing Components

Component inventory and testing structure. See [docs/TESTING_COMPONENTS.md](../docs/TESTING_COMPONENTS.md) for ecosystem overview.

---

## Component Inventory

### Lib

| Module | Path | Test Status |
|--------|------|-------------|
| api | src/lib/api.ts | Tested (api.test.ts) |
| api-server | src/lib/api-server.ts | Not tested |
| types | src/lib/types.ts | Not tested |

### Contexts

| Context | Path | Test Status |
|---------|------|-------------|
| AuthContext | src/contexts/AuthContext.tsx | Tested |
| CartContext | src/contexts/CartContext.tsx | Tested |
| ToastContext | src/contexts/ToastContext.tsx | Tested |

### Auth (Pages)

| Page | Path | Test Status |
|------|------|-------------|
| Login | src/app/login/page.tsx | E2E |
| Register | src/app/register/page.tsx | E2E |

### Products Components

| Component | Path | Test Status |
|-----------|------|-------------|
| ProductCard | src/components/products/ProductCard.tsx | Tested |
| ProductForm | src/components/products/ProductForm.tsx | Tested |
| CategoryManager | src/components/products/CategoryManager.tsx | Not tested |
| AdminActions | src/components/products/AdminActions.tsx | Tested |
| ProductsSortSelect | src/components/products/ProductsSortSelect.tsx | Tested |
| BulkEditModal | src/components/products/BulkEditModal.tsx | Not tested |
| AddToCartButton | src/app/products/[slug]/AddToCartButton.tsx | E2E |

### Checkout Components

| Component | Path | Test Status |
|-----------|------|-------------|
| PudoLocationSelector | src/components/checkout/PudoLocationSelector.tsx | Tested |

### Layout Components

| Component | Path | Test Status |
|-----------|------|-------------|
| Header | src/components/layout/Header.tsx | Not tested |
| ClientHeader | src/components/layout/ClientHeader.tsx | Tested |
| MobileNav | src/components/layout/MobileNav.tsx | Tested |
| Footer | src/components/layout/Footer.tsx | Not tested |
| FooterClient | src/components/layout/FooterClient.tsx | Tested |

### Other Components

| Component | Path | Test Status |
|-----------|------|-------------|
| AboutPageClient | src/components/about/AboutPageClient.tsx | Not tested |
| ProductGallery | src/app/products/[slug]/ProductGallery.tsx | Not tested |
| Toast | src/components/ui/Toast.tsx | Tested |
| PaginationNav | src/components/ui/PaginationNav.tsx | Tested |

---

## Test Coverage Status

| Type | Exists | Gaps |
|------|--------|------|
| Unit | api.test.ts | contexts, ProductCard, ProductForm, etc. |
| Integration | None | AuthContext, CartContext, ToastContext |
| E2E | login, register, products, cart, checkout | - |

---

## Component-to-Test Mapping

| Component | Unit | Integration | E2E |
|-----------|------|-------------|-----|
| api.ts | Yes | - | - |
| AuthContext | - | Add | - |
| CartContext | - | Add | - |
| ToastContext | - | Add | - |
| ProductCard | Add | - | Yes |
| ProductForm | Add | - | Yes |
| CategoryManager | Add | - | Yes |
| PudoLocationSelector | Add | - | Yes |
| Login page | - | - | Yes |
| Register page | - | - | Yes |
| Products page | - | - | Yes |
| Cart page | - | - | Yes |
| Checkout page | - | - | Yes |

---

## data-cy Registry

| Selector | Location |
|----------|----------|
| login-username | login page |
| login-password | login page |
| login-submit | login page |
| register-full-name | register page |
| register-email | register page |
| register-password | register page |
| register-password-confirm | register page |
| register-submit | register page |
| products-grid | products page |
| add-to-cart-{slug} | AddToCartButton |
| cart-container | cart page |
| cart-empty | cart page |
| cart-content | cart page |
| cart-items-list | cart page |
| cart-proceed-checkout | cart page |
| checkout-content | checkout page |
| checkout-form | checkout page |
| checkout-submit | checkout page |

---

## Test File Layout

```
past-and-present/
├── src/
│   ├── test/setup.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── api.test.ts
│   ├── contexts/
│   │   └── AuthContext.tsx  (add AuthContext.test.tsx)
│   └── components/
│       └── products/
│           └── ProductCard.tsx  (add ProductCard.test.tsx)
├── cypress/
│   ├── config.js
│   ├── support/e2e.js
│   └── e2e/
│       ├── login.cy.js
│       ├── register.cy.js
│       ├── products.cy.js
│       ├── cart.cy.js
│       └── checkout.cy.js
└── vitest.config.ts
```
