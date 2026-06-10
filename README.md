# css-loader

The `css-loader` interprets `@import` and `url()` like `import`/`require()` and
resolves them.

## Getting Started

> [!WARNING]
> To use the latest version of css-loader, webpack v5.0.0 or greater is required.

To begin, you'll need to install `css-loader`:

```bash displayName="npm"
npm install --save-dev css-loader
```

```bash displayName="yarn"
yarn add -D css-loader
```

```bash displayName="pnpm"
pnpm add -D css-loader
```

In the example configuration below, `style-loader` is used to inject the
processed CSS into the DOM during runtime. You may need to install it as well:

```bash
npm install --save-dev style-loader
```

Then, add the loader to your `webpack` configuration. For example:

```js displayName="file.js"
import * as css from "file.css";
```

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
```

Finally, run `webpack` using the method you normally use (e.g., via CLI or an
npm script).

If you need to extract CSS into a separate file (i.e. do not store CSS in a JS
module), consider using the [recommend example](#recommend).

## Options

### `url`

- Type: {boolean|Object}
- **Default:** `true`.

```ts displayName="Type"
type url =
  | boolean
  | {
      filter: (url: string, resourcePath: string) => boolean;
    };
```

Enables or disables handling the CSS functions `url` and `image-set`.

If set to `false`, `css-loader` will not parse any paths specified in `url` or
`image-set`. You can also pass a function to control this behavior dynamically
based on the asset path.

As of version [4.0.0](https://github.com/webpack/css-loader/blob/main/CHANGELOG.md#400-2020-07-25), absolute paths are resolved based on the
server root.

Example resolutions:

```js
url(image.png) => require('./image.png')
url('image.png') => require('./image.png')
url(./image.png) => require('./image.png')
url('./image.png') => require('./image.png')
url('http://dontwritehorriblecode.com/2112.png') => require('http://dontwritehorriblecode.com/2112.png')
image-set(url('image2x.png') 1x, url('image1x.png') 2x) => require('./image1x.png') and require('./image2x.png')
```

To import assets from a `node_modules` path (including `resolve.modules`) or an
`alias`, prefix it with a `~`:

```js
url(~module/image.png) => require('module/image.png')
url('~module/image.png') => require('module/image.png')
url(~aliasDirectory/image.png) => require('otherDirectory/image.png')
```

#### `boolean`

Enable/disable `url()` resolving.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          url: true,
        },
      },
    ],
  },
};
```

#### `object`

Allows filtering of `url()` values.

Any filtered `url()` will not be resolved (left in the code as they were
written).

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          url: {
            filter: (url, resourcePath) => {
              // resourcePath - path to css file

              // Don't handle `img.png` urls
              if (url.includes("img.png")) {
                return false;
              }

              // Don't handle images under root-relative /external_images/
              if (/^\/external_images\//.test(url)) {
                return false;
              }

              return true;
            },
          },
        },
      },
    ],
  },
};
```

### `import`

- Type: {boolean|Object}
- **Default:** `true`.

```ts displayName="Type"
type importFn =
  | boolean
  | {
      filter: (
        url: string,
        media: string,
        resourcePath: string,
        supports?: string,
        layer?: string,
      ) => boolean;
    };
```

Allows you to enable or disable handling of `@import` at-rules. Controls how
`@import` statements are resolved. Absolute URLs in `@import` will be moved in
runtime code.

Example resolutions:

```css
@import 'style.css' => require('./style.css')
@import url(style.css) => require('./style.css')
@import url('style.css') => require('./style.css')
@import './style.css' => require('./style.css')
@import url(./style.css) => require('./style.css')
@import url('./style.css') => require('./style.css')
@import url('http://dontwritehorriblecode.com/style.css') => @import url('http://dontwritehorriblecode.com/style.css') in runtime
```

To import styles from a `node_modules` path (include `resolve.modules`) or an
`alias`, prefix it with a `~`:

```css
@import url(~module/style.css) => require('module/style.css')
@import url('~module/style.css') => require('module/style.css')
@import url(~aliasDirectory/style.css) => require('otherDirectory/style.css')
```

#### `boolean`

Enable/disable `@import` resolving.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          import: true,
        },
      },
    ],
  },
};
```

#### `object`

##### `filter`

- Type: {Function}
- **Default:** `undefined`.

```ts displayName="Type"
type filter = (url: string, media: string, resourcePath: string) => boolean;
```

Allows filtering of `@import`.

Any filtered `@import` will not be resolved (left in the code as they were
written).

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          import: {
            filter: (url, media, resourcePath) => {
              // resourcePath - path to css file

              // Don't handle `style.css` import
              if (url.includes("style.css")) {
                return false;
              }

              return true;
            },
          },
        },
      },
    ],
  },
};
```

### `modules`

- Type: {boolean|string|Object}
- **Default:** `undefined`.

```ts displayName="Type"
type modules =
  | boolean
  | "local"
  | "global"
  | "pure"
  | "icss"
  | {
      auto: boolean | regExp | ((resourcePath: string) => boolean);
      mode:
        | "local"
        | "global"
        | "pure"
        | "icss"
        | ((resourcePath) => "local" | "global" | "pure" | "icss");
      localIdentName: string;
      localIdentContext: string;
      localIdentHashSalt: string;
      localIdentHashFunction: string;
      localIdentHashDigest: string;
      localIdentRegExp: string | regExp;
      getLocalIdent: (
        context: LoaderContext,
        localIdentName: string,
        localName: string,
      ) => string;
      namedExport: boolean;
      exportGlobals: boolean;
      exportLocalsConvention:
        | "as-is"
        | "camel-case"
        | "camel-case-only"
        | "dashes"
        | "dashes-only"
        | ((name: string) => string);
      exportOnlyLocals: boolean;
      getJSON: ({
        resourcePath,
        imports,
        exports,
        replacements,
      }: {
        resourcePath: string;
        imports: object[];
        exports: object[];
        replacements: object[];
      }) => Promise<void> | void;
    };
