# react-structured-query-search 🎉

[![NPM](https://img.shields.io/npm/v/react-structured-query-search.svg)](https://www.npmjs.com/package/react-structured-query-search) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

react-structured-query-search is a javascript library that provides autocomplete search queries.  
This was inspired by [visualsearch](http://documentcloud.github.io/visualsearch) and
[react-structured-filter](https://github.com/SummitRoute/react-structured-filter)

>This plugin is written on top of [react-structured-filter](https://github.com/SummitRoute/react-structured-filter), which has been revamped to add React 16 support and the existing code has been overriden to support New features.

You can use all the [react-typeahead](https://github.com/fmoo/react-typeahead), [react-structured-filter](https://github.com/SummitRoute/react-structured-filter)  API(options) as they are.

## 🎉🎊 New Features 🎊🎉

* Ajax support to retrieve values.
* Allows user to send values for Category in `Array<String>` or `Array<Object>`
* Allows user to pass custom loader component.
* Allows user to customize the header of dropdown (categories, operators, values).
* Allows user to enable/disable operators in search.
* Allows user to perform category-value search without operator (if isAllowOperator is false).
* Switch between unique/duplicate categories (key).
* Switch between unique/duplicate values
* Allows user to send custom operators list.
* Allows user to render custom tag(token) Component or the tag(token) Item.
* Allows user to update Options(props) on runtime.



## Install

```bash
npm install --save react-structured-query-search
```

## Usage ([Example Code](https://github.com/kevalbhatt/react-structured-query-search/blob/master/example/src/App.js)) ([Demo](https://kevalbhatt.github.io/react-structured-query-search/))

If you want to use `Tokenizer` then you either import as follows:

```jsx
import ReactStructuredQuerySearch from "react-structured-query-search";
import "react-structured-query-search/dist/index.css";
```
#### or

```jsx
import {Tokenizer} from "react-structured-query-search";
import "react-structured-query-search/dist/index.css";
```
---

If you want to use `Typeahead` then you have to import as follows:

```jsx
import {Typeahead} from "react-structured-query-search";
import "react-structured-query-search/dist/index.css";
```

# API

### New flexible modification/existing options


| Parameter | Type | Default | Description |
| :---------|:---- |:--------|:----------- | 
| **options** | `Array` | [] | An array supplied to the filter function.|
| **maxVisible** | `Number`||Limit the number of options rendered in the results list.|
| **customClasses** | `Object`||Allowed Keys: <ul><li>`input`</li><li>`results`</li><li>`listItem`</li><li>`listAnchor`</li><li>`hover`</li><li>`typeahead`</li><li>`resultsTruncated`</li><li>`token`</li></ul><div>An object containing custom class names for child elements. Useful for integrating with 3rd party UI kits.</div>|
| **placeholder** | `String` || Placeholder text for the typeahead input.|
| :new: **disabled** | `Boolean`| `false` | Set to `true` for disabling the StructureQuerySearch |
| :new: **defaultSelected**| `function, Array` | `[]` | Allows user to initialize the search with selected values |
| :new: **categoryHeader** | `String, Component` | `"Category"` | Allows user the change the header title of `Category` |
| :new: **operatorHeader** | `String, Component` | `"Operator"` | Allows user the change the header title of `Operator` |
| :new: **valueHeader** | `String, Component` | `"Value"` | Allows user the change the header title of `Value` |
| :new: **isAllowSearchDropDownHeader** | `Boolean` | `"true"` | Allows user to `enable/disable` search drop-down header  |
| :new: **isAllowOperator** | `Boolean` | `false` | Allows user to `enable/disable` operators in search |
| :new: **isAllowClearAll**| `Boolean` | `true` | Allows user to clear all selected data |
| **onTokenRemove**| `Function`||Event handler triggered whenever a token is removed.|
| **onTokenAdd** |`Function`||Event handler triggered whenever a token is added.<div>Params: `(addedToken)`</div>|
| :new: **onClearAll** | `function`||Event handler triggered whenever clear all button clicked |
| **onOptionSelected** |`Function`||Event handler triggered whenever a user picks an option.|
| :new: **updateOptions** | `function` || Allows user to update the Options(props) at runtime, this function is called before `onTokenRemove` and `onTokenAdd` |
| :new: **fuzzySearchEmptyMessage** | `String` | `"No result found"` | This message is shown when dropdown doesn't have search value |
| :new: **renderLoading** | `function, Component` | `"Loading...."` | Show custom loader when values are retrieved using Ajax |
| :new: **renderTokens** | `function` || Allows user to render custome Token Component|
| :new: **renderTokenItem** | `function` || Allows user to render custome Token Item |
| :new: **renderSearchItem** | `function` || Allows user to render custome value |
| **onKeyDown** | `Function`||Event handler for the `keyDown` event on the typeahead input.|
| **onKeyPress** | `Function`||Event handler for the `keyPress` event on the typeahead input.|
| **onKeyUp** | `Function`||Event handler for the `keyUp` event on the typeahead input.|
| **onBlur** | `Function`||Event handler for the `blur` event on the typeahead input.|
| **onFocus** | `Function`||Event handler for the `focus` event on the typeahead input.|

### props.options (Data attributes)

| Parameter | Type | Default | Required | Description|
|:---------|:---- |:---- |:--------|:----------- | 
| **category** | `String` ||`required` | Name of the first thing the user types.|
| **type** | `String` |`text`||This can be one of the following:<ul><li><b>text</b>: Arbitrary text for the value. No autocomplete options.<ul><li>Operator choices will be: "==", "!=", "contains", "!contains".</li></ul> </li><li><b>textoptions</b>: You must additionally pass an <tt>options</tt> value</tt>. <ul><li>Operator choices will be: "==", "!=".</li></ul></li><li><b>number</b>: Arbitrary text for the value. No autocomplete options.<ul><li>Operator choices will be: "==", "!=", "&lt;", "&lt;=", "&gt;", "&gt;=".</li></ul> </li><li><b>date</b>: Shows a calendar and the input must be of the form "YYYY-MM-DD".<ul><li>Operator choices will be: "==", "!=", "&lt;", "&lt;=", "&gt;", "&gt;=".</li></ul></li></ul>|
| :new: **operator** | `Array, function` | | required, if  `isAllowOperator` prop is set to `true`| If this attribute is added then it would ignore the type check as described in `type` parameter and it would accept what you have passed|
| **options** | `Array, function, Promise` | |`required, if type="textoptions"` | Get the value according to selected category |
| :new: **isAllowCustomValue** | `Boolean` |`false`|| <div> When this parameter is set to `true`, it allows you to send multiple custom values for `type=textoptions`</div> |
| :new: **isAllowDuplicateCategories** | `Boolean` | `true` || Switch between `unique/duplicate` categories (key) |
| :new: **isAllowDuplicateOptions** | `Boolean` | `false` ||Switch between `unique/duplicate` values |
| :new: **fuzzySearchKeyAttribute** | `String` |`name`|| If Category (options)values are `Array<Object>` then By default fuzzy search look for `name` attribute inside options(values) but you can change that attribut lookup key using `fuzzySearchKeyAttribute`|

## How to Contribute

### Setting Up

 Please run `npm install` in the root and example folders. then do the following:

* Go to root folder and run `npm start` after this 
* Go to example folder and run `npm run link` (only for first time)
* Go to example folder and run `npm start` it would run the plugin from link which we have created.

Now, anytime you make a change to your library in src/ or to the example app's example/src `create-react-app` will live-reload your local dev server so you can iterate on your component in real-time.

## License

MIT © [kevalbhatt](https://github.com/kevalbhatt)
