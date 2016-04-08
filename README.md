canidiff
===========


Install with `npm install -g canidiff`.

Use:

`canidiff [args] <browser> [browser]`

canidiff uses [Browserslist](https://github.com/ai/browserslist), if Browserslist return list, canidiff will use first one.

when there is only 1 browser, it will diff from last version of the same type browser;

For example:

```
$ canidiff 'chrome 47'
features                                 chrome 47  chrome 49
CSS font-feature-settings                   ✔ ⁻         ✔
CSS Canvas Drawings                         ✔ ⁻         ✘
Toolbar/context menu                       ✘ ⚑ ³      ✘ ⚑ ²
CSS Variables (Custom Properties)            ✘          ✔
CSS font-stretch                             ✘          ✔
let                                         ◒ ³         ✔
Proxy object                                 ✘          ✔
KeyboardEvent.code                         ✘ ⚑ ¹        ✔
Brotli Accept-Encoding/Content-Encoding      ✘        ✘ ⚑ ¹
rel=noopener                                 ✘          ✔
```

or:

```
$ canidiff 'ios 9.2' 'ios 9.3'
features                           ios_saf 9.0-9.2  ios_saf 9.3
CSS font-feature-settings                 ✘              ✔
CSS Filter Effects                       ✔ ⁻             ✔
CSS Variables (Custom Properties)         ✘              ✔
CSS will-change property                  ✘              ✔
Picture element                           ✘              ✔
CSS touch-action property                 ✘              ✔
Content Security Policy Level 2           ✘              ✔
CSS font-variant-alternates               ✘              ✔
CSS all property                          ✘              ✔
CSS unset value                           ✘              ✔
CSS revert value                          ✘              ✔
```

