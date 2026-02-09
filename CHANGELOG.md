# Changelog

## [3.0.0](https://github.com/alonronin/mockingoose/compare/v2.15.0...v3.0.0) (2026-02-09)


### ⚠ BREAKING CHANGES

* Drop support for mongoose <9. Removed operations: count(), update(), remove(), findOneAndRemove(). Minimum Node.js >=20. Migrated from Jest to Vitest. New ESM+CJS dual build via tsdown.

### Features

* allow updates to be accessed using getUpdate ([#79](https://github.com/alonronin/mockingoose/issues/79)) ([a507390](https://github.com/alonronin/mockingoose/commit/a5073907a65f33b62ced9596292e592cfcfb2d9d))
* upgrade to mongoose 9 ([3b1a6a4](https://github.com/alonronin/mockingoose/commit/3b1a6a4c6e4545d66f0ae21792637105c7cf8e37))


### Bug Fixes

* 80 issue: added support Query.prototype.orFail() ([8a81e71](https://github.com/alonronin/mockingoose/commit/8a81e71cd6c0b91f2f23113c74d15a21116e0c26))
* Use supported docker image ([0db4898](https://github.com/alonronin/mockingoose/commit/0db489811547712023fd1383c3d6f2aa334f3285))
