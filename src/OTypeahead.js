import React, { Component, Fragment } from "react";
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
			var nEntry = this.entryRef, val = option;
			nEntry.focus();
			if (typeof val == "object") {
				nEntry.value = val[this.props.fuzzySearchKeyAttribute];
			} else {
				if (val.includes('(')) {
					val = val.split('(')[0].trim();
				}
				nEntry.value = val;
			}
			this.setState({
				visible: this.getOptionsForValue(option, this.state.options),
				selection: val,
				entryValue: val
			});
			this.props.onOptionSelected(val);
		}
	}

	_getTypeaheadInput({classList, inputClassList}) {
                if (this.props.ediTableTokenId !== null) {
                        inputClassList += ' editMode';
                }
                var closeBtn = <a
                        ref={ ref => this.closeRef = ref}
                        className="typeahead-token-close"
                        href="javascript:void(0)"
                        onClick={(event) => {
                                if (this.props.updateParentToken) {
                                        this.props.updateParentToken();
                                } else {
                                        this.props.updatedToken();
                                }
                        event.preventDefault();
                        }}
                        >
                                &#x00d7;
                </a>;
                return (
                  <div className={classList}>
                        {this.state.loadingOptions
			  ? this.props.renderLoading
				  ? this.props.renderLoading ()
				  : <div>Loading...</div>
			  : <span ref={ref => (this.inputRef = ref)} onFocus={this._onFocus}>
				  {this.state.datatype == 'query'
					? 	<CustomQueryTokenizer
								ref={ref => (this.entryRef = ref)}
								type={this.state.datatype}
								placeholder={this.props.placeholder}
								defaultValue={this.state.entryValue}
								parentCallBack={this.props.parentCallBack}
								disabled={this.props.disabled}
								updatedInputText={this._onTextEntryUpdated}
                                                                defaultSelected={this.props.queryValueToEdit}
								{...this.props}
							/>
					: 	<Fragment>
							<input
								ref={ref => (this.entryRef = ref)}
								type={this.state.datatype == 'number' ? 'number' : 'text'}
								placeholder={this.props.placeholder}
								className={inputClassList}
								defaultValue={this.state.entryValue}
								onChange={this._onTextEntryUpdated}
								onKeyDown={this._onKeyDown}
								disabled={this.props.disabled}
							/>
							{this.props.ediTableTokenId !== null && this.props.ediTableTokenId !== undefined && closeBtn}
						</Fragment>
					}
				  {this._renderIncrementalSearchResults ()}
				</span>}
		  </div>
		);
	}
}
