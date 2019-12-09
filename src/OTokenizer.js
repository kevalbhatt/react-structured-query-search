import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Tokenizer } from "./lib/react-structured-filter/react-typeahead/react-typeahead";
import Typeahead from "./OTypeahead";
import classNames from "classnames";

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
				this._getOptions({ options: val.options, category: val.category, selected: selectedValueSet[val.category], fromDefaultValue: true });
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
			if (this.state.focused === true && this.typeaheadRef && !this.typeaheadRef.isOptionsLoading()) {
				this.setState({ focused: false });
			}
		}
	};

	onElementFocused = val => {
		this.setState(val);
	};

	_getInputType() {
                var that = this;
		if (this.state.category === "Query") {
                        var opt = this.state.options.find(function(f) { return f.category === that.state.category;});
                        this.queryOptions = opt.queryOptions;
			return "custom";
		} else if (this.state.category != "" && (this.props.isAllowOperator && this._getCategoryOperator() !== null ? this.state.operator != "" : true)) {
			return this._getCategoryType();
		} else {
			return "text";
		}
	}

	_getCategoryOperator() {
		for (var i = 0; i < this.state.options.length; i++) {
			if (this.state.options[i].category == this.state.category) {
				return this.state.options[i].operator;
			}
		}
	}

	_checkConditionalOptions () {
		return this.state.options.filter(function(o) {
			return o.conditional !== null && o.conditional !== undefined && o.conditional !== "";
		}).length > 0 ? true : false;
	}

	_checkSpeacialChar (val) {
		var  match = new RegExp(/[^a-zA-Z]/g);
		return match.test(val);
	}

	_showCloseBracketOptions (val) {
		let showCloseBracket =  this.state.selected.length > 0 ? true :  !this._checkSpeacialChar(val);
		if (this.state.selected.length > 0 && (val.includes(',') || val.includes(' )'))) {
			showCloseBracket = this._bracketHasClosed() && !this.state.ediTableTokenId ? false : true;
		}
		return showCloseBracket;
	}

	_bracketHasClosed = () => {
		if (this.state.selected.length === 0) {
			return false;
		}
		const obj = { open: 0, close: 0 };
			this.state.selected.map((s) => {
				if (s.conditional.includes('(')) {
					obj.open =  ++obj.open
				} else if (s.conditional.includes(')')) {
					obj.close =  ++obj.close
				}
			});
		return obj.open === obj.close;
	}

	_getOptionsForTypeahead() {
		const closeBracket = this.state.conditional && this.state.conditional.includes(')') ? true : false;
		if (this.state.conditional == "" && this._checkConditionalOptions()) {
			var conditional = [];
			for (var i = 0; i < this.state.options.length; i++) {
				var options = this.state.options[i],
					condition = options.conditional;
					if (condition && this._showCloseBracketOptions(condition)) {
						conditional.push(condition);
					}
			}
			return conditional;
		} else if (this.state.category == "" && !closeBracket ) {
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
					if (!foundCategory && category.trim() !== "") {
						categories.push(category);
					}
				} else {
					if (category.trim() !== "") {
						categories.push(category);
					}
				}
			}
			return categories;
		} else if (this.props.isAllowOperator && this._getCategoryOperator() !== null && this.state.operator == ""  && !this.state.conditional.includes(')')) {
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

	_getOptions(optionsObj) {
		const { options } = optionsObj;
		if (options == null) {
			return [];
		} else {
			if (typeof options === "function") {
				let opt = options();
				if (typeof opt == "object" && !this.state.conditional.includes(')')) {
					if (opt instanceof Promise) {
						return opt;
					} else {
						return this.filterOptionsValue(Object.assign(optionsObj, { options: opt }));
					}
				}
			} else {
				return this.filterOptionsValue(optionsObj);
			}
		}
	}

	filterOptionsValue({ options, category = this.state.category, selected = this.state.selected, fromDefaultValue }) {
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
					if (
						(fromDefaultValue && optionsList.length === 0) ||
						(!fromDefaultValue &&
							((options.length > optionsList.length && optionsList.length == 1) || (options.length == 1 && optionsList.length == 1)))
					) {
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
		if (this.state.conditional == "" && this._checkConditionalOptions()) {
			return this.props.conditionalHeader || "Conditional";
		} else if (this.state.category == "") {
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
			if (entry && entry.focus) {
				entry.focus();
			}
		}
	}

	onClickOfDivFocusInput = e => {
		e.stopPropagation();
		this._focusInput();
	};

	_removeTokenForValue = value => {
		if (this.props.disabled) {
			return;
		}
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
		if (this.props.disabled) {
			return;
		}
		let { isAllowOperator } = this.props;
		const closeBracket = this.state.conditional && this.state.conditional.includes(')') ? true : false;
		if (this.state.conditional == "" && this._checkConditionalOptions()) {
			var val = this._checkSpeacialChar(value) ? value : value + " ( " ;
			this.state.conditional = val;
			this.setState({ conditional: val});
			this.typeaheadRef.setEntryText("");
			if (this.props.customQuery && val === " )") {
				this._addToken({value: val, isAllowOperator: false, closeToken: true});
			}
			return;
		}

		if (this.state.category == "" && !closeBracket) {
			this.state.category = value;
			this.setState({ category: value });
			this.typeaheadRef.setEntryText("");
			return;
		}
		if (this.state.category !== "" && isAllowOperator) {
			isAllowOperator = this._getCategoryOperator() !== null;
		}
		if (isAllowOperator && this.state.operator == "" && !closeBracket) {
			this.state.operator = value;
			this.setState({ operator: value });
			this.typeaheadRef.setEntryText("");
			return;
		}
		this._addToken({value, isAllowOperator});
	};

	_addToken = ({value, isAllowOperator, closeToken}) => {

		value = {
			conditional: this.state.conditional,
			category: this.state.category,
			value: value
		};

		if (closeToken) {
			value.value = "";
			value.operator = "";
		}

		if (this.state.ediTableTokenId !== null) {
			this.state.selected[this.state.ediTableTokenId] = value;
			this.state.ediTableTokenId = null;
		} else {
			this.state.selected.push(value);
		}

		let stateObj = {
			selected: this.state.selected,
			conditional: "",
			category: "",
			ediTableTokenId: this.state.ediTableTokenId
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
		this.setState(stateObj, () => {
			this.props.onTokenAdd(this.state.selected);
			this._focusInput();
		});
		return;
	}

	_onClearAll = () => {
		if (this.props.disabled) {
			return;
		}
		this.skipCategorySet.clear();
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

	_emptyParentCategoryState = () => {
		this.setState({"category": ""}, () => {
			this._focusInput();
		});
	}

	getTypeHeadHtmlContainer = (component, uniqKey) => {
		return (
			<div className="filter-input-group" key={uniqKey || new Date().getMilliseconds()}>
				<div className="filter-conditional">{this.state.conditional}</div>
				<div className="filter-category">{this.state.category}</div>
				<div className="filter-operator">{this.state.operator}</div>
				{ component }
          	</div>
		);
	}

	_getTypeahed({mykey, show}) {
		var classes = {};
		classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
		var classList = classNames(classes);
		var typeHeadComp = 	<Typeahead
						ref={ref => this.typeaheadRef = ref}
						disabled={this.props.disabled}
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
						emptyParentCategoryState={this._emptyParentCategoryState}
						customQuery={this.props.customQuery}
						bracketHasClosed={this._bracketHasClosed}
						updateParentInputText={this.props.updateParentInputText}
						ediTableTokenId={this.state.ediTableTokenId}
                                                queryOptions={this.queryOptions}
					/>;
		return 	show ? this.getTypeHeadHtmlContainer(typeHeadComp, mykey) : typeHeadComp;
	}
}