```

Allows you to enable or disable CSS Modules or ICSS and configure them:

- `undefined`: Enables CSS modules for all files matching
  `/\.module\.\w+$/i.test(filename)` or `/\.icss\.\w+$/i.test(filename)` regexp.
- `true`: Enables CSS modules for all files.
- `false`: Disables CSS Modules for all files.
- `string`: Disables CSS Modules for all files and sets the `mode` option (see
  [mode][mode] for details).
- `object`: Enables CSS modules for all files unless the `modules.auto` option
  is provided, otherwise the `modules.auto` option will determine whether it is
  CSS Modules or not (see [auto](#auto) for more details).

The `modules` option enables/disables the [CSS Modules][css-modules]
specification and configures its behavior.

Setting `modules: false` can improve performance because we avoid parsing CSS
Modules features; this is useful for developers using vanilla CSS or other
technologies.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: true,
        },
      },
    ],
  },
};
```

#### Features

##### Scope

- Using `local` value requires you to specify `:global` classes.
- Using `global` value requires you to specify `:local` classes.
- Using `pure` value requires selectors to contain at least one local class or
  ID.

You can find more information on scoping modules [here][css-modules].

With CSS Modules, styles are scoped locally, preventing conflicts with global
styles.

Use `:local(.className)` to declare a `className` in the local scope. The local
identifiers are exported by the module.

- With `:local` (without parentheses) local mode can be switched `on` for this
  selector.
- The `:global(.className)` notation can be used to declare an explicit global
  selector.
- With `:global` (without parentheses) global mode can be switched `on` for
  this selector.

The loader replaces local selectors with unique, scoped identifiers. The chosen
unique identifiers are exported by the module.

```css
:local(.className) {
  background: red;
}
:local .className {
  color: green;
}
:local(.className .subClass) {
  color: green;
}
:local .className .subClass :global(.global-class-name) {
  color: blue;
}
```

Output (example):

```css
._23_aKvs-b8bW2Vg3fwHozO {
  background: red;
}
._23_aKvs-b8bW2Vg3fwHozO {
  color: green;
}
._23_aKvs-b8bW2Vg3fwHozO ._13LGdX8RMStbBE9w-t0gZ1 {
  color: green;
}
._23_aKvs-b8bW2Vg3fwHozO ._13LGdX8RMStbBE9w-t0gZ1 .global-class-name {
  color: blue;
}
```

Identifiers are exported:

```js
exports.locals = {
  className: "_23_aKvs-b8bW2Vg3fwHozO",
  subClass: "_13LGdX8RMStbBE9w-t0gZ1",
};
```

CamelCase naming is recommended for local selectors, as it simplifies usage in
imported JS modules.

Although you can use `:local(#someId)`, this is not recommended. Prefer classes
instead of IDs for modular styling.

##### Composing

When declaring a local class name, you can compose it from one or more other
local class names.

```css
:local(.className) {
  background: red;
  color: yellow;
}

:local(.subClass) {
  composes: className;
  background: blue;
}
```

This does not alter the final CSS output, but the generated `subClass` will
include both class names in its export.

```js
exports.locals = {
  className: "_23_aKvs-b8bW2Vg3fwHozO",
  subClass: "_13LGdX8RMStbBE9w-t0gZ1 _23_aKvs-b8bW2Vg3fwHozO",
};
```

```css
._23_aKvs-b8bW2Vg3fwHozO {
  background: red;
  color: yellow;
}

._13LGdX8RMStbBE9w-t0gZ1 {
  background: blue;
}
```

##### Importing

To import local class names from another module:

It is highly recommended to include file extensions when importing a file,
since it is possible to import a file with any extension and it is not known in
advance which file to use.

```css
:local(.continueButton) {
  composes: button from "library/button.css";
  background: red;
}
```

```css
:local(.nameEdit) {
  composes: edit highlight from "./edit.css";
  background: red;
}
```

To import from multiple modules use multiple `composes:` rules.

```css
:local(.className) {
  composes:
    edit highlight from "./edit.css",
    button from "module/button.css",
    classFromThisModule;
  background: red;
}
```

or

```css
:local(.className) {
  composes: edit highlight from "./edit.css";
  composes: button from "module/button.css";
  composes: classFromThisModule;
  background: red;
}
```

##### Values

You can use `@value` to specify values to be reused throughout a document.

We recommend following a naming convention:

- `v-` prefix for values
- `s-` prefix for selectors
- `m-` prefix for media at-rules.

```css
@value v-primary: #bf4040;
@value s-black: black-selector;
@value m-large: (min-width: 960px);

.header {
  color: v-primary;
  padding: 0 10px;
}

.s-black {
  color: black;
}

@media m-large {
  .header {
    padding: 0 20px;
  }
}
```

#### `boolean`

Enable CSS Modules features.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: true,
        },
      },
    ],
  },
};
```

#### `string`

Enable CSS Modules features and set up `mode`.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          // Using `local` value has same effect like using `modules: true`
          modules: "global",
        },
      },
    ],
  },
};
```

#### `object`

