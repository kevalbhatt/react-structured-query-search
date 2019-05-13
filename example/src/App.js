import React, { Component } from "react";

import ReactStructuredQuerySearch from "react-structured-query-search";

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			SymbolData: []
		};
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
				operator: () => ["==", "!==", "containes"]
			},
			{ category: "Price", type: "number" },
			{ category: "MarketCap", type: "number" },
			{ category: "IPO", type: "date" },
			{
				category: "Sector",
				type: "textoptions",
				fuzzySearchKeyAttribute: "sectorName",
				options: this.getSectorOptions
			},
			{
				category: "Industry",
				type: "textoptions",
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
		return [
			{ sectorName: "Finance", id: 1 },
			{ sectorName: "Consumer Services", id: 2 }
		];
	}

	/**
	 * [getIndustryOptions Get the values for Industry category]
	 * @return {[array]}
	 */
	getIndustryOptions() {
		return [
			{ name: "Business Services", id: 1 },
			{ name: "Other Specialty Stores", id: 2 }
		];
	}

	render() {
		return (
			<div className="container">
				<ReactStructuredQuerySearch
					options={this.options}
					updateOptions={({ updatedValues, addedValue }) => {
						if (
							addedValue &&
							addedValue.category === "Symbol" &&
							addedValue.value === "TFSC"
						) {
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