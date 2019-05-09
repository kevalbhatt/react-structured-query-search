# react-structured-query-search 🎉

[![NPM](https://img.shields.io/npm/v/react-structured-query-search.svg)](https://www.npmjs.com/package/react-structured-query-search) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

react-structured-query-search is a javascript library that provides autocomplete search queries.  
This was inspired by [visualsearch](http://documentcloud.github.io/visualsearch) and
[react-structured-filter](https://github.com/SummitRoute/react-structured-filter)

>This plugin is written on top of [react-structured-filter](https://github.com/SummitRoute/react-structured-filter), which has been revamped to add React 16 support and the existing code has been overriden to support New features.

You can use all the [react-typeahead](https://github.com/fmoo/react-typeahead), [react-structured-filter](https://github.com/SummitRoute/react-structured-filter)  API(options) as they are.

## 🎉🎊 New Features 🎊🎉

* Ajax support to retrieve values.
* Allows user to pass custom loader component.
* Allows user to customize the header of dropdown (categories, operators, values).
* Allows user to enable/disable operators in search.
* Allows user to perform category-value search without operator (if isAllowOperator is false).
* Switch between unique/duplicate categories (key).
* Switch between unique/duplicate values
* Allows user to send custom operators list.



## Install

```bash
npm install --save react-structured-query-search
```

## Usage ([Example Code](https://github.com/kevalbhatt/react-structured-query-search/blob/master/example/src/App.js))

```jsx
import React, { Component } from "react";

import ReactStructuredQuerySearch from "react-structured-query-search";

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			SymbolData: []
		};
	}

	/**
	 * [getSymbolOptions Get the values using Ajax call]
	 * @return {[type]}
	 */
	getSymbolOptions = () => {
		if (this.state.SymbolData.length === 0) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					this.setState(
						{ SymbolData: ["TFSC", "PIL", "VNET"] },
						() => {
							return resolve(this.state.SymbolData);
						}
					);
				}, 2000);
			});
		} else {
			return this.state.SymbolData;
		}
	};

	/**
	 * [getSectorOptions Get the values for sector category]
	 * @return {[array]}
	 */
	getSectorOptions() {
		return ["Finance", "Consumer Services"];
	}

	/**
	 * [getIndustryOptions Get the values for Industry category]
	 * @return {[array]}
	 */
	getIndustryOptions() {
		return ["Business Services", "Other Specialty Stores"];
	}
    
        render() {
            return (<div className="container">
		    <ReactStructuredQuerySearch
			isAllowOperator={true}
			options={[
				{
					category: "Symbol",
					type: "textoptions",
					operator: ["==", "!="],
					options: this.getSymbolOptions
				},
				{
					category: "Name",
					type: "text",
					operator: () => [
						"==",
						"!==",
						"containes"
					]
				},
				{ category: "Price", type: "number" },
				{ category: "MarketCap", type: "number" },
				{ category: "IPO", type: "date" },
				{
					category: "Sector",
					type: "textoptions",
					options: this.getSectorOptions
				},
				{
					category: "Industry",
					type: "textoptions",
					options: this.getIndustryOptions
				}
			]}
			customClasses={{
				input: "filter-tokenizer-text-input",
				results: "filter-tokenizer-list__container",
				listItem: "filter-tokenizer-list__item"
			}}
		/>
	    </div>);
    }
}
```

## Options (API/props)
---------------------

| Parameter | Type | Default | Description |
| :---------|:---- |:--------|:----------- | 
| **categoryHeader** | `String/Component` | `"Category"` | Allows user the change the header title of `Category` |
| **operatorHeader** | `String/Component` | `"Operator"` | Allows user the change the header title of `Operator` |
| **valueHeader** | `String/Component` | `"Value"` | Allows user the change the header title of `Value` |
| **isAllowOperator** | `Boolean` | `false` | Allows user to `enable/disable` operators in search |
| **allowDuplicateCategories** | `Boolean` | `true` | Switch between `unique/duplicate` categories (key) |
| **allowDuplicateOptions** | `Boolean` | `false` | Switch between `unique/duplicate` values |
| **loadingRender** | `funcation` | `"Loading...."` | Show custom loader when values are retrieved using Ajax |



## Developing


## License

MIT © [kevalbhatt](https://github.com/kevalbhatt)