Enable CSS Modules features and configure its behavior through `options`.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            mode: "local",
            auto: true,
            exportGlobals: true,
            localIdentName: "[path][name]__[local]--[hash:base64:5]",
            localIdentContext: path.resolve(__dirname, "src"),
            localIdentHashSalt: "my-custom-hash",
            namedExport: true,
            exportLocalsConvention: "as-is",
            exportOnlyLocals: false,
            getJSON: ({ resourcePath, imports, exports, replacements }) => {},
          },
        },
      },
    ],
  },
};
```

##### `auto`

- Type: {boolean|RegExp|Function}
- **Default:** `undefined`.

```ts displayName="Type"
type auto =
  | boolean
  | regExp
  | ((
      resourcePath: string,
      resourceQuery: string,
      resourceFragment: string,
    ) => boolean);
```

Allows auto-enabling CSS modules or ICSS based on the file name, query or
fragment when the `modules` option is an object.

Possible values:

- `undefined`: Enables CSS modules for all files.
- `true`: Enables CSS modules for files matching
  `/\.module\.\w+$/i.test(filename)` and `/\.icss\.\w+$/i.test(filename)`
  regexp.
- `false`: Disables CSS Modules for all files.
- `RegExp`: Enables CSS modules for all files matching
  `/RegExp/i.test(filename)` regexp.
- `function`: Enables CSS Modules for files based on the file name satisfying
  your filter function check.

###### `boolean`

Possible values:

- `true`: Enables CSS modules or Interoperable CSS (ICSS) format, sets the
  [`modules.mode`][mode] option to `local` value for all files which satisfy
  `/\.module(s)?\.\w+$/i.test(filename)` condition or sets the
  [`modules.mode`][mode] option to `icss` value for all files which satisfy
  `/\.icss\.\w+$/i.test(filename)` condition.
- `false`: Disables CSS modules or ICSS format based on filename for all files.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            auto: true,
          },
        },
      },
    ],
  },
};
```

###### `RegExp`

Enables CSS modules for files based on the filename satisfying your regex check.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            auto: /\.custom-module\.\w+$/i,
          },
        },
      },
    ],
  },
};
```

###### `function`

Enables CSS Modules for files based on the filename, query or fragment
satisfying your filter function check.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            auto: (resourcePath, resourceQuery, resourceFragment) => {
              return resourcePath.endsWith(".custom-module.css");
            },
          },
        },
      },
    ],
  },
};
```

##### `mode`

- Type: {string|Function}
- **Default:** `'local'`.

```ts displayName="Type"
type mode =
  | "local"
  | "global"
  | "pure"
  | "icss"
  | ((
      resourcePath: string,
      resourceQuery: string,
      resourceFragment: string,
    ) => "local" | "global" | "pure" | "icss");
```

Set up the `mode` option. You can omit the value when you want `local` mode.

Controls the level of compilation applied to the input styles.

- The `local`, `global`, and `pure` handle `class` and `id` scoping and
  `@value` values.
- The `icss` will only compile the low-level Interoperable CSS (ICSS) format
  for declaring `:import` and `:export` dependencies between CSS and other
  languages.

ICSS underpins CSS Module support, and provides a low-level syntax for other
tools to implement CSS-module variations of their own.

###### `string`

Possible values - `local`, `global`, `pure`, and `icss`.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            mode: "global",
          },
        },
      },
    ],
  },
};
```

###### `function`

Allows setting different values for the `mode` option based on the filename,
query or fragment. Possible return values - `local`, `global`, `pure` and
`icss`.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            // Callback must return "local", "global", or "pure" values
            mode: (resourcePath, resourceQuery, resourceFragment) => {
              if (/pure.css$/i.test(resourcePath)) {
                return "pure";
              }

              if (/global.css$/i.test(resourcePath)) {
                return "global";
              }

              return "local";
            },
          },
        },
      },
    ],
  },
};
```

##### `localIdentName`

- Type: {string}
- **Default:** `'[hash:base64]'`.

```ts displayName="Type"
type localIdentName = string;
```

Allows configuring the generated local ident name.

For more information on options see:

- [webpack template strings](https://webpack.js.org/configuration/output/#template-strings),
- [output.hashDigest][output-hash-digest],
- [output.hashDigestLength][output-hash-digest-length],
- [output.hashFunction][output-hash-function],
- [output.hashSalt][output-hash-salt].

Supported template strings:

- `[name]` the basename of the resource
- `[folder]` the folder the resource is relative to the `compiler.context`
  option or `modules.localIdentContext` option.
- `[path]` the path of the resource relative to the `compiler.context` option
  or `modules.localIdentContext` option.
- `[file]` - filename and path.
- `[ext]` - extension with leading `.`.
- `[hash]` - the hash of the string, generated based on `localIdentHashSalt`,
  `localIdentHashFunction`, `localIdentHashDigest`, `localIdentHashDigestLength`,
  `localIdentContext`, `resourcePath` and `exportName`
- `[<hashFunction>:hash:<hashDigest>:<hashDigestLength>]` - hash with hash
  settings.
- `[local]` - original class.

Recommendations:

- Use `'[path][name]__[local]'` for development
- Use `'[hash:base64]'` for production

The `[local]` placeholder contains the original class.

All reserved characters (`<>:"/\|?*`) and control filesystem characters
(excluding characters in the `[local]` placeholder) will be converted to `-`.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            localIdentName: "[path][name]__[local]--[hash:base64:5]",
          },
        },
      },
    ],
  },
};
```

##### `localIdentContext`

- Type: {string}
- **Default:** `compiler.context`.

```ts displayName="Type"
type localIdentContex = string;
```

Allows redefining the basic loader context for local ident name.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            localIdentContext: path.resolve(__dirname, "src"),
          },
        },
      },
    ],
  },
};
```

