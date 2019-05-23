import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Tokenizer } from "./lib/react-structured-filter/react-typeahead/react-typeahead";
import Typeahead from "./OTypeahead";

// Override the Tokenizer
export default class OTokenizer extends Tokenizer {
	getDefaultSelectedValue() {
		let defaultValue = [];
		if (typeof this.props.defaultSelected === "function") {
			defaultValue = this.props.defaultSelected() || [];
		} else {
			defaultValue = this.props.defaultSelected;
		}
		let selectedValueSet = {};
		defaultValue.forEach(val => {
			if (selectedValueSet[val.category]) {
				selectedValueSet[val.category].push(val);
			} else {
				selectedValueSet[val.category] = [val];
			}
		});
		this.props.options.forEach(val => {
			if (selectedValueSet[val.category]) {
				// escape category if options is not avilable.
				this._getOptions({ options: val.options, category: val.category });
			}
		});
		return defaultValue;
	}

	componentDidMount() {
		document.addEventListener("click", this.handleClickOutside);
	}

	componentWillUnmount() {
		if (document && document.removeEventListener) {
			document.removeEventListener("click", this.handleClickOutside);
		}
	}

	handleClickOutside = e => {
		if (this) {
			let node = ReactDOM.findDOMNode(this);
			if (
				(node && node.contains(e.target)) ||
				((e.target && e.target.className == "typeahead-option") || e.target.className == "typeahead-token-close")
			) {
				return;
			}
			if (this.state.focused === true && !this.typeaheadRef.isOptionsLoading()) {
				this.setState({ focused: false });
			}
		}
	};

	onElementFocused = val => {
		this.setState(val);
	};

	_getCategoryOperator() {
		for (var i = 0; i < this.state.options.length; i++) {
			if (this.state.options[i].category == this.state.category) {
				return this.state.options[i].operator;
			}
		}
	}

