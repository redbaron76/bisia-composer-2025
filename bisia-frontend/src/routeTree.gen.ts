/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as DemoTanstackQueryImport } from './routes/demo.tanstack-query'
import { Route as DemoFormSimpleImport } from './routes/demo.form.simple'
import { Route as DemoFormSignupImport } from './routes/demo.form.signup'
import { Route as DemoFormPhoneImport } from './routes/demo.form.phone'
import { Route as DemoFormLoginImport } from './routes/demo.form.login'
import { Route as DemoFormEmailImport } from './routes/demo.form.email'
import { Route as DemoFormAddressImport } from './routes/demo.form.address'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const DemoTanstackQueryRoute = DemoTanstackQueryImport.update({
  id: '/demo/tanstack-query',
  path: '/demo/tanstack-query',
  getParentRoute: () => rootRoute,
} as any)

const DemoFormSimpleRoute = DemoFormSimpleImport.update({
  id: '/demo/form/simple',
  path: '/demo/form/simple',
  getParentRoute: () => rootRoute,
} as any)

const DemoFormSignupRoute = DemoFormSignupImport.update({
  id: '/demo/form/signup',
  path: '/demo/form/signup',
  getParentRoute: () => rootRoute,
} as any)

const DemoFormPhoneRoute = DemoFormPhoneImport.update({
  id: '/demo/form/phone',
  path: '/demo/form/phone',
  getParentRoute: () => rootRoute,
} as any)

const DemoFormLoginRoute = DemoFormLoginImport.update({
  id: '/demo/form/login',
  path: '/demo/form/login',
  getParentRoute: () => rootRoute,
} as any)

const DemoFormEmailRoute = DemoFormEmailImport.update({
  id: '/demo/form/email',
  path: '/demo/form/email',
  getParentRoute: () => rootRoute,
} as any)

const DemoFormAddressRoute = DemoFormAddressImport.update({
  id: '/demo/form/address',
  path: '/demo/form/address',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/demo/tanstack-query': {
      id: '/demo/tanstack-query'
      path: '/demo/tanstack-query'
      fullPath: '/demo/tanstack-query'
      preLoaderRoute: typeof DemoTanstackQueryImport
      parentRoute: typeof rootRoute
    }
    '/demo/form/address': {
      id: '/demo/form/address'
      path: '/demo/form/address'
      fullPath: '/demo/form/address'
      preLoaderRoute: typeof DemoFormAddressImport
      parentRoute: typeof rootRoute
    }
    '/demo/form/email': {
      id: '/demo/form/email'
      path: '/demo/form/email'
      fullPath: '/demo/form/email'
      preLoaderRoute: typeof DemoFormEmailImport
      parentRoute: typeof rootRoute
    }
    '/demo/form/login': {
      id: '/demo/form/login'
      path: '/demo/form/login'
      fullPath: '/demo/form/login'
      preLoaderRoute: typeof DemoFormLoginImport
      parentRoute: typeof rootRoute
    }
    '/demo/form/phone': {
      id: '/demo/form/phone'
      path: '/demo/form/phone'
      fullPath: '/demo/form/phone'
      preLoaderRoute: typeof DemoFormPhoneImport
      parentRoute: typeof rootRoute
    }
    '/demo/form/signup': {
      id: '/demo/form/signup'
      path: '/demo/form/signup'
      fullPath: '/demo/form/signup'
      preLoaderRoute: typeof DemoFormSignupImport
      parentRoute: typeof rootRoute
    }
    '/demo/form/simple': {
      id: '/demo/form/simple'
      path: '/demo/form/simple'
      fullPath: '/demo/form/simple'
      preLoaderRoute: typeof DemoFormSimpleImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/demo/tanstack-query': typeof DemoTanstackQueryRoute
  '/demo/form/address': typeof DemoFormAddressRoute
  '/demo/form/email': typeof DemoFormEmailRoute
  '/demo/form/login': typeof DemoFormLoginRoute
  '/demo/form/phone': typeof DemoFormPhoneRoute
  '/demo/form/signup': typeof DemoFormSignupRoute
  '/demo/form/simple': typeof DemoFormSimpleRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/demo/tanstack-query': typeof DemoTanstackQueryRoute
  '/demo/form/address': typeof DemoFormAddressRoute
  '/demo/form/email': typeof DemoFormEmailRoute
  '/demo/form/login': typeof DemoFormLoginRoute
  '/demo/form/phone': typeof DemoFormPhoneRoute
  '/demo/form/signup': typeof DemoFormSignupRoute
  '/demo/form/simple': typeof DemoFormSimpleRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/demo/tanstack-query': typeof DemoTanstackQueryRoute
  '/demo/form/address': typeof DemoFormAddressRoute
  '/demo/form/email': typeof DemoFormEmailRoute
  '/demo/form/login': typeof DemoFormLoginRoute
  '/demo/form/phone': typeof DemoFormPhoneRoute
  '/demo/form/signup': typeof DemoFormSignupRoute
  '/demo/form/simple': typeof DemoFormSimpleRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/demo/tanstack-query'
    | '/demo/form/address'
    | '/demo/form/email'
    | '/demo/form/login'
    | '/demo/form/phone'
    | '/demo/form/signup'
    | '/demo/form/simple'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/demo/tanstack-query'
    | '/demo/form/address'
    | '/demo/form/email'
    | '/demo/form/login'
    | '/demo/form/phone'
    | '/demo/form/signup'
    | '/demo/form/simple'
  id:
    | '__root__'
    | '/'
    | '/demo/tanstack-query'
    | '/demo/form/address'
    | '/demo/form/email'
    | '/demo/form/login'
    | '/demo/form/phone'
    | '/demo/form/signup'
    | '/demo/form/simple'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  DemoTanstackQueryRoute: typeof DemoTanstackQueryRoute
  DemoFormAddressRoute: typeof DemoFormAddressRoute
  DemoFormEmailRoute: typeof DemoFormEmailRoute
  DemoFormLoginRoute: typeof DemoFormLoginRoute
  DemoFormPhoneRoute: typeof DemoFormPhoneRoute
  DemoFormSignupRoute: typeof DemoFormSignupRoute
  DemoFormSimpleRoute: typeof DemoFormSimpleRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  DemoTanstackQueryRoute: DemoTanstackQueryRoute,
  DemoFormAddressRoute: DemoFormAddressRoute,
  DemoFormEmailRoute: DemoFormEmailRoute,
  DemoFormLoginRoute: DemoFormLoginRoute,
  DemoFormPhoneRoute: DemoFormPhoneRoute,
  DemoFormSignupRoute: DemoFormSignupRoute,
  DemoFormSimpleRoute: DemoFormSimpleRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/demo/tanstack-query",
        "/demo/form/address",
        "/demo/form/email",
        "/demo/form/login",
        "/demo/form/phone",
        "/demo/form/signup",
        "/demo/form/simple"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/demo/tanstack-query": {
      "filePath": "demo.tanstack-query.tsx"
    },
    "/demo/form/address": {
      "filePath": "demo.form.address.tsx"
    },
    "/demo/form/email": {
      "filePath": "demo.form.email.tsx"
    },
    "/demo/form/login": {
      "filePath": "demo.form.login.tsx"
    },
    "/demo/form/phone": {
      "filePath": "demo.form.phone.tsx"
    },
    "/demo/form/signup": {
      "filePath": "demo.form.signup.tsx"
    },
    "/demo/form/simple": {
      "filePath": "demo.form.simple.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