##### `localIdentHashSalt`

- Type: {string}
- **Default:** `undefined`.

```ts displayName="Type"
type localIdentHashSalt = string;
```

Allows adding a custom hash to generate more unique classes.

For more information see [output.hashSalt][output-hash-salt].

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            localIdentHashSalt: "hash",
          },
        },
      },
    ],
  },
};
```

##### `localIdentHashFunction`

- Type: {string}
- **Default:** `md4`.

```ts displayName="Type"
type localIdentHashFunction = string;
```

Allows specifying a hash function to generate classes.

For more information see [output.hashFunction][output-hash-function].

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            localIdentHashFunction: "md4",
          },
        },
      },
    ],
  },
};
```

##### `localIdentHashDigest`

- Type: {string}
- **Default:** `hex`.

```ts displayName="Type"
type localIdentHashDigest = string;
```

Allows specifying a hash digest to generate classes.

For more information see [output.hashDigest][output-hash-digest].

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            localIdentHashDigest: "base64",
          },
        },
      },
    ],
  },
};
```

##### `localIdentHashDigestLength`

- Type: {number}
- **Default:** `20`.

```ts displayName="Type"
type localIdentHashDigestLength = number;
```

Allows specifying a hash digest length to generate classes.

For more information, see [output.hashDigestLength][output-hash-digest-length].

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            localIdentHashDigestLength: 5,
          },
        },
      },
    ],
  },
};
```

##### `hashStrategy`

- Type: {string}
- **Default:** `'resource-path-and-local-name'`.

Possible values - `'resource-path-and-local-name'` or `'minimal-subset'`.

Should the local name be used when computing the hash.

- `'resource-path-and-local-name'` Both resource path and local name are used
  when hashing. Each identifier in a module gets its own hash digest, always.
- `'minimal-subset'` Auto-detect if identifier names can be omitted from
  hashing. Use this value to optimize the output for better GZIP or Brotli
  compression.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            hashStrategy: "minimal-subset",
          },
        },
      },
    ],
  },
};
```

##### `localIdentRegExp`

- Type: {string|RegExp}
- **Default:** `undefined`.

```ts displayName="Type"
type localIdentRegExp = string | RegExp;
```

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            localIdentRegExp: /page-(.*)\.css/i,
          },
        },
      },
    ],
  },
};
```

##### `getLocalIdent`

- Type: {Function}
- **Default:** `undefined`.

```ts displayName="Type"
type getLocalIdent = (
  context: LoaderContext,
  localIdentName: string,
  localName: string,
) => string;
```

Allows specifying a function to generate the classname.

By default we use a built-in function to generate a classname.

If your custom function returns `null` or `undefined`, the built-in generator
is used as a `fallback`.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            getLocalIdent: (context, localIdentName, localName, options) => {
              return "whatever_random_class_name";
            },
          },
        },
      },
    ],
  },
};
```

##### `namedExport`

- Type: {boolean}
- **Default:** Depends on the value of the `esModule` option. If the value of
  the `esModule` option is `true`, `namedExport` defaults to `true`; otherwise,
  it defaults to `false`.

```ts displayName="Type"
type namedExport = boolean;
```

Enables or disables ES modules named export for locals.

The `default` class name cannot be used directly when `namedExport` is `true`
because `default` is a reserved keyword in ECMAScript modules. It is
automatically renamed to `_default`.

```css displayName="styles.css"
.foo-baz {
  color: red;
}
.bar {
  color: blue;
}
.default {
  color: green;
}
```

```js displayName="index.js"
import * as styles from "./styles.css";

// If using `exportLocalsConvention: "as-is"` (default value):
console.log(styles["foo-baz"], styles.bar);

// If using `exportLocalsConvention: "camel-case-only"`:
console.log(styles.fooBaz, styles.bar);

// For the `default` classname
console.log(styles["_default"]);
```

You can enable ES module named export using:

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          esModule: true,
          modules: {
            namedExport: true,
          },
        },
      },
    ],
  },
};
```

To set a custom name for `namedExport`, you can use the
[`exportLocalsConvention`](#exportlocalsconvention) option as a function. See
below in the [`examples`](#examples) section.

##### `exportGlobals`

- Type: {boolean}
- **Default:** `false`.

```ts displayName="Type"
type exportsGLobals = boolean;
```

Allow `css-loader` to export names from global class or ID, so you can use that
as a local name.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            exportGlobals: true,
          },
        },
      },
    ],
  },
};
```

##### `exportLocalsConvention`

- Type: {string|Function}
- **Default:** Depends on the value of the `modules.namedExport` option. If
  `true` - `as-is`; otherwise `camel-case-only` (class names converted to
  camelCase, original name removed).

```ts displayName="Type"
type exportLocalsConvention =
  | "as-is"
  | "camel-case"
  | "camel-case-only"
  | "dashes"
  | "dashes-only"
  | ((name: string) => string);
