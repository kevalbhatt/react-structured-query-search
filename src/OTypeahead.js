import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typeahead } from "./lib/react-structured-filter/react-typeahead/react-typeahead";
import CustomQueryTokenizer from './CustomQueryTokenizer';

// Override the Tokenizer
export default class OTypeahead extends Typeahead {
	componentWillReceiveProps(nextProps) {
		this.fuzzySearchKeyAttribute = nextProps.fuzzySearchKeyAttribute || this.props.fuzzySearchKeyAttribute;
		if (nextProps.options instanceof Promise) {
			this.setState(
				{
					loadingOptions: true
				},
				() => {
					nextProps.options.then(response => {
						//this.props.onElementFocused({ focused: true });
						this.setState(
							{
								loadingOptions: false,
								header: nextProps.header,
								datatype: nextProps.datatype,
								options: response.data,
								visible: this.getOptionsForValue(null, response.data)
							},
							() => {
								let inputRef = this.getInputRef();
								if (inputRef) {
									inputRef.focus();
								}
							}
						);
					});
				}
			);
		} else {
			let inputRef = this.getInputRef(),
				isValueEmpty = inputRef == undefined || inputRef.value == "";
			this.setState({
				options: nextProps.options,
				header: nextProps.header,
				datatype: nextProps.datatype,
				visible: this.getOptionsForValue(isValueEmpty ? null : inputRef.value, nextProps.options)
			});
		}
	}

	isOptionsLoading() {
		return this.state.loadingOptions;
	}

	_onOptionSelected(option) {
		if (option !== this.props.fuzzySearchEmptyMessage) {
			var nEntry = this.entryRef;
			nEntry.focus();
			if (typeof option == "object") {
				nEntry.value = option[this.props.fuzzySearchKeyAttribute];
			} else {
				nEntry.value = option;
			}
			this.setState({
				visible: this.getOptionsForValue(option, this.state.options),
				selection: option,
				entryValue: option
			});
			this.props.onOptionSelected(option);
		}
	}

	_getTypeaheadInput({classList, inputClassList}) {
		return (
		  <div className={classList}>
			{this.state.loadingOptions
			  ? this.props.renderLoading
				  ? this.props.renderLoading ()
				  : <div>Loading...</div>
			  : <span ref={ref => (this.inputRef = ref)} onFocus={this._onFocus}>
				  {this.state.datatype == 'custom'
					? <CustomQueryTokenizer
						ref={ref => (this.entryRef = ref)}
						type={this.state.datatype}
						placeholder={this.props.placeholder}
						defaultValue={this.state.entryValue}
						parentCallBack={this.props.parentCallBack}
						disabled={this.props.disabled}
						updatedInputText={this._onTextEntryUpdated}
						{...this.props}
					  />
					: <input
						ref={ref => (this.entryRef = ref)}
						type={this.state.datatype == 'number' ? 'number' : 'text'}
						placeholder={this.props.placeholder}
						className={inputClassList}
						defaultValue={this.state.entryValue}
						onChange={this._onTextEntryUpdated}
						onKeyDown={this._onKeyDown}
						disabled={this.props.disabled}
					  />}
				  {this._renderIncrementalSearchResults ()}
				</span>}
		  </div>
		);
	}
}
