# Implementation Notes

## node

- Make sure to have all import paths ending on `.js` (even in Typescript!) because otherwise plain ESM import in node fails
- Make sure to have `"type": "module"` set in `package.json` to enable ESM