```

Names of locals are converted to camelCase when the named export is `false`,
i.e. the `exportLocalsConvention` option has the `camelCaseOnly` value by
default. You can set this back to any other valid option, but selectors which
are not valid JavaScript identifiers may run into problems which do not
implement the entire modules specification.

Style of exported class names.

###### `string`

By default, the exported JSON keys mirror the class names (i.e. `as-is` value).

|          Name           |   Type   | Description                                                                                         |
| :---------------------: | :------: | :-------------------------------------------------------------------------------------------------- |
|      **`'as-is'`**      | `string` | Class names will be exported as is.                                                                 |
|   **`'camel-case'`**    | `string` | Class names will be camelCased, but the original class name will not be removed from the locals.    |
| **`'camel-case-only'`** | `string` | Class names will be camelCased, and original class name will be removed from the locals.            |
|     **`'dashes'`**      | `string` | Only dashes in class names will be camelCased                                                       |
|   **`'dashes-only'`**   | `string` | Dashes in class names will be camelCased, the original class name will be removed from the locals   |

```css displayName="file.css"
.class-name {
}
```

```js displayName="file.js"
import { className } from "file.css";
```

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            exportLocalsConvention: "camel-case-only",
          },
        },
      },
    ],
  },
};
```

###### `function`

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            exportLocalsConvention: function (name) {
              return name.replace(/-/g, "_");
            },
          },
        },
      },
    ],
  },
};
```

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            exportLocalsConvention: function (name) {
              return [
                name.replace(/-/g, "_"),
                // dashesCamelCase
                name.replace(/-+(\w)/g, (match, firstLetter) =>
                  firstLetter.toUpperCase(),
                ),
              ];
            },
          },
        },
      },
    ],
  },
};
```

##### `exportOnlyLocals`

- Type: {boolean}
- **Default:** `false`.

```ts displayName="Type"
type exportOnlyLocals = boolean;
```

Export only locals.

Useful when you use CSS modules for pre-rendering (for example SSR). For
pre-rendering with `mini-css-extract-plugin` you should use this option instead
of `style-loader!css-loader` in the pre-rendering bundle. It doesn't embed CSS;
it only exports the identifier mappings.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            exportOnlyLocals: true,
          },
        },
      },
    ],
  },
};
```

##### `getJSON`

- Type: {Function}
- **Default:** `undefined`.

```ts displayName="Type"
type getJSON = ({
  resourcePath,
  imports,
  exports,
  replacements,
}: {
  resourcePath: string;
  imports: object[];
  exports: object[];
  replacements: object[];
}) => Promise<void> | void;
```

Enables a callback to output the CSS modules mapping JSON.

The callback is invoked with an object containing the following:

- `resourcePath`: the absolute path of the original resource, e.g.,
  `/foo/bar/baz.module.css`
- `imports`: an array of import objects with data about import types and file
  paths, e.g.,

```json
[
  {
    "type": "icss_import",
    "importName": "___CSS_LOADER_ICSS_IMPORT_0___",
    "url": "\"-!../../../../../node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[4].use[1]!../../../../../node_modules/postcss-loader/dist/cjs.js!../../../../../node_modules/sass-loader/dist/cjs.js!../../../../baz.module.css\"",
    "icss": true,
    "index": 0
  }
]
```

(Note that this will include all imports, not just those relevant to CSS
Modules.)

- `exports`: an array of export objects with exported names and values, e.g.,

```json
[
  {
    "name": "main",
    "value": "D2Oy"
  }
]
```

- `replacements`: an array of import replacement objects used for linking
  `imports` and `exports`, e.g.,

```json
{
  "replacementName": "___CSS_LOADER_ICSS_IMPORT_0_REPLACEMENT_0___",
  "importName": "___CSS_LOADER_ICSS_IMPORT_0___",
  "localName": "main"
}
```

Using `getJSON`, it's possible to output a file with all CSS module mappings.

In the following example, we use `getJSON` to cache canonical mappings and add
stand-ins for any composed values (through `composes`), and we use a custom
plugin to consolidate the values and output them to a file:

```js displayName="webpack.config.js"
const path = require("path");
const fs = require("fs");

const CSS_LOADER_REPLACEMENT_REGEX =
  /(___CSS_LOADER_ICSS_IMPORT_\d+_REPLACEMENT_\d+___)/g;
const REPLACEMENT_REGEX = /___REPLACEMENT\[(.*?)]\[(.*?)]___/g;
const IDENTIFIER_REGEX = /\[(.*?)]\[(.*?)]/;
const replacementsMap = {};
const canonicalValuesMap = {};
const allExportsJson = {};

function generateIdentifier(resourcePath, localName) {
  return `[${resourcePath}][${localName}]`;
}

function addReplacements(resourcePath, imports, exportsJson, replacements) {
  const importReplacementsMap = {};

  // create a dict to quickly identify imports and get their absolute stand-in strings in the currently loaded file
  // e.g., { '___CSS_LOADER_ICSS_IMPORT_0_REPLACEMENT_0___': '___REPLACEMENT[/foo/bar/baz.css][main]___' }
  importReplacementsMap[resourcePath] = replacements.reduce(
    (acc, { replacementName, importName, localName }) => {
      const replacementImportUrl = imports.find(
        (importData) => importData.importName === importName,
      ).url;
      const relativePathRe = /.*!(.*)"/;
      const [, relativePath] = replacementImportUrl.match(relativePathRe);
      const importPath = path.resolve(path.dirname(resourcePath), relativePath);
      const identifier = generateIdentifier(importPath, localName);
      return { ...acc, [replacementName]: `___REPLACEMENT${identifier}___` };
    },
    {},
  );

  // iterate through the raw exports and add stand-in variables
  // ('___REPLACEMENT[<absolute_path>][<class_name>]___')
  // to be replaced in the plugin below
  for (const [localName, classNames] of Object.entries(exportsJson)) {
    const identifier = generateIdentifier(resourcePath, localName);

    if (CSS_LOADER_REPLACEMENT_REGEX.test(classNames)) {
      // if there are any replacements needed in the concatenated class names,
      // add them all to the replacements map to be replaced altogether later
      replacementsMap[identifier] = classNames.replaceAll(
        CSS_LOADER_REPLACEMENT_REGEX,
        (_, replacementName) =>
          importReplacementsMap[resourcePath][replacementName],
      );
    } else {
      // otherwise, no class names need replacements so we can add them to
      // canonical values map and all exports JSON verbatim
      canonicalValuesMap[identifier] = classNames;

      allExportsJson[resourcePath] = allExportsJson[resourcePath] || {};
      allExportsJson[resourcePath][localName] = classNames;
    }
  }
}

