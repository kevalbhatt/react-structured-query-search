import React, { Component } from "react";

import ReactStructuredQuerySearch from "react-structured-query-search";
import "react-structured-query-search/dist/index.css";

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			SymbolData: []
		};
		// NOTE: The operator will seen to UI only if props isAllowOperator={true}
		this.options = [
			{
				conditional:null,
				category: "Symbol",
				type: "textoptions",
				operator: ["==", "!="],
				options: this.getSymbolOptions
			},
			{
				conditional:null,
				category: "Name",
				type: "text",
				isAllowDuplicateCategories: false,
				operator: null
			},
			{ conditional:null, category: "Price", type: "number" },
			{ conditional:null, category: "MarketCap", type: "number" },
			{ conditional:null, category: "IPO", type: "date" },
			{
				conditional:null,
				category: "Sector",
				type: "textoptions",
				fuzzySearchKeyAttribute: "sectorName",
				isAllowCustomValue: false,
				isAllowDuplicateOptions: false,
				operator: null,
				options: this.getSectorOptions
			},
			{
				conditional:null,
				category: "Industry",
				type: "textoptions",
				isAllowCustomValue: false,
				options: this.getIndustryOptions
			},
			{
				conditional: null,
				category: "Query",
				type: "custom",
				isAllowCustomValue: true,
				options: null,
				operator: null,
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
		return [{ sectorName: "Finance", id: 1 }, { sectorName: "Consumer Services", id: 2 }, { sectorName: "Services", id: 3 }];
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
		return <div>{`testing`}</div>;
	}

	render() {
		return (
			<div className="container">
				<ReactStructuredQuerySearch
					isAllowOperator={true}
					defaultSelected={[
						{ conditional: null, category: "Sector", value: { sectorName: "Finance", id: 1 } },
						{ conditional: null, category: "Sector", value: { sectorName: "Consumer Services", id: 2 } },
						{ conditional: null, category: "Industry", value: { name: "Other Specialty Stores", id: 2 } },
						// { conditional: null, category: "Query", value: "AND ( Demo == PIL )"}
					]}
					options={this.options}
					// renderTokenItem={this.getTokenItem}
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
