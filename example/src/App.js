import React, { Component } from "react";

import ReactStructuredQuerySearch from "react-structured-query-search";

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			SymbolData: []
		};
	}

	getSymbolOptions = () => {
		if (this.state.SymbolData.length === 0) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					this.setState({ SymbolData: ["abc","def","xyz"] }, () => {
						return resolve(this.state.SymbolData);
					});
				}, 2000);
			});
		} else {
			return this.state.SymbolData;
		}
	}

	getSectorOptions() {
		return ["tt", "xx", "ccc"];
	}

	getIndustryOptions() {
		return ["NN"];
	}

	render() {
		return (
			<div className="container">
				<ReactStructuredQuerySearch
					isAllowOperator={false}
					allowDuplicateCategories={true}
					allowDuplicateOptions={false}
					options={[
						{
							category: "Symbol",
							type: "textoptions",
							operator: ["x", "y", "z"],
							options: this.getSymbolOptions
						},
						{
							category: "Name",
							type: "text",
							operator: () => ["xxxx", "y", "z"]
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