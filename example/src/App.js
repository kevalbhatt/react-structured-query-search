import React, { Component } from "react";

import ReactStructuredQuerySearch from "react-structured-query-search";

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			SymbolData: []
		};
		// NOTE: The operator will seen to UI only if props isAllowOperator={true}
		this.options = [
			{
				category: "Symbol",
				type: "textoptions",
				operator: ["==", "!="],
				options: this.getSymbolOptions
			},
			{
				category: "Name",
				type: "text",
				isAllowDuplicateCategories: false,
				operator: () => ["==", "!==", "containes"]
			},
			{ category: "Price", type: "number" },
			{ category: "MarketCap", type: "number" },
			{ category: "IPO", type: "date" },
			{
				category: "Sector",
				type: "textoptions",
				fuzzySearchKeyAttribute: "sectorName",
				isAllowCustomValue: false,
				isAllowDuplicateOptions: false,
				options: this.getSectorOptions
			},
			{
				category: "Industry",
				type: "textoptions",
				isAllowCustomValue: false,
				options: this.getIndustryOptions
			}
		];
	}

	/**
	 * [getSymbolOptions Get the values using Ajax call]
	 * @return {[type]}
	 */
	getSymbolOptions = () => {
		if (this.state.SymbolData.length === 0) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					this.setState({ SymbolData: ["TFSC", "PIL", "VNET"] }, () => {
						return resolve(this.state.SymbolData);
					});
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
		return [{ sectorName: "Finance", id: 1 }];
		//return [{ sectorName: "Finance", id: 1 }, { sectorName: "Consumer Services", id: 2 }];
	}

	/**
	 * [getIndustryOptions Get the values for Industry category]
	 * @return {[array]}
	 */
	getIndustryOptions() {
		return [{ name: "Business Services", id: 1 }, { name: "Other Specialty Stores", id: 2 }];
	}

	getTokenItem(obj) {
		let val = obj.children;
		return `${val["category"]}: val`;
	}

	render() {
		return (
			<div className="container">
				<ReactStructuredQuerySearch
					defaultSelected={[
						{ category: "Sector", value: { sectorName: "Finance", id: 1 } },
						{ category: "Industry", value: { name: "Other Specialty Stores", id: 2 } }
					]}
					disabled={true}
					options={this.options}
					//renderTokenItem={this.getTokenItem}
					updateOptions={({ updatedValues, addedValue }) => {
						if (addedValue && addedValue.category === "Symbol" && addedValue.value === "TFSC") {
							this.options.push({
								category: "New Category",
								type: "text"
							});
							return this.options;
						}
					}}
					onTokenAdd={val => console.log(val)}
					customClasses={{
						input: "filter-tokenizer-text-input",
						results: "filter-tokenizer-list__container",
						listItem: "filter-tokenizer-list__item"
					}}
				/>
			</div>
		);
	}
}