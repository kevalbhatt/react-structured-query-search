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
                                category: "Type",
                                type: "textoptions",
                                operator: ["==", "!="],
				isAllowDuplicateCategories: false,
                                options: this.getSymbolOptions
                        },
                        {
                                category: "Classification",
                                type: "textoptions",
                                operator: ["==", "!="],
                                isAllowDuplicateCategories: false,
				fuzzySearchKeyAttribute: "sectorName",
                                options: this.getSectorOptions
                        },
                        {
                                category: "Terms",
                                type: "textoptions",
                                operator: null,
                                isAllowDuplicateCategories: true,
                                options: this.getIndustryOptions
                        },
                        {
                                category: "Label",
                                type: "text",
                                isAllowDuplicateCategories: false,
                                operator: null
                        },
                        {
                                category: "Query",
                                isAllowDuplicateCategories: false,
                                type: "query",
                                isAllowCustomValue: true,
                                options: null,
                                operator: null,
                                queryOptions: [
                                        {
                                                category: "Demo",
                                                type: "textoptions",
                                                operator: ["==", "!="],
                                                options: ["demo_1", "demo_2"]
                                        },
                                        {
                                                category: "Sample",
                                                type: "textoptions",
                                                operator: ["==", "!="],
                                                options: ["Sample_1", "Sample_2"]
                                        },
                                        {
                                                category: "Test",
                                                type: "textoptions",
                                                operator: ["==", "!="],
                                                options: ["Test_1", "Test_2"]
                                        },
                                        {
                                                category: "Jason",
                                                type: "text",
                                                operator: ["==", "!="],
                                                options: null
                                        }
                                ]
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
                return [{ name: "Business Services", id: 1 }, { name: "Other Specialty Stores", id: 2 }, { name: "demo test", id: 3 }];
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
                    defaultSelected={[]}
					options={this.options}
					placeholder="Add filters..."
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
