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
								fuzzySearchKeyAttribute: "displayName",
                                queryOptions: [
										{
											category: {
												name: "QualifiedName",
												displayName: "QualifiedName (string)",
												group: 'In house'
											},
											fuzzySearchKeyAttribute: "displayName",
											type: "text",
											operator: ["==", "!=", "contains", "begins with", "ends with", "is null", "is not null"],
											options: null
										},
										{
											category: {
												name: "Description",
												displayName: "Description (string)",
												group: 'In house',
											},
											fuzzySearchKeyAttribute: "displayName",
											type: "text",
											operator: ["==", "!=", "contains", "begins with", "ends with", "is null", "is not null"],
											options: null
										},
										{
											category: {
												name: "Name",
												displayName: "Name (string)",
												group: 'out source'
											},
											fuzzySearchKeyAttribute: "displayName",
											type: "text",
											operator: ["==", "!=", "contains", "begins with", "ends with", "is null", "is not null"],
											options: null
										},
										{
											category: {
												name: "Owner",
												displayName: "Owner (string)",
												group: 'out source'
											},
											fuzzySearchKeyAttribute: "displayName",
											type: "textoptions",
											operator: ["==", "!=", "contains", "begins with", "ends with", "is null", "is not null"],
											options: [{
												name: 'user1',
												displayName: "User 1",
												group: 'In house'
											},
											{
												name: 'user2',
												displayName: "User 2",
												group: 'out source'
											},
											{
												name: 'user3',
												displayName: "User 3",
												group: 'In house'
											}]
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
