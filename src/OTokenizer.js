import React, { Component } from "react";
import PropTypes from "prop-types";
import { Tokenizer } from "./lib/react-structured-filter/react-typeahead/react-typeahead";
import Typeahead from "./OTypeahead";

// Override the Tokenizer
export default class OTokenizer extends Tokenizer {
	handleClickOutside() {
		document.addEventListener(
			"click",
			e => {
				if (this.node.contains(e.target)) {
					return;
				}
				this.setState({ focused: false });
			},
			false
		);
	}

	onElementFocused = val => {
		this.setState(val);
	};

	_getCategoryOperator() {
		for (var i = 0; i < this.props.options.length; i++) {
			if (this.props.options[i].category == this.state.category) {
				return this.props.options[i].operator;
			}
		}
	}

	_getOptionsForTypeahead() {
		if (this.state.category == "") {
			var categories = [];
			for (var i = 0; i < this.props.options.length; i++) {
				let category = this.props.options[i].category;
				if (
					this.skipCategorySet &&
					this.skipCategorySet.has(category)
				) {
					continue;
				}
				if (this.props.allowDuplicateCategories == false) {
					let foundCategory = this.state.selected.find(function(obj) {
						return obj.category == category;
					});
					if (!foundCategory) {
						categories.push(category);
					}
				} else {
					categories.push(category);
				}
			}
			return categories;
		} else if (this.props.isAllowOperator && this.state.operator == "") {
			let categoryType = this._getCategoryType();
			let categoryOperator = this._getCategoryOperator();
			if (categoryOperator) {
				if (typeof categoryOperator === "function") {
					return categoryOperator();
				} else {
					return categoryOperator;
				}
			} else {
				if (categoryType == "text") {
					return ["==", "!=", "contains", "!contains"];
				} else if (categoryType == "textoptions") {
					return ["==", "!="];
				} else if (categoryType == "number" || categoryType == "date") {
					return ["==", "!=", "<", "<=", ">", ">="];
				} else {
					console.log("WARNING: Unknown category type in tokenizer");
				}
			}
		} else {
			var options = this._getCategoryOptions();
			if (options == null) {
				return [];
			} else {
				if (typeof options === "function") {
					let opt = options();
					if (typeof opt == "object") {
						if (opt instanceof Promise) {
							return opt;
						} else {
							return this.filterOptionsValue({ options: opt });
						}
					}
				} else {
					return this.filterOptionsValue({ options });
				}
			}
		}
		return this.props.options;
	}

	filterOptionsValue({ options }) {
		if (
			this.props.allowDuplicateOptions == false &&
			this.state.selected.length &&
			this.state.category != ""
		) {
			let optionsList = [];
			if (options && options.length) {
				var listToFindOptionOnIt = [];
				if (this.props.allowDuplicateCategories) {
					listToFindOptionOnIt = this.state.selected.filter(o => {
						return o.category == this.state.category;
					});
				} else {
					listToFindOptionOnIt = this.state.selected.find(o => {
						return o.category == this.state.category;
					});
				}
				options.forEach(val => {
					let foundOption = listToFindOptionOnIt.find(o => {
						return o.value == val;
					});
					if (!foundOption) {
						optionsList.push(val);
					}
				});
				if (
					(options.length > optionsList.length &&
						optionsList.length == 1) ||
					(options.length == 1 && optionsList.length == 1)
				) {
					if (this.skipCategorySet == undefined) {
						this.skipCategorySet = new Set();
					}
					this.skipCategorySet.add(this.state.category);
				}
				return optionsList;
			} else {
				return [];
			}
		} else {
			return options;
		}
	}

	_getHeader() {
		if (this.state.category == "") {
			return this.props.categoryHeader || "Category";
		} else if (this.props.isAllowOperator && this.state.operator == "") {
			return this.props.operatorHeader || "Operator";
		} else {
			return this.props.valueHeader || "Value";
		}
		return this.props.options;
	}

	_removeTokenForValue = value => {
		var index = this.state.selected.indexOf(value);
		if (index == -1) {
			return;
		}

		let removedObj = this.state.selected.splice(index, 1)[0];
		if (
			this.skipCategorySet &&
			this.skipCategorySet.has(removedObj.category)
		) {
			this.skipCategorySet.delete(removedObj.category);
		}
		this.setState({ selected: this.state.selected });
		this.props.onTokenRemove(this.state.selected);

		return;
	};

	_addTokenForValue = value => {
		const { isAllowOperator } = this.props;
		if (this.state.category == "") {
			this.setState({ category: value });
			this.typeaheadRef.current.setEntryText("");
			return;
		}

		if (isAllowOperator && this.state.operator == "") {
			this.setState({ operator: value });
			this.typeaheadRef.current.setEntryText("");
			return;
		}

		value = {
			category: this.state.category,
			value: value
		};

		this.state.selected.push(value);

		let stateObj = {
			selected: this.state.selected,
			category: ""
		};

		if (isAllowOperator) {
			Object.assign(value, { operator: this.state.operator });
			Object.assign(stateObj, { operator: "" });
		}

		this.typeaheadRef.current.setEntryText("");
		this.setState(stateObj, () =>
			this.props.onTokenAdd(this.state.selected)
		);
		return;
	};

	_getTypeahed({ classList }) {
		return (
			<Typeahead
				ref={this.typeaheadRef}
				isAllowOperator={this.props.isAllowOperator}
				onElementFocused={this.onElementFocused}
				isElemenFocused={this.state.focused}
				className={classList}
				placeholder={this.props.placeholder}
				customClasses={this.props.customClasses}
				options={this._getOptionsForTypeahead()}
				header={this._getHeader()}
				datatype={this._getInputType()}
				defaultValue={this.props.defaultValue}
				onOptionSelected={this._addTokenForValue}
				onKeyDown={this._onKeyDown}
			/>
		);
	}
}
