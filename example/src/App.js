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
		return (
			<div className="container">
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
							operator: () => ["==", "!==", "containes"]
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
			</div>
		);
	}
}