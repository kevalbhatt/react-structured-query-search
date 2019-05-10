import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typeahead } from "./lib/react-structured-filter/react-typeahead/react-typeahead";

// Override the Tokenizer
export default class OTypeahead extends Typeahead {
	componentWillReceiveProps(nextProps) {
		if (nextProps.options instanceof Promise) {
			this.setState(
				{
					loadingOptions: true
				},
				() => {
					nextProps.options.then(response => {
						this.props.onElementFocused({ focused: true });
						this.setState(
							{
								loadingOptions: false,
								header: nextProps.header,
								datatype: nextProps.datatype,
								options: response.data,
								visible: this.getOptionsForValue(
									null,
									response.data
								)
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
				visible: this.getOptionsForValue((isValueEmpty ? null: inputRef.value), nextProps.options)
			});
		}
	}

	_getTypeaheadInput({ classList, inputClassList }) {
		return (
			<div className={classList}>
				{this.state.loadingOptions ? (
					this.props.loadingRender ? (
						this.props.loadingRender()
					) : (
						<div>Loading...</div>
					)
				) : (
					<span
						ref={ref => (this.inputRef = ref)}
						onFocus={this._onFocus}
					>
						<input
							ref={ref => (this.entryRef = ref)}
							type={this.state.datatype == "number" ? 'number' :'text'}
							placeholder={this.props.placeholder}
							className={inputClassList}
							defaultValue={this.state.entryValue}
							onChange={this._onTextEntryUpdated}
							onKeyDown={this._onKeyDown}
						/>
						{this._renderIncrementalSearchResults()}
					</span>
				)}
			</div>
		);
	}
}