function replaceReplacements(classNames) {
  return classNames.replaceAll(
    REPLACEMENT_REGEX,
    (_, resourcePath, localName) => {
      const identifier = generateIdentifier(resourcePath, localName);

      if (identifier in canonicalValuesMap) {
        return canonicalValuesMap[identifier];
      }

      // Recurse through other stand-in that may be imports
      const canonicalValue = replaceReplacements(replacementsMap[identifier]);

      canonicalValuesMap[identifier] = canonicalValue;

      return canonicalValue;
    },
  );
}

function getJSON({ resourcePath, imports, exports, replacements }) {
  const exportsJson = exports.reduce((acc, { name, value }) => {
    return { ...acc, [name]: value };
  }, {});

  if (replacements.length > 0) {
    // replacements present --> add stand-in values for absolute paths and local names,
    // which will be resolved to their canonical values in the plugin below
    addReplacements(resourcePath, imports, exportsJson, replacements);
  } else {
    // no replacements present --> add to canonicalValuesMap verbatim
    // since all values here are canonical/don't need resolution
    for (const [key, value] of Object.entries(exportsJson)) {
      const id = `[${resourcePath}][${key}]`;

      canonicalValuesMap[id] = value;
    }

    allExportsJson[resourcePath] = exportsJson;
  }
}

class CssModulesJsonPlugin {
  constructor(options) {
    this.options = options;
  }

  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.emit.tap("CssModulesJsonPlugin", () => {
      for (const [identifier, classNames] of Object.entries(replacementsMap)) {
        const adjustedClassNames = replaceReplacements(classNames);

        replacementsMap[identifier] = adjustedClassNames;

        const [, resourcePath, localName] = identifier.match(IDENTIFIER_REGEX);

        allExportsJson[resourcePath] = allExportsJson[resourcePath] || {};
        allExportsJson[resourcePath][localName] = adjustedClassNames;
      }

      fs.writeFileSync(
        this.options.filepath,
        JSON.stringify(
          // Make path to be relative to `context` (your project root)
          Object.fromEntries(
            Object.entries(allExportsJson).map((key) => {
              key[0] = path
                .relative(compiler.context, key[0])
                .replace(/\\/g, "/");

              return key;
            }),
          ),
          null,
          2,
        ),
        "utf8",
      );
    });
  }
}

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: { modules: { getJSON } },
      },
    ],
  },
  plugins: [
    new CssModulesJsonPlugin({
      filepath: path.resolve(__dirname, "./output.css.json"),
    }),
  ],
};
```

In the above, all import aliases are replaced with
`___REPLACEMENT[<resourcePath>][<localName>]___` in `getJSON`, and they're
resolved in the custom plugin. All CSS mappings are contained in
`allExportsJson`:

```json
{
  "foo/bar/baz.module.css": {
    "main": "D2Oy",
    "header": "thNN"
  },
  "foot/bear/bath.module.css": {
    "logo": "sqiR",
    "info": "XMyI"
  }
}
```

This is saved to a local file named `output.css.json`.

### `importLoaders`

- Type: {number}
- **Default:** `0`.

```ts displayName="Type"
type importLoaders = number;
```

Allows enabling/disabling or setting up the number of loaders applied before
the CSS loader for `@import` at-rules, CSS Modules and ICSS imports, i.e.
`@import`/`composes`/`@value value from './values.css'`/etc.

The `importLoaders` option allows you to configure how many loaders before
`css-loader` should be applied to `@import`ed resources and CSS Modules/ICSS
imports.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
              // 0 => no loaders (default);
              // 1 => postcss-loader;
              // 2 => postcss-loader, sass-loader
            },
          },
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
};
```

This may change in the future when the module system (i.e. webpack) supports
loader matching by origin.

### `sourceMap`

- Type: {boolean}
- **Default:** depends on the `compiler.devtool` value.

```ts displayName="Type"
type sourceMap = boolean;
```

By default, generation of source maps depends on the [`devtool`](https://webpack.js.org/configuration/devtool/)
option. All values enable source map generation except `eval` and `false`
values.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          sourceMap: true,
        },
      },
    ],
  },
};
```

### `esModule`

- Type: {boolean}
- **Default:** `true`.

```ts displayName="Type"
type esModule = boolean;
```

By default, `css-loader` generates JS modules that use the ES modules syntax.

There are some cases in which using ES modules is beneficial, like in the case
of [module concatenation](https://webpack.js.org/plugins/module-concatenation-plugin/) and [tree shaking](https://webpack.js.org/guides/tree-shaking/).

You can enable CommonJS module syntax using:

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          esModule: false,
        },
      },
    ],
  },
};
```

### `exportType`

- Type: {string}
- **Default:** `'array'`.

```ts displayName="Type"
type exportType = "array" | "string" | "css-style-sheet";
```

Allows exporting styles as an array with modules, a string, or a [constructable
stylesheet][constructable-stylesheets] (i.e. [`CSSStyleSheet`][css-style-sheet]).

