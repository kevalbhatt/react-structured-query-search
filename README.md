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
```
#### or

```jsx
import {Tokenizer} from "react-structured-query-search";
```
---

If you want to use `Typeahead` then you have to import as follows:

```jsx
import {Typeahead} from "react-structured-query-search";
```

# API

### New flexible modification options


| Parameter | Type | Default | Description |
| :---------|:---- |:--------|:----------- | 
| **categoryHeader** | `String, Component` | `"Category"` | Allows user the change the header title of `Category` |
| **operatorHeader** | `String, Component` | `"Operator"` | Allows user the change the header title of `Operator` |
| **valueHeader** | `String, Component` | `"Value"` | Allows user the change the header title of `Value` |
| **isAllowOperator** | `Boolean` | `false` | Allows user to `enable/disable` operators in search |
| **loadingRender** | `function, Component` | `"Loading...."` | Show custom loader when values are retrieved using Ajax |
| **fuzzySearchEmptyMessage** | `String` | `"No result found"` | This message is shown when dropdown doesn't have search value |
| **updateOptions** | `function` || Allows user to update the Options(props) at runtime, this function is called before `onTokenRemove` and `onTokenAdd` |
| **renderTokens** | `function` || Allows user to render custome Token Component |
| **renderTokenItem** | `function` || Allows user to render custome Token Item |
| **renderSearchItem** | `function` || Allows user to render custome value |


### props.options (Data attributes)

| Parameter | Type | Default | Required | Description|
|:---------|:---- |:---- |:--------|:----------- | 
| **category** | `String` ||`required` | Name of the first thing the user types.|
| **type** | `String` |`text`||This can be one of the following:<ul><li><b>text</b>: Arbitrary text for the value. No autocomplete options.<ul><li>Operator choices will be: "==", "!=", "contains", "!contains".</li></ul> </li><li><b>textoptions</b>: You must additionally pass an <tt>options</tt> value</tt>. <ul><li>Operator choices will be: "==", "!=".</li></ul></li><li><b>number</b>: Arbitrary text for the value. No autocomplete options.<ul><li>Operator choices will be: "==", "!=", "&lt;", "&lt;=", "&gt;", "&gt;=".</li></ul> </li><li><b>date</b>: Shows a calendar and the input must be of the form "YYYY-MM-DD".<ul><li>Operator choices will be: "==", "!=", "&lt;", "&lt;=", "&gt;", "&gt;=".</li></ul></li></ul>|
| **operator** | `Array, function` | | required, if  `isAllowOperator` prop is set to `true`| If this attribute is added then it would ignore the type check as described in `type` parameter and it would accept what you have passed|
| **options** | `Array, function, Promise` | |`required, if type="textoptions"` | Get the value according to selected category |
| **isAllowCustomValue** | `Boolean` |`false`|| <div> When this parameter is set to `true`, it allows you to send multiple custom values for `type=textoptions`</div> |
| **isAllowDuplicateCategories** | `Boolean` | `true` || Switch between `unique/duplicate` categories (key) |
| **isAllowDuplicateOptions** | `Boolean` | `false` ||Switch between `unique/duplicate` values |
| **fuzzySearchKeyAttribute** | `String` |`name`|| If Category (options)values are `Array<Object>` then By default fuzzy search look for `name` attribute inside options(values) but you can change that attribut lookup key using `fuzzySearchKeyAttribute`|


---

For more details: [react-typeahead](https://github.com/fmoo/react-typeahead)

### Tokenizer (props)

| Parameter | Type | Default | Description |
| :---------|:---- |:--------|:----------- | 
|options| `Array` | [] | An array supplied to the filter function.
|maxVisible| `Number`||Limit the number of options rendered in the results list.|
|resultsTruncatedMessage| `String`||If `maxVisible` is set, display this custom message at the bottom of the list of results when the result are truncated.|
|name| `String`||The name for HTML forms to be used for submitting the tokens' values array.|
|customClasses| `Object`||Allowed Keys: <ul><li>`input`</li><li>`results`</li><li>`listItem`</li><li>`listAnchor`</li><li>`hover`</li><li>`typeahead`</li><li>`resultsTruncated`</li><li>`token`</li></ul><div>An object containing custom class names for child elements. Useful for integrating with 3rd party UI kits.</div>|
|placeholder| `String` ||Placeholder text for the typeahead input.|
|disabled| `Boolean`||Set to `true` to add disable attribute in the `<input>` or `<textarea>` element.|
|inputProps| `Object`||Props to pass directly to the `<input>` element.|
|onKeyDown| `Function`||Event handler for the `keyDown` event on the typeahead input.|
|onKeyPress| `Function`||Event handler for the `keyPress` event on the typeahead input.|
|onKeyUp| `Function`||Event handler for the `keyUp` event on the typeahead input.|
|onBlur| `Function`||Event handler for the `blur` event on the typeahead input.|
|onFocus| `Function`||Event handler for the `focus` event on the typeahead input.|
|defaultSelected| `Array`||A set of values of tokens to be loaded on first render.|
|onTokenRemove| `Function`||`Event handler triggered whenever a token is removed.|
|onTokenAdd|`Function`||Event handler triggered whenever a token is added.<div>Params: `(addedToken)`</div>|
|displayOption| `String`, `Function` || <ul><li>A function to map an option onto a string for display in the list. Receives `(option, index)` where index is relative to the results list, not all the options. Can either return a string or a React component.</li><li>If provided as a string, it will interpret it as a field name and use that field from each option object.</li></ul>|
|filterOption| `String`, `Function`||<ul><li>A function to filter the provided `options` based on the current input value. For each option, receives `(inputValue, option)`. If not supplied, defaults to [fuzzy string matching](https://github.com/mattyork/fuzzy).</li><li>If provided as a string, it will interpret it as a field name and use that field from each option object.</li></ul>|
|searchOptions | `Function`|| A function to filter, map, and/or sort the provided `options` based on the current input value. <div>Receives `(inputValue, options)`.</div> If not supplied, defaults to [fuzzy string matching](https://github.com/mattyork/fuzzy). <div>Note: the function can be used to store other information besides the string in the internal state of the component.</div><div> Make sure to use the `displayOption`, `inputDisplayOption`, and `formInputOption` props to extract/generate the correct format of data that each expects if you do this.</div>|
|inputDisplayOption | `String`, `Function`|| A function that maps the internal state of the visible options into the value stored in the text value field of the visible input when an option is selected. <div>Receives `(option)`.<div> <div>If provided as a string, it will interpret it as a field name and use that field from each option object.</div><div>If no value is set, the input will be set using `displayOption` when an option is selected.</div>|
|formInputOption | `String` or `Function`|| A function to map an option onto a string to include in HTML forms as a hidden field (see `props.name`). Receives `(option)` as arguments. Must return a string.<div>If specified as a string, it will interpret it as a field name and use that field from each option object.</div><div>If not specified, it will fall back onto the semantics described in `props.displayOption`.</div>|
| defaultClassNames | `boolean` | true | If false, the default classNames are removed from the tokenizer and the typeahead.
| showOptionsWhenEmpty | `boolean` | false | If true, options will still be rendered when there is no value.|

---

### Typeahead (props)

| Parameter | Type | Default | Description |
| :---------|:---- |:--------|:----------- | 
| options | `Array` | [] | An array supplied to the filtering function. Can be a list of strings or a list of arbitrary objects. In the latter case, `filterOption` and `displayOption` should be provided.|
|defaultValue|`String`||A default value used when the component has no value. If it matches any options a option list will show.|
|props.value|`String`||Specify a value for the text input.
|maxVisible|| `Number`||Limit the number of options rendered in the results list.
|resultsTruncatedMessage|| `String`||If `maxVisible` is set, display this custom message at the bottom of the list of results when the result are truncated.
|customClasses|| `Object`|| Allowed Keys: <ul><li>`input`</li><li>`results`</li><li>`listItem`</li><li>`listAnchor`</li><li>`hover`</li><li>`typeahead`</li><li>`resultsTruncated`</li></ul><div>An object containing custom class names for child elements. Useful for integrating with 3rd party UI kits.</div>|
|placeholder| `String`||Placeholder text for the typeahead input.|
|disabled| `Boolean`||Set to `true` to add disable attribute in the `<input>` or `<textarea>` element|
|textarea|`Boolean`||Set to `true` to use a `<textarea>` element rather than an `<input>` element|
|inputProps|| `Object`||Props to pass directly to the `<input>` element.|
|onKeyDown| `Function`||Event handler for the `keyDown` event on the typeahead input.|
|onKeyPress| `Function`||Event handler for the `keyPress` event on the typeahead input.|
|onKeyUp| `Function`||Event handler for the `keyUp` event on the typeahead input.|
|onBlur| `Function`||Event handler for the `blur` event on the typeahead input.|
|onFocus| `Function`||Event handler for the `focus` event on the typeahead input.|
|onOptionSelected|`Function`||Event handler triggered whenever a user picks an option.|
|filterOption| `String`, `Function`||A function to filter the provided `options` based on the current input value. For each option, receives `(inputValue, option)`. If not supplied, defaults to [fuzzy string matching](https://github.com/mattyork/fuzzy). If provided as a string, it will interpret it as a field name and fuzzy filter on that field of each option object.|
|displayOption| `String`, `Function`||<ul><li>A function to map an option onto a string for display in the list. Receives `(option, index)` where index is relative to the results list, not all the options. Must return a string.</li><li>If provided as a string, it will interpret it as a field name and use that field from each option object.</li></ul>|
|formInputOption | `String`, `Function` || A function to map an option onto a string to include in HTML forms (see `props.name`). Receives `(option)` as arguments. Must return a string.<ul><li>If specified as a string, it will interpret it as a field name and use that field from each option object.</li><li>If not specified, it will fall back onto the semantics described in `props.displayOption`.</li></ul><div>This option is ignored if you don't specify the `name` prop. It is required if you both specify the `name` prop and are using non-string options. It is optional otherwise.</div>|
|defaultClassNames| `boolean`| true | If false, the default classNames are removed from the typeahead.|
|customListComponent | `React Component`|| A React Component that renders the list of typeahead results. This replaces the default list of results. <div>This component receives the following props :</div><h3>Passed through</h3><ul><li>`props.displayOptions`</li><li>`props.customClasses`</li><li>`props.onOptionSelected`</li></ul><h3>Created or modified</h3><ul><li>`props.options`- This is the Typeahead's `props.options` filtered and limited to `Typeahead.props.maxVisible`.</li><li>`props.selectionIndex`- The index of the highlighted option for rendering</li></ul>|
|showOptionsWhenEmpty| `boolean`| false | If true, options will still be rendered when there is no value.|
|allowCustomValues| `boolean` ||If true, custom tags can be added without a matching typeahead selection |



## How to Contribute

### Setting Up

 Please run `npm install` in the root and example folders. then do the following:

* Go to root folder and run `npm start` after this 
* Go to example folder and run `npm run link` (only for first time)
* Go to example folder and run `npm start` it would run the plugin from link which we have created.

Now, anytime you make a change to your library in src/ or to the example app's example/src `create-react-app` will live-reload your local dev server so you can iterate on your component in real-time.

## License

MIT © [kevalbhatt](https://github.com/kevalbhatt)
