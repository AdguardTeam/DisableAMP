# Disable AMP by AdGuard

This is a very simple userscript that disables AMP pages on the Google search results page.

## Run build
`yarn install`

| Command           | Output Dir    |
|---                |---            |
| `yarn dev`        | build/dev     |
| `yarn beta`       | build/beta    |
| `yarn release`    | build/release |


---
## Metadata

_Placeholder_ - string in format `[PLACEHOLDER_NAME]` which will be replaced with metadata field.

_Field_ or _Metadata field_ - result string of metadata, e.g:
```js
// @description:en Userscript description text  
```

### How to change?

Remove, add or replace placeholders in file `meta.template.js`.

To specify the data for placeholders change the `meta.settings.js`.

```js
// meta.settings.js file structure

const releaseChannels = {
    common: options,
    dev: options,
    beta: options,
    release: options,
};
```

`common` - object with options which will be applied for all builds, you can redefine these options for specific release channel.

`dev`, `beta`, `release` - contains options for corresponding builds.

**options**

`filename` - the name of userscript metadata file, plugin creates new file in format `[filename].meta.js`.

`postfix` - string , default `''`, you can specify postfix for some fields (requires `usePostfix:true` flag for `fieldOptions`).

`metadataTemplate` - default `metadata.template.js`, relative path to template of metadata.

`localesDir` - default `./locales`, relative path to directorty with locales.

`fields` - the object, where key is the name of placeholder and value is a string or `fieldOptions` object.


**fieldOptions**

If the data for field should be taken from translation, you need to use `fieldOptions`
```js
const releaseChannels = {
    ...
        dev: {
            filename: 'userscript-boilerplate',
            postfix: 'Dev',
            localesDir: './_locales',
            fields: {
                URL: 'http:example.org',

                // fieldOptions
                USERSCRIPT_NAME: {
                    messageKey: 'some_name',
                    metaName: 'name',
                    usePostfix: true,
                }
            }
        },
    ...
}
```

`messageKey` - string, key in translation file for this field.

`metaName` - string, name of field in output metadata file.

`usePostfix` - boolean, default `false`, use postfix for this field.

---

## Translations

- add needed locales codes to `const LOCALES = ['en', 'ru'];` array
- run `yarn locales:download` to download translations
- run `yarn locales:upload` to update current tranlations in Crowdin


## Run tests

`yarn test`

### How to add new one?

- Add new file with tests in directory `./tests`
- Add `import './path-to-your-file'` in `index.test.js`

---

## Run linter
`yarn lint`

---

## TODO:

* [ ] Fix AMP on Google images