The default value is `'array'`, i.e. the loader exports an array of modules with
a specific API which is used in `style-loader` or other.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        assert: { type: "css" },
        loader: "css-loader",
        options: {
          exportType: "css-style-sheet",
        },
      },
    ],
  },
};
```

```js displayName="src/index.js"
import sheet from "./styles.css" assert { type: "css" };

document.adoptedStyleSheets = [sheet];
shadowRoot.adoptedStyleSheets = [sheet];
```

#### `'array'`

The default export is an array of modules with a specific API which is used in
`style-loader` or other.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/i,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      },
    ],
  },
};
```

```js displayName="src/index.js"
// `style-loader` applies styles to DOM
import "./styles.css";
```

#### `'string'`

You should not use [`style-loader`][style-loader] or
[`mini-css-extract-plugin`][mini-css-extract-plugin] with this value. The
`esModule` option should be enabled if you want to use it with
[`CSS modules`][modules]. By default, for locals,
[named export][named-export] will be used.

The default export is a `string`.

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/i,
        use: ["css-loader", "postcss-loader", "sass-loader"],
      },
    ],
  },
};
```

```js displayName="src/index.js"
import sheet from "./styles.css";

console.log(sheet);
```

#### `'css-style-sheet'`

`@import` rules are not yet allowed, more [information](https://web.dev/css-module-scripts/#@import-rules-not-yet-allowed).

You don't need [`style-loader`][style-loader] anymore, please remove it.

The `esModule` option should be enabled if you want to use it with
[`CSS modules`][modules]. By default, for locals,
[named export][named-export] will be used.

Source maps are not currently supported in `Chrome` due to a
[bug](https://bugs.chromium.org/p/chromium/issues/detail?id=1174094&q=CSSStyleSheet%20source%20maps&can=2).

The default export is a [constructable stylesheet][constructable-stylesheets]
(i.e. [`CSSStyleSheet`][css-style-sheet]).

Useful for [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) and shadow DOM.

More information:

- [Using CSS Module Scripts to import stylesheets](https://web.dev/css-module-scripts/)
- [Constructable Stylesheets: seamless reusable styles][constructable-stylesheets]

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        assert: { type: "css" },
        loader: "css-loader",
        options: {
          exportType: "css-style-sheet",
        },
      },

      // For Sass/SCSS:
      //
      // {
      //   assert: { type: "css" },
      //   rules: [
      //     {
      //       loader: "css-loader",
      //       options: {
      //         exportType: "css-style-sheet",
      //         // Other options
      //       },
      //     },
      //     {
      //       loader: "sass-loader",
      //       options: {
      //         // Other options
      //       },
      //     },
      //   ],
      // },
    ],
  },
};
```

```js displayName="src/index.js"
// Example for Sass/SCSS:
// import sheet from "./styles.scss" assert { type: "css" };

// Example for CSS modules:
// import sheet, { myClass } from "./styles.scss" assert { type: "css" };

// Example for CSS:
import sheet from "./styles.css" assert { type: "css" };

document.adoptedStyleSheets = [sheet];
shadowRoot.adoptedStyleSheets = [sheet];
```

For migration purposes, you can use the following configuration:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        oneOf: [
          {
            assert: { type: "css" },
            loader: "css-loader",
            options: {
              exportType: "css-style-sheet",
              // Other options
            },
          },
          {
            use: [
              "style-loader",
              {
                loader: "css-loader",
                options: {
                  // Other options
                },
              },
            ],
          },
        ],
      },
    ],
  },
};
```

## Examples

### Recommend

For `production` builds, it's recommended to extract the CSS from your bundle,
being able to use parallel loading of CSS/JS resources later on.

This can be achieved by using the [mini-css-extract-plugin][mini-css-extract-plugin],
because it creates separate CSS files.

For `development` mode (including `webpack-dev-server`) you can use
[style-loader][style-loader], because it injects CSS into the DOM using multiple
`<style></style>` and works faster.

Do not use `style-loader` and `mini-css-extract-plugin` together.

```js displayName="webpack.config.js"
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== "production";

