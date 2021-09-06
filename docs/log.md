# Logging

## Features

- Multiple handlers
- Colorful output
- Extendable
- Correct source code backlinks in browsers

## How to use

```js
import { Logger } from "zeed"

const log = Logger("app")

log("Debug")
log.info("Log this info")
```

By default, the most suitable log handlers are used, but it is also possible to set (`Logger.setHandlers([handlers])`) or add (`Logger.registerHandler(handler)`) new log handlers. You can choose from:

- `LoggerConsoleHandler(opt)`: Plain basic output via `console` (default)
- `LoggerBrowserHandler(opt)`: Colorful log entries
- `LoggerNodeHandler(opt)`: Colorful logging for node.js
- `LoggerFileHandler(path, opt)`: Write to file

`opt` are general option like `level` for the log level or `filter` for custom filtering (see below). But it can also hold individual settings specific for a log handler.

Write custom ones e.g. for [breadcrumb tracking in Sentry.io](https://gist.github.com/holtwick/949d04151586cec529a671859ebbb650) or showing notifications to users on errors in a UI.

You can use `Logger` in submodules and Zeed will make sure all logging goes through the same handlers, no matter what bundler is used. With `Logger.setLock(true)` any further changes to handlers, factories and log levels can be forbidden, to ensure no conflicting settings with submodules. You should set up the Logging very early in your main project before loading submodules.

In the browser try calling `activateConsoleDebug()`, this will set only one logger which is closely bound to `console` with the nice effect, that source code references in the web console will point to the line where the log statement has been called. This is an example output on Safari:

<img src=".assets/safari-console.png" style="max-width:100%">

Output can be filtered by setting `Logger.setFilter(filter)` following the well known [debug syntax](https://github.com/visionmedia/debug#wildcards). For the browser console you can also set like `localStorage.debug = "*"` or for node console like `process.env.DEBUG = "*"` (or put a `DEBUG="*"` in front of the execution call). `process.env.ZEED` and `localStorage.zeed` supersede `DEBUG`.

Loggers can be extended. `const newLog = log.extend("demo")` will append `:demo` to the current namespace.

## Alternatives

- [debug](https://github.com/visionmedia/debug)
- [tslog](https://github.com/fullstack-build/tslog)
- [winston](https://github.com/winstonjs/winston)