	_getOptionsForTypeahead() {
		if (this.state.category == "") {
			var categories = [];
			for (var i = 0; i < this.state.options.length; i++) {
				let options = this.state.options[i],
					category = options.category,
					isAllowCustomValue = options.isAllowCustomValue == undefined ? false : options.isAllowCustomValue,
					isAllowDuplicateCategories = options.isAllowDuplicateCategories == undefined ? true : options.isAllowDuplicateCategories;

				if (isAllowCustomValue == false && this.skipCategorySet && this.skipCategorySet.has(category)) {
					continue;
				}
				if (isAllowDuplicateCategories == false) {
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
			return this._getOptions({ options: this._getCategoryOptions() });
		}
		return this.state.options;
	}

	_getOptions({ options, category = this.state.category }) {
		if (options == null) {
			return [];
		} else {
			if (typeof options === "function") {
				let opt = options();
				if (typeof opt == "object") {
					if (opt instanceof Promise) {
						return opt;
					} else {
						return this.filterOptionsValue({ options: opt, category: category });
					}
				}
			} else {
				return this.filterOptionsValue({ options: options, category: category });
			}
		}
	}

	filterOptionsValue({ options, category, selected = this.state.selected }) {
		if (this._getAllowDuplicateOptions({ constategory: category }) == false) {
			if (selected.length && category != "") {
				let optionsList = [];
				if (options && options.length) {
					var listToFindOptionOnIt = [];
					if (this._getAllowDuplicateCategories({ category: category })) {
						listToFindOptionOnIt = selected.filter(o => {
							return o.category == category;
						});
					} else {
						listToFindOptionOnIt = selected.find(o => {
							return o.category == category;
						});
					}
					let fuzzySearchKeyAttribute = this._getFuzzySearchKeyAttribute({
						category: category
					});
					options.forEach(val => {
						let foundOption = listToFindOptionOnIt.find(o => {
							if (typeof val === "object") {
								return o.value[fuzzySearchKeyAttribute] == val[fuzzySearchKeyAttribute];
							} else {
								return o.value == val;
							}
						});
						if (!foundOption) {
							optionsList.push(val);
						}
					});
					if ((options.length > optionsList.length && optionsList.length == 1) || (options.length == 1 && optionsList.length == 1)) {
						this.skipCategorySet.add(category);
					}
					return optionsList;
				} else {
					return [];
				}
			} else {
				if (options.length === 1 && category) {
					this.skipCategorySet.add(category);
				}
				return options || [];
			}
		} else {
			return options || [];
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
		return this.state.options;
	}

	_getAllowDuplicateCategories({ category, options = this.state.options }) {
		if (category) {
			for (var i = 0; i < options.length; i++) {
				if (options[i].category == category) {
					return options[i].isAllowDuplicateCategories || true;
				}
			}
		} else {
			return false;
		}
	}

	_getAllowDuplicateOptions({ category, options = this.state.options }) {
		if (category) {
			for (var i = 0; i < options.length; i++) {
				if (options[i].category == category) {
					return options[i].isAllowDuplicateOptions || false;
				}
			}
		} else {
			return false;
		}
	}

	_getAllowCustomValue({ category, options = this.state.options }) {
		if (category) {
			for (var i = 0; i < options.length; i++) {
				if (options[i].category == category) {
					return options[i].isAllowCustomValue || false;
				}
			}
		} else {
			return false;
		}
	}

	_getFuzzySearchKeyAttribute({ category, options = this.state.options }) {
		for (var i = 0; i < options.length; i++) {
			if (options[i].category == category) {
				return options[i].fuzzySearchKeyAttribute || "name";
			}
		}
	}

	_focusInput() {
		if (this.typeaheadRef) {
			var entry = this.typeaheadRef.getInputRef();
			if (entry) {
				entry.focus();
			}
		}
	}

	onClickOfDivFocusInput = e => {
		e.stopPropagation();
		this._focusInput();
	};

	_removeTokenForValue = value => {
		var index = this.state.selected.indexOf(value);
		if (index == -1) {
			return;
		}

		let removedObj = this.state.selected.splice(index, 1)[0];
		if (this.skipCategorySet && this.skipCategorySet.has(removedObj.category)) {
			this.skipCategorySet.delete(removedObj.category);
		}
		let stateObj = { selected: this.state.selected };
		if (this.props.updateOptions) {
			let newOptions = this.props.updateOptions({
				updatedValues: this.state.selected,
				removedValue: removedObj,
				addedValue: null
			});
			if (newOptions && newOptions.length) {
				Object.assign(stateObj, { options: newOptions });
			}
		}
		this.setState(stateObj, () => {
			this.props.onTokenRemove(this.state.selected);
		});

		return;
	};

	_addTokenForValue = value => {
		const { isAllowOperator } = this.props;
		if (this.state.category == "") {
			this.state.category = value;
			this.setState({ category: value });
			this.typeaheadRef.setEntryText("");
			return;
		}

		if (isAllowOperator && this.state.operator == "") {
			this.state.operator = value;
			this.setState({ operator: value });
			this.typeaheadRef.setEntryText("");
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

		this.typeaheadRef.setEntryText("");
		if (this.props.updateOptions) {
			let newOptions = this.props.updateOptions({
				updatedValues: this.state.selected,
				addedValue: value,
				removedValue: null
			});
			if (newOptions && newOptions.length) {
				Object.assign(stateObj, { options: newOptions });
			}
		}
		this.setState(stateObj, () => this.props.onTokenAdd(this.state.selected));
		return;
	};

	_onClearAll = () => {
		this.setState({ selected: [], category: "", operator: "" }, () => {
			if (this.props.onClearAll) {
				this.props.onClearAll(this.state.selected);
			}
		});
	};

	_getClearAllButton() {
		return (
			<div className="clear-all">
				<a
					className="typeahead-token-close"
					href="javascript:void(0)"
					onClick={function(event) {
						this._onClearAll();
						event.preventDefault();
					}.bind(this)}
				>
					&#x00d7;
				</a>
			</div>
		);
	}

	_getTypeahed({ classList }) {
		return (
			<Typeahead
				ref={ref => (this.typeaheadRef = ref)}
				isAllowOperator={this.props.isAllowOperator}
				onElementFocused={this.onElementFocused}
				isElemenFocused={this.state.focused}
				fuzzySearchEmptyMessage={this.props.fuzzySearchEmptyMessage}
				fuzzySearchKeyAttribute={this._getFuzzySearchKeyAttribute({
					category: this.state.category
				})}
				isAllowSearchDropDownHeader={this.props.isAllowSearchDropDownHeader}
				renderSearchItem={this.props.renderSearchItem}
				className={classList}
				placeholder={this.props.placeholder}
				customClasses={this.props.customClasses}
				options={this._getOptionsForTypeahead()}
				header={this._getHeader()}
				datatype={this._getInputType()}
				isAllowCustomValue={this._getAllowCustomValue({
					category: this.state.category
				})}
				defaultValue={this.props.defaultValue}
				onOptionSelected={this._addTokenForValue}
				onKeyDown={this._onKeyDown}
				fromTokenizer={true}
			/>
		);
	}
}