module.exports = {
  module: {
    rules: [
      {
        // If you enable `experiments.css` or `experiments.futureDefaults`, please uncomment line below
        // type: "javascript/auto",
        test: /\.(sa|sc|c)ss$/i,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [].concat(devMode ? [] : [new MiniCssExtractPlugin()]),
};
```

### Disable URL resolving using the `/* webpackIgnore: true */` comment

With the help of the `/* webpackIgnore: true */` comment, it is possible to
disable sources handling for rules and for individual declarations.

```css
/* webpackIgnore: true */
@import url(./basic.css);
@import /* webpackIgnore: true */ url(./imported.css);

.class {
  /* Disabled url handling for the all urls in the 'background' declaration */
  color: red;
  /* webpackIgnore: true */
  background: url("./url/img.png"), url("./url/img.png");
}

.class {
  /* Disabled url handling for the first url in the 'background' declaration */
  color: red;
  background:
    /* webpackIgnore: true */ url("./url/img.png"), url("./url/img.png");
}

.class {
  /* Disabled url handling for the second url in the 'background' declaration */
  color: red;
  background:
    url("./url/img.png"),
    /* webpackIgnore: true */ url("./url/img.png");
}

/* prettier-ignore */
.class {
  /* Disabled url handling for the second url in the 'background' declaration */
  color: red;
  background: url("./url/img.png"),
    /* webpackIgnore: true */
    url("./url/img.png");
}

/* prettier-ignore */
.class {
  /* Disabled url handling for third and sixth urls in the 'background-image' declaration */
  background-image: image-set(
    url(./url/img.png) 2x,
    url(./url/img.png) 3x,
    /* webpackIgnore:  true */ url(./url/img.png) 4x,
    url(./url/img.png) 5x,
    url(./url/img.png) 6x,
    /* webpackIgnore:  true */
    url(./url/img.png) 7x
  );
}
```

### Assets

The following `webpack.config.js` can load CSS files, embed small
PNG/JPG/GIF/SVG images as well as fonts as [Data URLs](https://tools.ietf.org/html/rfc2397) and copy
larger files to the output directory.

For webpack v5:

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        // More information here https://webpack.js.org/guides/asset-modules/
        type: "asset",
      },
    ],
  },
};
```

### Extract

For production builds it's recommended to extract the CSS from your bundle to
enable parallel loading of CSS/JS resources later on.

- This can be achieved by using the
  [mini-css-extract-plugin][mini-css-extract-plugin] to extract the CSS when
  running in production mode.
- As an alternative, if seeking better development performance and CSS outputs
  that mimic production, [extract-css-chunks-webpack-plugin](https://github.com/faceyspacey/extract-css-chunks-webpack-plugin)
  offers a hot module reload friendly, extended version of
  mini-css-extract-plugin. It HMRs real CSS files in dev, and works like
  mini-css in non-dev.

### Pure CSS, CSS Modules and PostCSS

When you have pure CSS (without CSS modules), CSS modules and PostCSS in your
project, you can use this setup:

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        // For pure CSS - /\.css$/i,
        // For Sass/SCSS - /\.((c|sa|sc)ss)$/i,
        // For Less - /\.((c|le)ss)$/i,
        test: /\.((c|sa|sc)ss)$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              // Run `postcss-loader` on each CSS `@import` and CSS modules/ICSS imports, do not forget that `sass-loader` compile non CSS `@import`'s into a single file
              // If you need run `sass-loader` and `postcss-loader` on each CSS `@import` please set it to `2`
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
            options: { plugins: () => [postcssPresetEnv({ stage: 0 })] },
          },
          // Can be `less-loader`
          {
            loader: "sass-loader",
          },
        ],
      },
      // For webpack v5
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        // More information here https://webpack.js.org/guides/asset-modules/
        type: "asset",
      },
    ],
  },
};
```

### Resolve unresolved URLs using an alias

```css displayName="index.css"
.class {
  background: url(/assets/unresolved/img.png);
}
```

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    alias: {
      "/assets/unresolved/img.png": path.resolve(
        __dirname,
        "assets/real-path-to-img/img.png",
      ),
    },
  },
};
```

### Named export with custom export names

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: {
            namedExport: true,
            exportLocalsConvention: function (name) {
              return name.replace(/-/g, "_");
            },
          },
        },
      },
    ],
  },
};
```

### Separating `Interoperable CSS`-only and `CSS Module` features

The following setup is an example of allowing `Interoperable CSS` features only
(such as `:import` and `:export`) without using further `CSS Module`
functionality by setting the `mode` option for all files that do not match the
`*.module.scss` naming convention. This is for reference, as having `ICSS`
features applied to all files was default `css-loader` behavior before v4.

Meanwhile, all files matching `*.module.scss` are treated as `CSS Modules` in
this example.

An example case is assumed where a project requires canvas drawing variables to
be synchronized with CSS - canvas drawing uses the same color (set by color name
in JavaScript) as HTML background (set by class name in CSS).

```js displayName="webpack.config.js"
module.exports = {
  module: {
    rules: [
      // ...
      // --------
      // SCSS ALL EXCEPT MODULES
      {
        test: /\.scss$/i,
        exclude: /\.module\.scss$/i,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                mode: "icss",
              },
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      // --------
      // SCSS MODULES
      {
        test: /\.module\.scss$/i,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                mode: "local",
              },
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      // --------
      // ...
    ],
  },
};
```

`variables.scss`, treated as `ICSS`-only:

```scss displayName="variables.scss"
$colorBackground: red;
:export {
  colorBackgroundCanvas: $colorBackground;
}
```

`Component.module.scss`, treated as a `CSS Module`:

```scss displayName="Component.module.scss"
@import "variables.scss";
.componentClass {
  background-color: $colorBackground;
}
```

`Component.jsx`, using both `CSS Module` functionality as well as SCSS variables
directly in JavaScript:

```jsx displayName="Component.jsx"
import * as svars from "variables.scss";
import * as styles from "Component.module.scss";

// Render DOM with CSS modules class name
// <div className={styles.componentClass}>
//   <canvas ref={mountsCanvas}/>
// </div>

// Somewhere in JavaScript canvas drawing code use the variable directly
// const ctx = mountsCanvas.current.getContext('2d',{alpha: false});
ctx.fillStyle = `${svars.colorBackgroundCanvas}`;
```

[css-modules]: https://github.com/css-modules/css-modules
[style-loader]: https://github.com/webpack/style-loader
[mini-css-extract-plugin]: https://github.com/webpack/mini-css-extract-plugin
[constructable-stylesheets]: https://developers.google.com/web/updates/2019/02/constructable-stylesheets
[css-style-sheet]: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet
[output-hash-digest]: https://webpack.js.org/configuration/output/#outputhashdigest
[output-hash-digest-length]: https://webpack.js.org/configuration/output/#outputhashdigestlength
[output-hash-function]: https://webpack.js.org/configuration/output/#outputhashfunction
[output-hash-salt]: https://webpack.js.org/configuration/output/#outputhashsalt
